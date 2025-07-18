'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus, X, Loader2, AlertCircle, Tag } from 'lucide-react'
import { createThread } from '@/app/actions/forum'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CreateThreadDialogProps {
  categories: Array<{
    id: string
    name: string
    slug: string
    color: string
    icon: string
  }>
  defaultCategoryId?: string
  trigger?: React.ReactNode
}

export function CreateThreadDialog({ 
  categories, 
  defaultCategoryId, 
  trigger 
}: CreateThreadDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: defaultCategoryId || '',
    type: 'discussion' as 'discussion' | 'question' | 'study_group' | 'announcement' | 'doubt',
    tags: [] as string[]
  })
  const [currentTag, setCurrentTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const threadTypes = [
    { value: 'discussion', label: 'Discussão', description: 'Discussão geral sobre o tópico' },
    { value: 'question', label: 'Pergunta', description: 'Pergunta que precisa de resposta' },
    { value: 'doubt', label: 'Dúvida', description: 'Dúvida específica sobre estudos' },
    { value: 'study_group', label: 'Grupo de Estudo', description: 'Formar ou participar de grupo' },
    { value: 'announcement', label: 'Anúncio', description: 'Anúncio importante' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const result = await createThread(formData)

      if (result.success) {
        toast.success(result.message)
        setOpen(false)
        setFormData({
          title: '',
          content: '',
          category_id: defaultCategoryId || '',
          type: 'discussion',
          tags: []
        })
        
        // Redirecionar para a thread criada
        if (result.data?.slug) {
          router.push(`/forum/thread/${result.data.slug}`)
        } else {
          router.refresh()
        }
      } else {
        if (result.requiresUpgrade) {
          toast.error(result.error, {
            action: {
              label: 'Fazer Upgrade',
              onClick: () => router.push('/pricing')
            }
          })
        } else {
          toast.error(result.error)
        }
      }
    } catch (error) {
      toast.error('Erro ao criar thread')
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim().toLowerCase()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const selectedCategory = categories.find(cat => cat.id === formData.category_id)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Thread
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Thread</DialogTitle>
          <DialogDescription>
            Crie uma nova discussão para compartilhar conhecimentos e tirar dúvidas com a comunidade.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory && (
              <div className="text-sm text-gray-500">
                📁 {selectedCategory.name}
              </div>
            )}
          </div>

          {/* Tipo da Thread */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo da Thread *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {threadTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Digite um título claro e descritivo..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <div className="flex items-center text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.title}
              </div>
            )}
            <div className="text-xs text-gray-500">
              {formData.title.length}/200 caracteres
            </div>
          </div>

          {/* Conteúdo */}
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo *</Label>
            <Textarea
              id="content"
              placeholder="Descreva sua dúvida, discussão ou compartilhe conhecimento..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className={`min-h-[120px] ${errors.content ? 'border-red-500' : ''}`}
            />
            {errors.content && (
              <div className="flex items-center text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.content}
              </div>
            )}
            <div className="text-xs text-gray-500">
              {formData.content.length}/10000 caracteres
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (opcional)</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Adicionar tag..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!currentTag.trim() || formData.tags.length >= 5}
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              Tags ajudam outros usuários a encontrar sua thread. Máximo 5 tags.
            </div>
          </div>

          {/* Diretrizes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📝 Diretrizes da Comunidade</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Seja respeitoso e construtivo</li>
              <li>• Use títulos claros e descritivos</li>
              <li>• Escolha a categoria correta</li>
              <li>• Evite spam e autopromoção excessiva</li>
              <li>• Verifique se sua dúvida já foi respondida</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title || !formData.content || !formData.category_id}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Thread
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}