'use client'

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  const getVariant = (variant?: string) => {
    if (variant === 'destructive') return 'destructive'
    if (variant === 'success') return 'success'
    return 'default'
  }

  const getIcon = (variant?: string) => {
    if (variant === 'destructive') {
      return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
    }
    if (variant === 'success') {
      return <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
    }
    return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const toastVariant = getVariant(variant as string)
        const icon = getIcon(variant as string)

        return (
          <Toast key={id} variant={toastVariant} {...props} className="flex gap-4 items-start">
            {icon}
            <div className="flex-1 min-w-0">
              {title && <ToastTitle className="font-semibold text-base leading-tight">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-sm opacity-90 mt-1">{description}</ToastDescription>
              )}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
