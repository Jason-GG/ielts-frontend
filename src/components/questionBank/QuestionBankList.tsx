import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BookGroup, QuestionItem } from '../../types'
import { Accordion } from '../common/Accordion'
import { FilterChips } from '../common/FilterChips'
import { StatusPill } from '../common/StatusPill'

interface QuestionBankListProps {
  title: string
  books: BookGroup[]
  types: string[]
  scenes?: string[] | null
  loading?: boolean
}

const PROGRESS_OPTIONS = ['全部', '未开始', '练习中', '已完成']

export function QuestionBankList({ title, books, types, scenes, loading }: QuestionBankListProps) {
  const navigate = useNavigate()
  const [typeFilter, setTypeFilter] = useState('全部')
  const [sceneFilter, setSceneFilter] = useState('全部')
  const [progressFilter, setProgressFilter] = useState('全部')

  const typeOptions = useMemo(() => ['全部', ...types], [types])
  const sceneOptions = useMemo(() => (scenes ? ['全部', ...scenes] : null), [scenes])

  const filteredBooks = useMemo(() => {
    return books
      .map((book) => {
        const tests = book.tests
          .map((t) => {
            const parts = t.parts
              .map((p) => {
                const items = p.items.filter((it) => {
                  if (typeFilter !== '全部' && it.type !== typeFilter) return false
                  if (sceneOptions && sceneFilter !== '全部' && (it.scene || p.scene) !== sceneFilter) return false
                  if (progressFilter !== '全部' && it.status !== progressFilter) return false
                  return true
                })
                return { ...p, items }
              })
              .filter((p) => p.items.length > 0)
            return { ...t, parts }
          })
          .filter((t) => t.parts.length > 0)
        return { ...book, tests }
      })
      .filter((b) => b.tests.length > 0)
  }, [books, typeFilter, sceneFilter, progressFilter, sceneOptions])

  function handleItemClick(item: QuestionItem, fallbackTestId?: number, fallbackSecId?: number) {
    const tid = item.testId ?? fallbackTestId
    const sid = item.sectionId ?? fallbackSecId
    if (tid) {
      navigate(sid ? `/practice/test/${tid}?sectionId=${sid}` : `/practice/test/${tid}`)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink-900">{title}</h1>
        <span className="text-xs text-ink-400">
          共 {filteredBooks.length} 本真题册 · 点击任意题组进入在线做题与自动批改
        </span>
      </div>
      <div className="mb-5 divide-y divide-ink-400/10 rounded-2xl border border-ink-400/15 bg-surface p-4 shadow-sm">
        <FilterChips label="题型" options={typeOptions} value={typeFilter} onChange={setTypeFilter} />
        {sceneOptions && (
          <FilterChips label="场景" options={sceneOptions} value={sceneFilter} onChange={setSceneFilter} />
        )}
        <FilterChips label="进度" options={PROGRESS_OPTIONS} value={progressFilter} onChange={setProgressFilter} />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-ink-400/15 bg-surface p-8 text-center text-sm text-ink-400">
          正在从数据库加载真题题库...
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="rounded-2xl border border-ink-400/15 bg-surface p-8 text-center text-sm text-ink-400">
          当前筛选条件下暂无匹配题目，请切换筛选标签重试。
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredBooks.map((book, i) => (
            <Accordion
              key={book.id}
              defaultOpen={i === 0}
              header={
                <span>
                  <span className="font-bold">{book.title}</span>
                  <span className="ml-2 text-xs text-brand-600/70">{book.subtitle}</span>
                </span>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {book.tests.map((test) => (
                  <div key={test.id} className="rounded-xl bg-surface-alt/60 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-ink-800">{test.title}</h4>
                      {test.testId && (
                        <button
                          type="button"
                          onClick={() => navigate(`/practice/test/${test.testId}`)}
                          className="text-[11px] font-medium text-brand-600 hover:underline"
                        >
                          整套模考 ›
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {test.parts.map((part) => (
                        <div key={part.id} className="rounded-lg border border-ink-400/15 bg-surface p-2.5">
                          <div className="mb-1.5 truncate text-xs font-medium text-ink-600" title={part.title}>
                            {part.title}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {part.items.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleItemClick(item, test.testId, part.sectionId)}
                                className="flex items-center justify-between rounded-full bg-surface-alt px-3 py-1.5 text-xs transition hover:bg-brand-50"
                              >
                                <span>
                                  {item.type && <span className="mr-1 font-medium text-brand-600">{item.type}</span>}
                                  {item.label}
                                </span>
                                <StatusPill status={item.status} />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>
          ))}
        </div>
      )}
    </div>
  )
}
