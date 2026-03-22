import type { ComponentProps } from 'react'
import { Toaster as SonnerToaster, toast } from 'sonner'

type ToasterProps = ComponentProps<typeof SonnerToaster>

function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-accent group-[.toast]:text-accent-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
