import { useState } from 'react'
import type { ReactNode } from 'react'

interface AccordionProps {
  header: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}

export function Accordion({ header, defaultOpen = false, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-400/15 bg-surface shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 bg-brand-50 px-5 py-4 text-left text-brand-800 transition hover:bg-brand-100"
      >
        {header}
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-ink-600 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ⌄
        </span>
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  )
}
