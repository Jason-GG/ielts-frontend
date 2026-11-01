import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  widthClass?: string
}

export function Modal({ open, title, onClose, children, widthClass = 'max-w-lg' }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`w-full ${widthClass} rounded-lg bg-surface shadow-xl`}>
        <div className="flex items-center justify-between border-b border-ink-400/15 px-5 py-3">
          <h3 className="text-base font-semibold text-ink-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="rounded px-2 py-1 text-ink-400 hover:bg-surface-alt"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
