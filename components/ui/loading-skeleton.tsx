"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button'
  lines?: number
}

export function Skeleton({ 
  className, 
  variant = 'default',
  lines = 1,
  ...props 
}: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  const baseClasses = "animate-pulse bg-muted rounded-md"
  
  const variants = {
    default: "h-4 w-full",
    card: "h-32 w-full",
    text: "h-4",
    avatar: "h-10 w-10 rounded-full",
    button: "h-10 w-24"
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variants.text,
              i === lines - 1 ? "w-3/4" : "w-full",
              className
            )}
            {...props}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
      {...props}
    />
  )
}

// Componentes pré-construídos para uso comum
export function CardSkeleton() {
  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <Skeleton variant="text" lines={2} />
      <div className="flex items-center space-x-2">
        <Skeleton variant="avatar" />
        <Skeleton variant="text" className="w-24" />
      </div>
      <Skeleton variant="button" />
    </div>
  )
}

export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
          <Skeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" />
            <Skeleton variant="text" className="w-2/3" />
          </div>
          <Skeleton variant="button" />
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} />
          ))}
        </div>
      ))}
    </div>
  )
}