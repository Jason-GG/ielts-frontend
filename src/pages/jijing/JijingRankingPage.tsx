import { Breadcrumb } from '../../components/common/Breadcrumb'
import { StatusPill } from '../../components/common/StatusPill'
import { JIJING_RANKING } from '../../data/questionBanks'

interface JijingRankingPageProps {
  title: string
  breadcrumb: string
}

export function JijingRankingPage({ title, breadcrumb }: JijingRankingPageProps) {
  return (
    <div>
      <Breadcrumb current={breadcrumb} />
      <div className="mb-4 rounded-md bg-brand-800 p-5 text-white">
        <h1 className="text-lg font-bold">同桌机经高频命中榜</h1>
        <p className="mt-1 text-xs text-brand-100">实时更新 · 考前必刷</p>
        <p className="mt-2 text-sm">共 {JIJING_RANKING.length} 篇 · 已完成 0 篇</p>
        <p className="text-xs text-brand-100">榜单更新于 10-31 18:33:48</p>
      </div>
      <h2 className="mb-3 text-base font-semibold text-ink-900">{title}</h2>
      <div className="flex flex-col divide-y divide-ink-400/10 rounded-md border border-ink-400/15 bg-surface">
        {JIJING_RANKING.map((row) => (
          <div key={row.rank} className="flex items-center justify-between px-4 py-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-6 text-center font-bold text-brand-600">{row.rank}</span>
              <span>{row.title}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-400">
              <span>{row.part}</span>
              <span>{row.scene}</span>
              <StatusPill status={row.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
