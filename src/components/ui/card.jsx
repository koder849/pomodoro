import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-3xl border border-border/70 bg-card/70 text-card-foreground shadow-[0_24px_60px_rgba(9,11,27,0.55)] backdrop-blur-2xl',
      className,
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = ({ className, ...props }) => (
  <div
    className={cn(
      'flex flex-col space-y-2 rounded-[2.4rem] border border-border/60 bg-background/40 p-6 backdrop-blur-xl md:p-8',
      className,
    )}
    {...props}
  />
)

const CardTitle = ({ className, ...props }) => (
  <h2
    className={cn(
      'text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-3xl',
      className,
    )}
    {...props}
  />
)

const CardDescription = ({ className, ...props }) => (
  <p
    className={cn(
      'text-sm leading-relaxed text-muted-foreground md:text-base',
      className,
    )}
    {...props}
  />
)

const CardContent = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-6 p-6 md:p-8', className)} {...props} />
)

const CardFooter = ({ className, ...props }) => (
  <div className={cn('flex items-center justify-between p-6 pt-0 md:p-8', className)} {...props} />
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
