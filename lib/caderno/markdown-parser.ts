import { marked } from 'marked'
import { z } from 'zod'

// Schema para links bidirecionais
const WikiLinkSchema = z.object({
  text: z.string(),
  alias: z.string().optional(),
  type: z.enum(['note', 'block', 'heading']),
  line: z.number(),
  start: z.number(),
  end: z.number()
})

// Schema para blocos referenciados
const BlockReferenceSchema = z.object({
  noteTitle: z.string(),
  blockId: z.string(),
  line: z.number(),
  start: z.number(),
  end: z.number()
})

// Schema para tags
const TagSchema = z.object({
  tag: z.string(),
  line: z.number(),
  start: z.number(),
  end: z.number()
})

export type WikiLink = z.infer<typeof WikiLinkSchema>
export type BlockReference = z.infer<typeof BlockReferenceSchema>
export type Tag = z.infer<typeof TagSchema>

export interface MarkdownParseResult {
  html: string
  wikiLinks: WikiLink[]
  blockReferences: BlockReference[]
  tags: Tag[]
  headings: Array<{
    level: number
    text: string
    id: string
    line: number
  }>
  blocks: Array<{
    id: string
    content: string
    type: string
    line: number
  }>
  wordCount: number
  characterCount: number
  readingTime: number
}

export class MarkdownParser {
  private renderer: marked.Renderer

  constructor() {
    this.renderer = new marked.Renderer()
    this.setupRenderer()
    this.setupMarked()
  }

  private setupRenderer() {
    // Custom renderer para wiki links
    const originalLink = this.renderer.link
    this.renderer.link = function(href, title, text) {
      // Se for um wiki link, renderizar diferente
      if (href?.startsWith('wiki://')) {
        const noteTitle = href.replace('wiki://', '')
        const alias = text !== noteTitle ? text : undefined
        return `<a href="/caderno/${encodeURIComponent(noteTitle)}" class="wiki-link" data-note="${noteTitle}" data-alias="${alias || ''}">${text}</a>`
      }
      
      // Se for uma referência de bloco
      if (href?.startsWith('block://')) {
        const [noteTitle, blockId] = href.replace('block://', '').split('#')
        return `<a href="/caderno/${encodeURIComponent(noteTitle)}#${blockId}" class="block-reference" data-note="${noteTitle}" data-block="${blockId}">${text}</a>`
      }

      return originalLink.call(this, href, title, text)
    }

    // Custom renderer para headings com IDs
    this.renderer.heading = function(text, level, rawtext) {
      const id = rawtext.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      
      return `<h${level} id="${id}" class="heading-with-id">${text}</h${level}>\n`
    }

    // Custom renderer para blocos com IDs
    this.renderer.paragraph = function(text) {
      // Verificar se tem block ID no final ^block-id
      const blockIdMatch = text.match(/^(.+?)\s*\^([a-zA-Z0-9-]+)$/)
      if (blockIdMatch) {
        const content = blockIdMatch[1]
        const blockId = blockIdMatch[2]
        return `<p id="^${blockId}" class="block-with-id" data-block-id="${blockId}">${content}</p>\n`
      }
      
      return `<p>${text}</p>\n`
    }

    // Custom renderer para tags
    this.renderer.text = function(text) {
      // Renderizar tags #tag
      return text.replace(/#(\w+)/g, '<span class="tag" data-tag="$1">#$1</span>')
    }
  }

  private setupMarked() {
    marked.setOptions({
      renderer: this.renderer,
      gfm: true,
      breaks: true,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: true
    })
  }

  async parseMarkdown(content: string): Promise<MarkdownParseResult> {
    // Pré-processar o conteúdo para converter wiki links
    const preprocessedContent = this.preprocessContent(content)
    
    // Extrair elementos antes de renderizar
    const wikiLinks = this.extractWikiLinks(content)
    const blockReferences = this.extractBlockReferences(content)
    const tags = this.extractTags(content)
    const headings = this.extractHeadings(content)
    const blocks = this.extractBlocks(content)
    
    // Renderizar HTML
    const html = await marked.parse(preprocessedContent)
    
    // Calcular estatísticas
    const stats = this.calculateStats(content)

    return {
      html,
      wikiLinks,
      blockReferences,
      tags,
      headings,
      blocks,
      ...stats
    }
  }

  private preprocessContent(content: string): string {
    return content
      // Converter wiki links [[nota]] para markdown links
      .replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (match, noteTitle, _, alias) => {
        const linkText = alias || noteTitle
        return `[${linkText}](wiki://${noteTitle})`
      })
      // Converter referências de bloco ![[nota#^block-id]]
      .replace(/!\[\[([^#\]]+)#\^([^\]]+)\]\]/g, (match, noteTitle, blockId) => {
        return `[${noteTitle} (bloco)](block://${noteTitle}#${blockId})`
      })
      // Converter embeds de imagem ![[imagem.png]]
      .replace(/!\[\[([^[\]]+\.(png|jpg|jpeg|gif|svg|webp))\]\]/gi, (match, filename) => {
        return `![${filename}](/api/attachments/${encodeURIComponent(filename)})`
      })
  }

  private extractWikiLinks(content: string): WikiLink[] {
    const wikiLinks: WikiLink[] = []
    const lines = content.split('\n')
    
    lines.forEach((line, lineIndex) => {
      const regex = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g
      let match
      
      while ((match = regex.exec(line)) !== null) {
        const noteTitle = match[1]
        const alias = match[3]
        
        wikiLinks.push({
          text: noteTitle,
          alias,
          type: 'note',
          line: lineIndex + 1,
          start: match.index,
          end: match.index + match[0].length
        })
      }
    })
    
    return wikiLinks
  }

  private extractBlockReferences(content: string): BlockReference[] {
    const blockRefs: BlockReference[] = []
    const lines = content.split('\n')
    
    lines.forEach((line, lineIndex) => {
      const regex = /!\[\[([^#\]]+)#\^([^\]]+)\]\]/g
      let match
      
      while ((match = regex.exec(line)) !== null) {
        const noteTitle = match[1]
        const blockId = match[2]
        
        blockRefs.push({
          noteTitle,
          blockId,
          line: lineIndex + 1,
          start: match.index,
          end: match.index + match[0].length
        })
      }
    })
    
    return blockRefs
  }

  private extractTags(content: string): Tag[] {
    const tags: Tag[] = []
    const lines = content.split('\n')
    
    lines.forEach((line, lineIndex) => {
      const regex = /#(\w+)/g
      let match
      
      while ((match = regex.exec(line)) !== null) {
        tags.push({
          tag: match[1],
          line: lineIndex + 1,
          start: match.index,
          end: match.index + match[0].length
        })
      }
    })
    
    return tags
  }

  private extractHeadings(content: string): Array<{ level: number; text: string; id: string; line: number }> {
    const headings: Array<{ level: number; text: string; id: string; line: number }> = []
    const lines = content.split('\n')
    
    lines.forEach((line, lineIndex) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2]
        const id = text.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim()
        
        headings.push({
          level,
          text,
          id,
          line: lineIndex + 1
        })
      }
    })
    
    return headings
  }

  private extractBlocks(content: string): Array<{ id: string; content: string; type: string; line: number }> {
    const blocks: Array<{ id: string; content: string; type: string; line: number }> = []
    const lines = content.split('\n')
    
    lines.forEach((line, lineIndex) => {
      // Buscar por blocos com ID ^block-id
      const match = line.match(/^(.+?)\s*\^([a-zA-Z0-9-]+)$/)
      if (match) {
        const content = match[1].trim()
        const blockId = match[2]
        
        blocks.push({
          id: blockId,
          content,
          type: this.determineBlockType(content),
          line: lineIndex + 1
        })
      }
    })
    
    return blocks
  }

  private determineBlockType(content: string): string {
    if (content.startsWith('#')) return 'heading'
    if (content.startsWith('- ') || content.startsWith('* ')) return 'list'
    if (content.startsWith('> ')) return 'quote'
    if (content.match(/^\d+\. /)) return 'numbered-list'
    if (content.startsWith('```')) return 'code'
    return 'paragraph'
  }

  private calculateStats(content: string): { wordCount: number; characterCount: number; readingTime: number } {
    // Remover markdown e contar palavras
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\[\[([^\]]+)\]\]/g, '$1') // Remove wiki links
      .replace(/#\w+/g, '') // Remove tags
      .trim()

    const words = plainText.split(/\s+/).filter(word => word.length > 0)
    const wordCount = words.length
    const characterCount = content.length
    const readingTime = Math.max(1, Math.round(wordCount / 200)) // 200 WPM

    return {
      wordCount,
      characterCount,
      readingTime
    }
  }

  // Método para gerar sugestões de links baseado no conteúdo
  suggestLinks(content: string, availableNotes: Array<{ title: string; tags: string[] }>): string[] {
    const suggestions: string[] = []
    const words = content.toLowerCase().split(/\s+/)
    
    availableNotes.forEach(note => {
      const titleWords = note.title.toLowerCase().split(/\s+/)
      
      // Verificar se palavras do título aparecem no conteúdo
      const titleWordsInContent = titleWords.filter(word => 
        words.some(contentWord => contentWord.includes(word) && word.length > 3)
      )
      
      if (titleWordsInContent.length >= Math.min(2, titleWords.length)) {
        suggestions.push(note.title)
      }
      
      // Verificar tags
      note.tags.forEach(tag => {
        if (words.some(word => word.includes(tag.toLowerCase()) && tag.length > 3)) {
          suggestions.push(note.title)
        }
      })
    })
    
    return [...new Set(suggestions)] // Remove duplicatas
  }

  // Método para gerar outline da nota
  generateOutline(content: string): Array<{ level: number; text: string; id: string; children: any[] }> {
    const headings = this.extractHeadings(content)
    const outline: any[] = []
    const stack: any[] = []
    
    headings.forEach(heading => {
      const item = {
        level: heading.level,
        text: heading.text,
        id: heading.id,
        children: []
      }
      
      // Encontrar o pai correto na hierarquia
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop()
      }
      
      if (stack.length === 0) {
        outline.push(item)
      } else {
        stack[stack.length - 1].children.push(item)
      }
      
      stack.push(item)
    })
    
    return outline
  }
}

// Instância singleton
export const markdownParser = new MarkdownParser()