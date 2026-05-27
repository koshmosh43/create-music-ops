import { cn } from './cn'

type Props = {
  src: string
  className?: string
  blur?: number
  saturate?: number
}

export function BlurArtBackdrop({ src, className, blur = 80, saturate = 1.65 }: Props) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      decoding="async"
      className={cn('blur-art-img', className)}
      style={{ filter: `blur(${blur}px) saturate(${saturate})` }}
    />
  )
}
