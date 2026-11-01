import { useMemo, useState } from 'react'
import { Breadcrumb } from '../../components/common/Breadcrumb'
import { FilterChips } from '../../components/common/FilterChips'
import {
  SPEAKING_MODULES,
  SPEAKING_QUESTIONS,
  SPEAKING_TAGS,
  SPEAKING_TOPICS,
} from '../../data/speakingAndMembership'

export function SpeakingBankPage() {
  const [moduleFilter, setModuleFilter] = useState('全部')
  const [tagFilter, setTagFilter] = useState('全部')
  const [topicFilter, setTopicFilter] = useState('全部')
  const [selected, setSelected] = useState<string[]>([])

  const moduleOptions = useMemo(() => ['全部', ...SPEAKING_MODULES], [])

  const filtered = SPEAKING_QUESTIONS.filter((q) => {
    if (moduleFilter !== '全部' && q.module !== moduleFilter) return false
    if (tagFilter === '本季新题' && !q.isNew) return false
    if (topicFilter !== '全部' && q.topic !== topicFilter) return false
    return true
  })

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div>
      <Breadcrumb current="口语题库" />
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="mb-3 flex gap-2 text-sm">
            <button type="button" className="rounded bg-brand-600 px-3 py-1.5 text-white">
              题库&素材
            </button>
            <button type="button" className="rounded bg-surface-alt px-3 py-1.5 text-ink-600">
              答题元素 <span className="text-[10px] text-brand-500">Beta</span>
            </button>
            <button type="button" className="rounded bg-surface-alt px-3 py-1.5 text-ink-600">
              答题结构 <span className="text-[10px] text-brand-500">Beta</span>
            </button>
          </div>
          <div className="mb-4 rounded-md border border-ink-400/15 bg-surface p-4">
            <FilterChips label="模块" options={moduleOptions} value={moduleFilter} onChange={setModuleFilter} />
            <FilterChips label="新旧" options={SPEAKING_TAGS} value={tagFilter} onChange={setTagFilter} />
            <FilterChips label="主题" options={SPEAKING_TOPICS} value={topicFilter} onChange={setTopicFilter} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((q) => (
              <label
                key={q.id}
                className="relative flex items-start gap-3 rounded-md border border-ink-400/15 bg-surface p-3 text-sm"
              >
                {q.isNew && (
                  <span className="absolute -top-2 -left-2 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] text-white">
                    新题
                  </span>
                )}
                <input
                  type="checkbox"
                  checked={selected.includes(q.id)}
                  onChange={() => toggle(q.id)}
                  className="mt-1"
                />
                <div>
                  <div className="text-xs text-ink-400">{q.module} · {q.topic}</div>
                  <div className="text-ink-800">{q.title}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <aside className="w-[280px] shrink-0 flex flex-col gap-4">
          <div className="rounded-md border border-ink-400/15 bg-surface p-4">
            <h4 className="mb-1 text-sm font-semibold text-ink-900">口语全真模考</h4>
            <p className="text-xs text-ink-600">今日报名 301 · 7 日 2,552</p>
            <p className="mt-1 text-lg font-bold text-brand-600">¥18.8/节</p>
            <p className="text-[11px] text-ink-400">每 30 天仅可购买一节</p>
          </div>
          <div className="rounded-md border border-dashed border-ink-400/30 p-4 text-center text-xs text-ink-400">
            移动口语题库 — 微信扫码即可打开
          </div>
        </aside>
      </div>
      {selected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full bg-brand-600 px-6 py-3 text-sm text-white shadow-lg">
          <span>已选 {selected.length} 题</span>
          <button type="button" className="rounded-full bg-brand-600 px-4 py-1.5">
            生成练习集
          </button>
        </div>
      )}
    </div>
  )
}
