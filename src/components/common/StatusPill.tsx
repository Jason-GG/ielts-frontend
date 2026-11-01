import type { ProgressStatus } from '../../types'

const STYLES: Record<ProgressStatus, string> = {
  未开始: 'bg-ink-400/10 text-ink-400',
  练习中: 'bg-amber-100 text-amber-700',
  已完成: 'bg-emerald-100 text-emerald-700',
}

export function StatusPill({ status }: { status: ProgressStatus }) {
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}>{status}</span>
  )
}
