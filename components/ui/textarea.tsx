import * as React from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[96px] w-full rounded-elemento border border-mt-border bg-white px-4 py-2.5 text-base text-mt-black transition-colors placeholder:text-mt-apoio/70 focus-visible:border-mt-green focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-mt-green/25 disabled:cursor-not-allowed disabled:opacity-50 leading-relaxed',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
