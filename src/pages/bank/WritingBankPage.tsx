import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { Breadcrumb } from '../../components/common/Breadcrumb'
import { FilterChips } from '../../components/common/FilterChips'
import { SidebarRail } from '../../components/common/SidebarRail'
import { StatusPill } from '../../components/common/StatusPill'
import { useAuth } from '../../context/AuthContext'
import type { WritingPaper } from '../../data/questionBanks'

interface WritingBankPageProps {
  title: string
  breadcrumb: string
  variant: 'A' | 'G'
  fallbackPapers: WritingPaper[]
}

export function WritingBankPage({ title, breadcrumb, variant, fallbackPapers }: WritingBankPageProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [papers, setPapers] = useState<WritingPaper[]>(fallbackPapers)
  const [types, setTypes] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState('全部')
  const [selectedId, setSelectedId] = useState(fallbackPapers[0]?.id)
  const [showModel, setShowModel] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .getWritingBank(variant)
      .then((res) => {
        if (cancelled) return
        setPapers(res.papers)
        setTypes(res.types)
        if (res.papers.length > 0) {
          setSelectedId(res.papers[0].id)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [variant, user?.id])

  const filteredPapers = useMemo(
    () => (typeFilter === '全部' ? papers : papers.filter((p) => p.type === typeFilter)),
    [papers, typeFilter],
  )
  const selected = filteredPapers.find((p) => p.id === selectedId) ?? filteredPapers[0]

  return (
    <div>
      <Breadcrumb current={breadcrumb} />
      <h1 className="mb-4 text-xl font-semibold text-ink-900">{title}</h1>
      {types.length > 0 && (
        <div className="mb-4 rounded-xl border border-ink-400/15 bg-surface p-3 shadow-sm">
          <FilterChips
            label="题型"
            options={['全部', ...types]}
            value={typeFilter}
            onChange={(val) => {
              setTypeFilter(val)
              setShowModel(false)
            }}
          />
        </div>
      )}
      <div className="flex gap-6">
        <div className="flex w-[975px] max-h-[720px] gap-0 overflow-hidden rounded-xl border border-ink-400/15 bg-surface shadow-sm">
          <div className="w-[268px] shrink-0 overflow-y-auto border-r border-ink-400/15">
            {filteredPapers.map((paper) => (
              <button
                key={paper.id}
                type="button"
                onClick={() => {
                  setSelectedId(paper.id)
                  setShowModel(false)
                }}
                className={`flex w-full items-center justify-between border-b border-ink-400/10 px-4 py-3 text-left text-sm transition ${
                  paper.id === selected?.id ? 'bg-brand-50 font-medium text-brand-700' : 'hover:bg-surface-alt'
                }`}
              >
                <span className="truncate">{paper.title}</span>
                <span className="ml-2 shrink-0 text-xs text-ink-400">{paper.type}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {selected && (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-ink-900">
                    {selected.title} · {selected.type}
                  </h3>
                  {selected.status && <StatusPill status={selected.status} />}
                </div>
                <div className="mb-4 rounded-lg border border-ink-400/15 bg-surface-alt p-3 text-xs text-ink-600">
                  {selected.task}
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-800">{selected.prompt}</p>

                {selected.pageImageUrls && selected.pageImageUrls.length > 0 && (
                  <div className="mt-4 rounded-lg border border-ink-400/15 bg-surface-alt/50 p-2">
                    <p className="mb-1.5 text-[11px] text-ink-400">原卷图表 / 题面扫描页：</p>
                    <img
                      src={selected.pageImageUrls[0]}
                      alt={selected.title}
                      className="max-h-80 rounded border border-ink-400/15 object-contain"
                      onError={(e) => {
                        ;(e.currentTarget.parentElement as HTMLElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (selected.testId) {
                        navigate(
                          selected.sectionId
                            ? `/practice/test/${selected.testId}?sectionId=${selected.sectionId}`
                            : `/practice/test/${selected.testId}`,
                        )
                      }
                    }}
                    className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    写作文
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModel((s) => !s)}
                    className="rounded-lg border border-ink-400/30 px-5 py-2 text-sm text-ink-700 hover:bg-surface-alt"
                  >
                    {showModel ? '收起解析' : '看范文与审题解析'}
                  </button>
                </div>

                {showModel && (
                  <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50/70 p-4 text-sm text-ink-800">
                    <div className="mb-1 text-xs font-bold text-brand-700">考官范文要点与评分解析</div>
                    <p className="whitespace-pre-line text-xs leading-relaxed text-ink-600">
                      {selected.modelGuidance || '请点击「写作文」提交正文后查看字数统计与详细参考解析。'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <SidebarRail />
      </div>
    </div>
  )
}
