import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { Breadcrumb } from '../../components/common/Breadcrumb'
import { StatusPill } from '../../components/common/StatusPill'
import { useAuth } from '../../context/AuthContext'
import { JIJING_RANKING } from '../../data/questionBanks'
import type { ProgressStatus } from '../../types'

interface JijingRankingPageProps {
  title: string
  breadcrumb: string
  subject: 'listening' | 'reading' | 'writing'
}

export function JijingRankingPage({ title, breadcrumb, subject }: JijingRankingPageProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [rows, setRows] = useState<
    Array<{
      rank: number
      title: string
      part: string
      scene: string
      status: ProgressStatus
      testId?: number | null
      sectionId?: number | null
    }>
  >(JIJING_RANKING)
  const [completedCount, setCompletedCount] = useState(0)
  const [updatedAt, setUpdatedAt] = useState('实时更新')

  useEffect(() => {
    let cancelled = false
    api
      .getJijingRanking(subject)
      .then((res) => {
        if (cancelled) return
        setRows(res.items)
        setCompletedCount(res.completedCount)
        setUpdatedAt(res.updatedAt)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [subject, user?.id])

  return (
    <div>
      <Breadcrumb current={breadcrumb} />
      <div className="mb-4 rounded-xl bg-brand-800 p-5 text-white">
        <h1 className="text-lg font-bold">同桌机经高频命中榜</h1>
        <p className="mt-1 text-xs text-brand-100">实时更新 · 考前必刷 · 点击任意机经直接进入实考训练</p>
        <p className="mt-2 text-sm">
          共 {rows.length} 篇 · 已完成 {completedCount} 篇
        </p>
        <p className="text-xs text-brand-100">榜单更新于 {updatedAt}</p>
      </div>
      <h2 className="mb-3 text-base font-semibold text-ink-900">{title}</h2>
      <div className="flex flex-col divide-y divide-ink-400/10 overflow-hidden rounded-xl border border-ink-400/15 bg-surface shadow-sm">
        {rows.map((row) => (
          <button
            key={row.rank}
            type="button"
            onClick={() => {
              if (row.testId) {
                navigate(
                  row.sectionId
                    ? `/practice/test/${row.testId}?sectionId=${row.sectionId}`
                    : `/practice/test/${row.testId}`,
                )
              }
            }}
            className="flex items-center justify-between px-4 py-3 text-left text-sm transition hover:bg-brand-50/50"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center font-bold text-brand-600">{row.rank}</span>
              <span className="font-medium text-ink-800">{row.title}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-400">
              <span>{row.part}</span>
              <span>{row.scene}</span>
              <StatusPill status={row.status} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
