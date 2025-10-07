import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

const TabsList = ({ className, ...props }) => (
  <TabsPrimitive.List
    className={cn(
      'inline-flex h-12 items-center justify-center rounded-full bg-background/40 p-1 text-muted-foreground backdrop-blur',
      className,
    )}
    {...props}
  />
)

const TabsTrigger = ({ className, ...props }) => (
  <TabsPrimitive.Trigger
    className={cn(
      'inline-flex min-w-[110px] items-center justify-center whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  />
)

const TabsContent = ({ className, ...props }) => (
  <TabsPrimitive.Content
    className={cn(
      'mt-6 rounded-3xl border border-border/60 bg-background/40 p-6 text-sm text-muted-foreground shadow-inner backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
)

export { Tabs, TabsList, TabsTrigger, TabsContent }
