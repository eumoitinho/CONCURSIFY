'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Flag,
  CheckCircle2,
  MoreVertical,
  Clock,
  Shield,
  Edit,
  Trash2,
  Reply
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { votePost } from '@/app/actions/forum'
import { toast } from 'sonner'

interface PostCardProps {
  post: {
    id: string
    content: string
    is_solution: boolean
    upvotes_count: number
    downvotes_count: number
    created_at: string
    status: string
    profiles: {
      full_name: string
      avatar_url?: string
    }
    parent_id?: string
  }
  threadAuthorId?: string
  currentUserId?: string
  userVote?: 'up' | 'down' | null
  canModerate?: boolean
  onReply?: (postId: string) => void
  onMarkSolution?: (postId: string) => void
  onReport?: (postId: string) => void
  className?: string
}

export function PostCard({
  post,
  threadAuthorId,
  currentUserId,
  userVote,
  canModerate = false,
  onReply,
  onMarkSolution,
  onReport,
  className
}: PostCardProps) {
  const [voting, setVoting] = useState(false)
  const [currentVote, setCurrentVote] = useState<'up' | 'down' | null>(userVote || null)
  const [upvotes, setUpvotes] = useState(post.upvotes_count)
  const [downvotes, setDownvotes] = useState(post.downvotes_count)

  const isAuthor = currentUserId === post.profiles.full_name // Simplificado - deveria comparar IDs
  const isThreadAuthor = threadAuthorId === post.profiles.full_name
  const isPending = post.status === 'under_review'

  const handleVote = async (voteType: 'up' | 'down') => {
    if (voting || !currentUserId) return

    setVoting(true)
    try {
      const result = await votePost({
        post_id: post.id,
        vote_type: voteType
      })

      if (result.success) {
        // Atualizar UI localmente
        if (currentVote === voteType) {
          // Removendo voto
          setCurrentVote(null)
          if (voteType === 'up') {
            setUpvotes(prev => prev - 1)
          } else {
            setDownvotes(prev => prev - 1)
          }
        } else {
          // Adicionando ou mudando voto
          if (currentVote) {
            // Mudando voto
            if (currentVote === 'up') {
              setUpvotes(prev => prev - 1)
              setDownvotes(prev => prev + 1)
            } else {
              setDownvotes(prev => prev - 1)
              setUpvotes(prev => prev + 1)
            }
          } else {
            // Adicionando novo voto
            if (voteType === 'up') {
              setUpvotes(prev => prev + 1)
            } else {
              setDownvotes(prev => prev + 1)
            }
          }
          setCurrentVote(voteType)
        }

        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Erro ao votar')
    } finally {
      setVoting(false)
    }
  }

  const formatContent = (content: string) => {
    // Simples formatação - em produção usaria um parser markdown
    return content
      .split('\n')
      .map((line, index) => (
        <p key={index} className={index > 0 ? 'mt-2' : ''}>
          {line}
        </p>
      ))
  }

  return (
    <Card className={`${post.parent_id ? 'ml-8 border-l-4 border-l-orange-300' : ''} ${className}`}>
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.profiles.avatar_url} />
              <AvatarFallback>
                {post.profiles.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Conteúdo do post */}
          <div className="flex-1 min-w-0">
            {/* Header do post */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {post.profiles.full_name || 'Usuário'}
                </span>

                {isThreadAuthor && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 border-2 shadow-[2px_2px_0px_0px_#2d2d2d] font-semibold">
                    <Edit className="h-3 w-3 mr-1" />
                    Autor
                  </Badge>
                )}

                {post.is_solution && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-500 border-2 shadow-[2px_2px_0px_0px_#2d2d2d] font-semibold">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Solução
                  </Badge>
                )}

                {isPending && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-500 border-2 shadow-[2px_2px_0px_0px_#2d2d2d] font-semibold">
                    <Shield className="h-3 w-3 mr-1" />
                    Em revisão
                  </Badge>
                )}

                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(post.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </div>
              </div>

              {/* Menu de ações */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onReply && (
                    <DropdownMenuItem onClick={() => onReply(post.id)}>
                      <Reply className="h-4 w-4 mr-2" />
                      Responder
                    </DropdownMenuItem>
                  )}
                  
                  {onReport && !isAuthor && (
                    <DropdownMenuItem onClick={() => onReport(post.id)}>
                      <Flag className="h-4 w-4 mr-2" />
                      Reportar
                    </DropdownMenuItem>
                  )}

                  {onMarkSolution && isThreadAuthor && !post.is_solution && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onMarkSolution(post.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Marcar como solução
                      </DropdownMenuItem>
                    </>
                  )}

                  {(isAuthor || canModerate) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Conteúdo */}
            <div className="prose prose-sm max-w-none mb-4">
              <div className="text-gray-700">
                {formatContent(post.content)}
              </div>
            </div>

            {/* Ações do post */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Botões de voto */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote('up')}
                    disabled={voting || !currentUserId}
                    className={`h-8 px-2 ${
                      currentVote === 'up' 
                        ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                        : 'text-gray-500 hover:text-green-600'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {upvotes}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote('down')}
                    disabled={voting || !currentUserId}
                    className={`h-8 px-2 ${
                      currentVote === 'down' 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'text-gray-500 hover:text-red-600'
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    {downvotes}
                  </Button>
                </div>

                {/* Botão de resposta */}
                {onReply && currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReply(post.id)}
                    className="h-8 text-gray-500 hover:text-blue-600"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Responder
                  </Button>
                )}
              </div>

              {/* Score geral */}
              <div className="text-sm text-gray-500">
                Score: {upvotes - downvotes}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}