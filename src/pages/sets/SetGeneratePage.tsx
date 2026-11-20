import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { Breadcrumb } from '../../components/common/Breadcrumb'
import { StatusPill } from '../../components/common/StatusPill'
import type { ProgressStatus } from '../../types'

const TABS = ['听力', '阅读', '模考记录'] as const

interface GeneratedSetSummary {
  id: number
  subject: string
  title: string
  sectionIds: number[]
  status: ProgressStatus
  score: number | null
  total_questions: number
  band_score: number | null
  created_at: string
}

export function SetGeneratePage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<(typeof TABS)[number]>('听力')
  const [busy, setBusy] = useState(false)
  const [latestGenerated, setLatestGenerated] = useState<GeneratedSetSummary | null>(null)
  const [history, setHistory] = useState<GeneratedSetSummary[]>([])

  useEffect(() => {
    if (tab === '模考记录') {
      api
        .getGeneratedSets()
        .then((res) => setHistory(res.sets))
        .catch(() => {})
    }
  }, [tab])

  async function handleGenerate() {
    if (tab === '模考记录') return
    setBusy(true)
    try {
      const res = await api.generateMockSet(tab)
      setLatestGenerated(res.set)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <Breadcrumb current="单科机经模考" />
      <h1 className="mb-4 text-xl font-semibold text-ink-900">单科机经模考</h1>
      <div className="mb-4 flex gap-2 text-sm">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t)
              setLatestGenerated(null)
            }}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              t === tab ? 'bg-brand-600 text-white' : 'bg-surface text-ink-600 hover:bg-brand-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab !== '模考记录' ? (
        <div className="flex gap-6">
          <div className="flex-1 rounded-xl border border-ink-400/15 bg-surface p-8 text-center shadow-sm">
            <p className="mb-4 text-sm text-ink-600">
              点击下方按钮，系统将从真实题库中智能抽取跨卷篇章生成一套完整 {tab} 模考卷（40 题）
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={handleGenerate}
              className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {busy ? '正在智能组卷...' : '生成模考卷'}
            </button>

            {latestGenerated && (
              <div className="mx-auto mt-6 max-w-md rounded-xl border border-brand-200 bg-brand-50 p-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-ink-900">{latestGenerated.title}</span>
                  <StatusPill status={latestGenerated.status} />
                </div>
                <p className="mt-1 text-xs text-ink-600">
                  已随机组合 {latestGenerated.sectionIds.length} 个独立考场篇章 · 共 {latestGenerated.total_questions} 题
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/practice/generated/${latestGenerated.id}`)}
                  className="mt-3 w-full rounded-full bg-accent-500 py-2 text-xs font-semibold text-white hover:bg-accent-600"
                >
                  立即开始限时模考 ›
                </button>
              </div>
            )}
          </div>
          <aside className="w-[280px] shrink-0 rounded-xl border border-ink-400/15 bg-surface p-4 text-xs text-ink-600 shadow-sm">
            <h4 className="mb-2 text-sm font-semibold text-ink-900">考场提示</h4>
            <ul className="space-y-1.5">
              <li>· 听力建议音频只放一遍，模拟真实机考节奏</li>
              <li>· 听力 4 个 Part / 阅读 3 篇 Passage，共 40 题</li>
              <li>· 大小写均可得分，拼写错误算错</li>
              <li>· 交卷后系统自动换算 IELTS 9 分制成绩</li>
            </ul>
          </aside>
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-xl border border-ink-400/15 bg-surface p-8 text-center text-sm text-ink-400">
          暂无模考记录，请先在「听力」或「阅读」标签页点击生成模考卷。
        </div>
      ) : (
        <div className="divide-y divide-ink-400/10 overflow-hidden rounded-xl border border-ink-400/15 bg-surface shadow-sm">
          {history.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
              <div>
                <div className="font-semibold text-ink-900">{item.title}</div>
                <div className="mt-0.5 text-xs text-ink-400">
                  {item.score !== null
                    ? `得分：${item.score} / ${item.total_questions} · Band ${item.band_score}`
                    : `包含 ${item.sectionIds.length} 个篇章`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={item.status} />
                <button
                  type="button"
                  onClick={() => navigate(`/practice/generated/${item.id}`)}
                  className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
                >
                  {item.status === '已完成' ? '再次练习' : '进入模考'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
