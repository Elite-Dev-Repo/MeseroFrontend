'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ totalPages, currentPage, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = React.useMemo(() => {
    const result: (number | string)[] = []
    const showPages = 5
    const halfShow = Math.floor(showPages / 2)

    let start = Math.max(1, currentPage - halfShow)
    let end = Math.min(totalPages, start + showPages - 1)

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1)
    }

    if (start > 1) {
      result.push(1)
      if (start > 2) result.push('...')
    }

    for (let i = start; i <= end; i++) {
      result.push(i)
    }

    if (end < totalPages) {
      if (end < totalPages - 1) result.push('...')
      result.push(totalPages)
    }

    return result
  }, [currentPage, totalPages])

  return (
    <nav
      className={cn('flex items-center gap-1', className)}
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'h-9 w-9 rounded-lg border border-ink-200 bg-white text-ink-600 transition-colors',
          'hover:bg-ink-50 hover:text-ink-900',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'focus:outline-none focus:ring-2 focus:ring-crimson-500'
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-ink-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={cn(
              'h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-crimson-500',
              page === currentPage
                ? 'bg-crimson-600 text-white'
                : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
            )}
            aria-current={page === currentPage ? 'page' : undefined}
            aria-label={`Page ${page}`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'h-9 w-9 rounded-lg border border-ink-200 bg-white text-ink-600 transition-colors',
          'hover:bg-ink-50 hover:text-ink-900',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'focus:outline-none focus:ring-2 focus:ring-crimson-500'
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}