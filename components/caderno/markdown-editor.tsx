'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link,
  Image,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  EyeOff,
  Save,
  FileText,
  Hash,
  LinkIcon,
  Clock,
  BookOpen,
  Star,
  Pin,
  MoreVertical
} from 'lucide-react'
import { toast } from 'sonner'
import { markdownParser } from '@/lib/caderno/markdown-parser'
import { updateNote } from '@/app/actions/caderno'
import { useDebounce } from '@/hooks/use-debounce'

interface MarkdownEditorProps {
  note: {
    id: string
    title: string
    content: string
    tags: string[]
    word_count: number
    read_time_minutes: number
    is_pinned: boolean
    is_favorite: boolean
    view_mode: 'edit' | 'preview' | 'split'
    updated_at: string
  }
  onSave?: (note: any) => void
  onTitleChange?: (title: string) => void
  className?: string
}

export function MarkdownEditor({ 
  note, 
  onSave, 
  onTitleChange, 
  className 
}: MarkdownEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [tags, setTags] = useState<string[]>(note.tags || [])
  const [currentTag, setCurrentTag] = useState('')
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>(note.view_mode)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [htmlPreview, setHtmlPreview] = useState('')
  const [parseResult, setParseResult] = useState<any>(null)
  const [cursorPosition, setCursorPosition] = useState(0)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debouncedContent = useDebounce(content, 2000) // Auto-save a cada 2 segundos
  const debouncedTitle = useDebounce(title, 1000)

  // Auto-save quando conteúdo ou título mudam
  useEffect(() => {
    if (debouncedContent !== note.content || debouncedTitle !== note.title) {
      handleSave(false) // Save silencioso
    }
  }, [debouncedContent, debouncedTitle])

  // Processar markdown quando conteúdo muda
  useEffect(() => {
    const processMarkdown = async () => {
      try {
        const result = await markdownParser.parseMarkdown(content)
        setHtmlPreview(result.html)
        setParseResult(result)
      } catch (error) {
        console.error('Erro ao processar markdown:', error)
      }
    }

    if (content) {
      processMarkdown()
    }
  }, [content])

  const handleSave = async (showToast: boolean = true) => {
    setSaving(true)
    try {
      const result = await updateNote({
        id: note.id,
        title: title,
        content: content,
        tags: tags,
        view_mode: viewMode
      })

      if (result.success) {
        setLastSaved(new Date())
        if (showToast) {
          toast.success('Nota salva com sucesso!')
        }
        onSave?.(result.data)
      } else {
        if (showToast) {
          toast.error(result.error)
        }
      }
    } catch (error) {
      if (showToast) {
        toast.error('Erro ao salvar nota')
      }
    } finally {
      setSaving(false)
    }
  }

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    const newText = before + selectedText + after
    const newContent = content.substring(0, start) + newText + content.substring(end)
    
    setContent(newContent)
    
    // Restaurar cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 10) {
      setTags([...tags, currentTag.trim().toLowerCase()])
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const formatShortcuts = [
    { icon: Bold, action: () => insertText('**', '**'), tooltip: 'Negrito (Ctrl+B)', shortcut: 'Ctrl+B' },
    { icon: Italic, action: () => insertText('*', '*'), tooltip: 'Itálico (Ctrl+I)', shortcut: 'Ctrl+I' },
    { icon: Strikethrough, action: () => insertText('~~', '~~'), tooltip: 'Tachado', shortcut: '' },
    { icon: Code, action: () => insertText('`', '`'), tooltip: 'Código inline', shortcut: '' },
    { icon: Heading1, action: () => insertText('# '), tooltip: 'Título 1', shortcut: '' },
    { icon: Heading2, action: () => insertText('## '), tooltip: 'Título 2', shortcut: '' },
    { icon: Heading3, action: () => insertText('### '), tooltip: 'Título 3', shortcut: '' },
    { icon: List, action: () => insertText('- '), tooltip: 'Lista', shortcut: '' },
    { icon: ListOrdered, action: () => insertText('1. '), tooltip: 'Lista numerada', shortcut: '' },
    { icon: Quote, action: () => insertText('> '), tooltip: 'Citação', shortcut: '' },
    { icon: Link, action: () => insertText('[', '](url)'), tooltip: 'Link', shortcut: '' },
    { icon: Image, action: () => insertText('![', '](url)'), tooltip: 'Imagem', shortcut: '' },
  ]

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1 min-w-0 mr-4">
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              onTitleChange?.(e.target.value)
            }}
            placeholder="Título da nota..."
            className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-0"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Status de salvamento */}
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            {saving ? (
              <>
                <Clock className="h-3 w-3 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : lastSaved ? (
              <>
                <Clock className="h-3 w-3" />
                <span>Salvo às {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : null}
          </div>

          {/* Botão salvar manual */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-1" />
            Salvar
          </Button>

          {/* Toggle de modo de visualização */}
          <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="edit">Editar</TabsTrigger>
              <TabsTrigger value="split">Dividido</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center space-x-1 p-2 border-b bg-gray-50">
        <TooltipProvider>
          {formatShortcuts.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={item.action}
                  className="h-8 w-8 p-0"
                >
                  <item.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.tooltip}</p>
                {item.shortcut && (
                  <p className="text-xs text-gray-500">{item.shortcut}</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>

        <Separator orientation="vertical" className="h-6" />

        {/* Inserir Wiki Link */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertText('[[', ']]')}
              className="h-8 px-2"
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              [[Link]]
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Inserir Wiki Link</p>
          </TooltipContent>
        </Tooltip>

        {/* Inserir Tag */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertText('#')}
              className="h-8 px-2"
            >
              <Hash className="h-4 w-4 mr-1" />
              Tag
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Inserir Tag</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Editor/Preview */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={viewMode} className="h-full">
          {/* Modo Editar */}
          <TabsContent value="edit" className="h-full m-0">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setCursorPosition(e.target.selectionStart)
              }}
              placeholder="Digite seu conteúdo em Markdown..."
              className="h-full resize-none border-none shadow-none focus-visible:ring-0 font-mono text-sm"
              style={{ minHeight: 'calc(100vh - 200px)' }}
            />
          </TabsContent>

          {/* Modo Dividido */}
          <TabsContent value="split" className="h-full m-0">
            <div className="grid grid-cols-2 gap-4 h-full p-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Markdown</h3>
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Digite seu conteúdo em Markdown..."
                  className="h-full resize-none font-mono text-sm"
                  style={{ minHeight: 'calc(100vh - 250px)' }}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Preview</h3>
                <div 
                  className="prose prose-sm max-w-none h-full overflow-y-auto border rounded-md p-4"
                  style={{ minHeight: 'calc(100vh - 250px)' }}
                  dangerouslySetInnerHTML={{ __html: htmlPreview }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Modo Preview */}
          <TabsContent value="preview" className="h-full m-0">
            <div className="h-full p-4 overflow-y-auto">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlPreview }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer com metadados */}
      <div className="border-t bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          {/* Tags */}
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4 text-gray-400" />
            <div className="flex items-center space-x-1 flex-wrap">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              <Input
                placeholder="Nova tag..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-24 h-6 text-xs"
              />
            </div>
          </div>

          {/* Estatísticas */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <FileText className="h-3 w-3" />
              <span>{parseResult?.wordCount || 0} palavras</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="h-3 w-3" />
              <span>{parseResult?.readingTime || 0} min de leitura</span>
            </div>
            {parseResult?.wikiLinks?.length > 0 && (
              <div className="flex items-center space-x-1">
                <LinkIcon className="h-3 w-3" />
                <span>{parseResult.wikiLinks.length} links</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}