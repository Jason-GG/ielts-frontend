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
    <div className="overflow-hidden rounded-md border border-ink-400/15 bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 bg-brand-800 px-4 py-3 text-left text-white"
      >
        {header}
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}
