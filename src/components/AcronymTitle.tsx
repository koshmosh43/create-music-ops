import { cn } from '../lib/cn'

type Props = {
  title: string
  className?: string
  leadClassName?: string
  restClassName?: string
}

export function AcronymTitle({ title, className, leadClassName, restClassName }: Props) {
  if (!title) return null
  const [lead, ...rest] = title
  return (
    <span className={cn('spotify-acronym-title', className)}>
      <span className={cn('spotify-acronym-title__lead', leadClassName)}>{lead}</span>
      {rest.length > 0 && <span className={cn('spotify-acronym-title__rest', restClassName)}>{rest.join('')}</span>}
    </span>
  )
}

type BannerProps = {
  className?: string
}

const GROUPS = [
  ['H', 'I', 'R', 'E'],
  ['M', 'E'],
] as const

export function AcronymBanner({ className }: BannerProps) {
  let delay = 0
  return (
    <p className={cn('spotify-acronym-banner', className)} aria-label="HIRE ME">
      {GROUPS.map((group, gi) => (
        <span key={gi} className="spotify-acronym-banner__word">
          {gi > 0 && <span className="spotify-acronym-banner__gap" aria-hidden />}
          {group.map((letter) => {
            const d = delay
            delay += 70
            return (
              <span
                key={`${gi}-${letter}-${d}`}
                className="spotify-acronym-banner__letter"
                style={{ animationDelay: `${d}ms` }}
              >
                {letter}
              </span>
            )
          })}
        </span>
      ))}
    </p>
  )
}
