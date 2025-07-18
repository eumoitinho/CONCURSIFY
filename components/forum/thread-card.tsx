'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  MessageCircle,
  Eye,
  Pin,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  Hash,
  Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ThreadCardProps {
  thread: {
    id: string
    title: string
    slug: string
    type: 'discussion' | 'question' | 'study_group' | 'announcement' | 'doubt'
    status: string
    is_pinned: boolean
    is_solved: boolean
    views_count: number
    posts_count: number
    last_post_at: string
    tags: string[]
    created_at: string
    forum_categories: {
      name: string
      slug: string
      color: string
      icon: string
    }
    profiles: {
      full_name: string
      avatar_url?: string
    }
    last_poster?: {
      full_name: string
      avatar_url?: string
    }
  }
  showCategory?: boolean
  compact?: boolean
  className?: string
}

const getThreadTypeInfo = (type: string) => {
  switch (type) {
    case 'question':
      return { label: 'Pergunta', color: 'bg-[#FFB08A]/30 text-[#E55A2B]', icon: '❓' }
    case 'discussion':
      return { label: 'Discussão', color: 'bg-gray-100 text-gray-800', icon: '💬' }
    case 'study_group':
      return { label: 'Grupo de Estudo', color: 'bg-[#FF723A]/20 text-[#E55A2B]', icon: '👥' }
    case 'announcement':
      return { label: 'Anúncio', color: 'bg-[#E55A2B]/20 text-[#E55A2B]', icon: '📢' }
    case 'doubt':
      return { label: 'Dúvida', color: 'bg-amber-100 text-amber-800', icon: '🤔' }
    default:
      return { label: 'Discussão', color: 'bg-gray-100 text-gray-800', icon: '💬' }
  }
}

export function ThreadCard({ thread, showCategory = true, compact = false, className }: ThreadCardProps) {
  const typeInfo = getThreadTypeInfo(thread.type)
  const isNew = new Date(thread.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Último dia

  if (compact) {
    return (
      <div className={`flex items-center justify-between py-3 px-4 hover:bg-gray-50 border-b border-gray-100 ${className}`}>
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {thread.is_pinned && (
            <Pin className="h-4 w-4 text-amber-500 flex-shrink-0" />
          )}
          
          <div className="flex-1 min-w-0">
            <Link 
              href={`/forum/thread/${thread.slug}`}
              className="text-sm font-medium text-gray-900 hover:text-[#FF723A] line-clamp-1"
            >
              {thread.title}
            </Link>
            
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className={`text-xs ${typeInfo.color}`}>
                {typeInfo.icon} {typeInfo.label}
              </Badge>
              
              {thread.is_solved && (
                <Badge variant="outline" className="text-xs bg-[#FF723A]/20 text-[#E55A2B]">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Resolvido
                </Badge>
              )}

              {showCategory && (
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    borderColor: thread.forum_categories.color,
                    color: thread.forum_categories.color 
                  }}
                >
                  {thread.forum_categories.name}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs text-gray-500 flex-shrink-0">
          <div className="flex items-center space-x-1">
            <MessageCircle className="h-3 w-3" />
            <span>{thread.posts_count}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>{thread.views_count}</span>
          </div>

          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(thread.last_post_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header com badges */}
            <div className="flex items-center space-x-2 flex-wrap">
              {thread.is_pinned && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <Pin className="h-3 w-3 mr-1" />
                  Fixado
                </Badge>
              )}
              
              <Badge variant="outline" className={`${typeInfo.color}`}>
                {typeInfo.icon} {typeInfo.label}
              </Badge>
              
              {thread.is_solved && (
                <Badge variant="outline" className="bg-[#FF723A]/20 text-[#E55A2B] border-[#FF723A]/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Resolvido
                </Badge>
              )}

              {isNew && (
                <Badge variant="outline" className="bg-[#FFB08A]/30 text-[#E55A2B] border-[#FFB08A]">
                  Novo
                </Badge>
              )}

              {showCategory && (
                <Badge 
                  variant="outline" 
                  style={{ 
                    backgroundColor: `${thread.forum_categories.color}15`,
                    borderColor: thread.forum_categories.color,
                    color: thread.forum_categories.color 
                  }}
                >
                  {thread.forum_categories.name}
                </Badge>
              )}
            </div>

            {/* Título */}
            <div>
              <Link 
                href={`/forum/thread/${thread.slug}`}
                className="text-lg font-semibold text-gray-900 hover:text-[#FF723A] line-clamp-2 block"
              >
                {thread.title}
              </Link>
            </div>

            {/* Tags */}
            {thread.tags && thread.tags.length > 0 && (
              <div className="flex items-center space-x-1 flex-wrap">
                <Hash className="h-3 w-3 text-gray-400" />
                {thread.tags.slice(0, 4).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {thread.tags.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{thread.tags.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Metadados */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={thread.profiles.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {thread.profiles.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{thread.profiles.full_name || 'Usuário'}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(thread.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{thread.posts_count}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{thread.views_count}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Última atividade */}
          <div className="ml-6 flex-shrink-0 text-right">
            <div className="text-xs text-gray-500 mb-1">Última atividade</div>
            
            {thread.last_poster && (
              <div className="flex items-center space-x-2 mb-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={thread.last_poster.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {thread.last_poster.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-gray-700">
                  {thread.last_poster.full_name || 'Usuário'}
                </span>
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(thread.last_post_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </div>

            <Link 
              href={`/forum/thread/${thread.slug}`}
              className="inline-flex items-center text-[#FF723A] hover:text-[#E55A2B] text-xs mt-2"
            >
              Ver thread
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}