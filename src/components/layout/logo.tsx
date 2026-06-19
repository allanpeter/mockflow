import { cn } from '@/lib/utils'

interface LogoProps {
  /** Hide the "MockFlow" wordmark and render only the chat-bubble mark. */
  markOnly?: boolean
  className?: string
  markClassName?: string
}

/**
 * MockFlow brand lockup: chat-bubble mark + wordmark.
 * The top bubble follows the foreground color (adapts to light/dark theme);
 * the bottom bubble + tail use the brand primary.
 */
export function Logo({ markOnly = false, className, markClassName }: Readonly<LogoProps>) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-lg font-bold tracking-tight', className)}>
      <svg
        viewBox="0 0 100 100"
        className={cn('h-6 w-6 shrink-0', markClassName)}
        role="img"
        aria-label="MockFlow"
      >
        <rect x="32" y="14" width="54" height="38" rx="12" className="fill-foreground" />
        <rect x="14" y="42" width="54" height="38" rx="12" className="fill-primary" />
        <polygon points="24,76 24,94 42,80" className="fill-primary" />
      </svg>
      {!markOnly && (
        <span aria-hidden="true">
          <span className="text-primary">Mock</span>Flow
        </span>
      )}
    </span>
  )
}
