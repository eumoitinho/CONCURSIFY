'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Filter,
  Search,
  Maximize2,
  Settings,
  FileText,
  Link as LinkIcon,
  Hash
} from 'lucide-react'
import * as d3 from 'd3'

interface GraphNode {
  id: string
  title: string
  type: 'note' | 'tag' | 'folder'
  size: number // Baseado no word_count ou links
  color: string
  tags?: string[]
  wordCount?: number
  linkCount?: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  type: 'wiki_link' | 'tag_link' | 'folder_link'
  strength: number
  label?: string
}

interface NoteGraphProps {
  notes: Array<{
    id: string
    title: string
    slug: string
    tags: string[]
    word_count: number
    folder_path: string
    outgoing_links?: Array<{
      target_note: { title: string; slug: string }
      link_text: string
    }>
    incoming_links?: Array<{
      source_note: { title: string; slug: string }
      link_text: string
    }>
  }>
  onNodeClick?: (node: GraphNode) => void
  onLinkClick?: (link: GraphLink) => void
  height?: number
  className?: string
}

export function NoteGraph({
  notes,
  onNodeClick,
  onLinkClick,
  height = 600,
  className
}: NoteGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [zoom, setZoom] = useState(1)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'notes' | 'tags'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showLabels, setShowLabels] = useState(true)
  const [linkDistance, setLinkDistance] = useState([100])
  const [chargeStrength, setChargeStrength] = useState([-300])

  const processGraphData = () => {
    const nodes: GraphNode[] = []
    const links: GraphLink[] = []
    const nodeMap = new Map<string, GraphNode>()

    // Criar nós para as notas
    notes.forEach(note => {
      const linkCount = (note.outgoing_links?.length || 0) + (note.incoming_links?.length || 0)
      const node: GraphNode = {
        id: note.id,
        title: note.title,
        type: 'note',
        size: Math.max(5, Math.min(20, (note.word_count || 0) / 50 + linkCount * 2)),
        color: getNodeColor('note', linkCount),
        tags: note.tags,
        wordCount: note.word_count,
        linkCount: linkCount
      }
      nodes.push(node)
      nodeMap.set(note.id, node)
      nodeMap.set(note.title, node) // Para busca por título
    })

    // Criar nós para tags (se necessário)
    if (filterType === 'all' || filterType === 'tags') {
      const tagCounts = new Map<string, number>()
      notes.forEach(note => {
        note.tags?.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        })
      })

      tagCounts.forEach((count, tag) => {
        if (count > 1) { // Apenas tags usadas em múltiplas notas
          const tagNode: GraphNode = {
            id: `tag:${tag}`,
            title: `#${tag}`,
            type: 'tag',
            size: Math.max(3, Math.min(15, count * 2)),
            color: getNodeColor('tag', count)
          }
          nodes.push(tagNode)
          nodeMap.set(tagNode.id, tagNode)
        }
      })
    }

    // Criar links entre notas
    notes.forEach(note => {
      const sourceNode = nodeMap.get(note.id)
      if (!sourceNode) return

      // Links saindo desta nota
      note.outgoing_links?.forEach(link => {
        const targetNode = nodeMap.get(link.target_note.title)
        if (targetNode && targetNode.id !== sourceNode.id) {
          links.push({
            source: sourceNode.id,
            target: targetNode.id,
            type: 'wiki_link',
            strength: 1,
            label: link.link_text
          })
        }
      })

      // Links para tags (se estiver mostrando tags)
      if (filterType === 'all' || filterType === 'tags') {
        note.tags?.forEach(tag => {
          const tagNode = nodeMap.get(`tag:${tag}`)
          if (tagNode) {
            links.push({
              source: sourceNode.id,
              target: tagNode.id,
              type: 'tag_link',
              strength: 0.5
            })
          }
        })
      }
    })

    // Filtrar por termo de busca
    let filteredNodes = nodes
    let filteredLinks = links

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filteredNodes = nodes.filter(node => 
        node.title.toLowerCase().includes(searchLower) ||
        node.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
      
      const nodeIds = new Set(filteredNodes.map(n => n.id))
      filteredLinks = links.filter(link => 
        nodeIds.has(typeof link.source === 'string' ? link.source : link.source.id) &&
        nodeIds.has(typeof link.target === 'string' ? link.target : link.target.id)
      )
    }

    return { nodes: filteredNodes, links: filteredLinks }
  }

  const getNodeColor = (type: string, value: number): string => {
    switch (type) {
      case 'note':
        if (value > 5) return '#3b82f6' // Azul para notas bem conectadas
        if (value > 2) return '#6366f1' // Índigo para notas conectadas
        return '#94a3b8' // Cinza para notas isoladas
      case 'tag':
        return '#10b981' // Verde para tags
      case 'folder':
        return '#f59e0b' // Amarelo para pastas
      default:
        return '#94a3b8'
    }
  }

  const initializeGraph = () => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svg.node()?.clientWidth || 800
    const graphHeight = height

    const { nodes, links } = processGraphData()

    if (nodes.length === 0) return

    // Configurar simulação de força
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(linkDistance[0]))
      .force('charge', d3.forceManyBody().strength(chargeStrength[0]))
      .force('center', d3.forceCenter(width / 2, graphHeight / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.size + 2))

    // Configurar zoom
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
        setZoom(event.transform.k)
      })

    svg.call(zoomBehavior as any)

    // Container principal
    const container = svg.append('g')

    // Criar definições para setas
    const defs = svg.append('defs')
    defs.selectAll('marker')
      .data(['wiki_link', 'tag_link'])
      .enter()
      .append('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', d => d === 'wiki_link' ? '#6b7280' : '#10b981')

    // Criar links
    const link = container.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => d.type === 'wiki_link' ? '#6b7280' : '#10b981')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.strength * 2))
      .attr('marker-end', d => `url(#arrow-${d.type})`)

    // Criar nós
    const node = container.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<any, any>()
        .on('start', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d: any) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )

    // Círculos dos nós
    node.append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)

    // Labels dos nós
    if (showLabels) {
      node.append('text')
        .text(d => d.title.length > 20 ? d.title.substring(0, 20) + '...' : d.title)
        .attr('x', d => d.size + 5)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .style('fill', '#374151')
        .style('pointer-events', 'none')
    }

    // Eventos de clique
    node.on('click', (event, d) => {
      setSelectedNode(d)
      onNodeClick?.(d)
    })

    link.on('click', (event, d) => {
      onLinkClick?.(d)
    })

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'graph-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')

    node.on('mouseover', (event, d) => {
      tooltip.style('visibility', 'visible')
        .html(`
          <strong>${d.title}</strong><br/>
          Tipo: ${d.type}<br/>
          ${d.wordCount ? `Palavras: ${d.wordCount}<br/>` : ''}
          ${d.linkCount ? `Links: ${d.linkCount}` : ''}
        `)
    })
    .on('mousemove', (event) => {
      tooltip.style('top', (event.pageY - 10) + 'px')
        .style('left', (event.pageX + 10) + 'px')
    })
    .on('mouseout', () => {
      tooltip.style('visibility', 'hidden')
    })

    // Atualizar posições na simulação
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // Cleanup
    return () => {
      simulation.stop()
      tooltip.remove()
    }
  }

  useEffect(() => {
    initializeGraph()
  }, [notes, filterType, searchTerm, showLabels, linkDistance, chargeStrength])

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      1.2
    )
  }

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      0.8
    )
  }

  const handleReset = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    )
    setZoom(1)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <LinkIcon className="h-5 w-5" />
            <span>Grafo de Conhecimento</span>
          </CardTitle>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Badge variant="secondary">
              Zoom: {(zoom * 100).toFixed(0)}%
            </Badge>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2 py-1 text-sm border rounded"
            />
          </div>

          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="notes">Notas</SelectItem>
              <SelectItem value="tags">Tags</SelectItem>
            </SelectContent>
          </Select>

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
            />
            <span>Mostrar labels</span>
          </label>
        </div>

        {/* Configurações avançadas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block mb-1">Distância dos links: {linkDistance[0]}</label>
            <Slider
              value={linkDistance}
              onValueChange={setLinkDistance}
              min={50}
              max={200}
              step={10}
            />
          </div>
          <div>
            <label className="block mb-1">Força de repulsão: {Math.abs(chargeStrength[0])}</label>
            <Slider
              value={chargeStrength.map(v => Math.abs(v))}
              onValueChange={(value) => setChargeStrength(value.map(v => -v))}
              min={100}
              max={500}
              step={50}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          <svg
            ref={svgRef}
            width="100%"
            height={height}
            className="border"
          />

          {/* Info do nó selecionado */}
          {selectedNode && (
            <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border max-w-xs">
              <h3 className="font-medium text-sm mb-2">{selectedNode.title}</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>Tipo: {selectedNode.type}</span>
                </div>
                {selectedNode.wordCount && (
                  <div>Palavras: {selectedNode.wordCount}</div>
                )}
                {selectedNode.linkCount && (
                  <div>Conexões: {selectedNode.linkCount}</div>
                )}
                {selectedNode.tags && selectedNode.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedNode.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}