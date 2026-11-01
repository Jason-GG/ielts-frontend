import { useMemo, useState } from 'react'
import type { BookGroup } from '../../types'
import { Accordion } from '../common/Accordion'
import { FilterChips } from '../common/FilterChips'
import { StatusPill } from '../common/StatusPill'

interface QuestionBankListProps {
  title: string
  books: BookGroup[]
  types: string[]
  scenes?: string[]
}

const PROGRESS_OPTIONS = ['全部', '未开始', '练习中', '已完成']

export function QuestionBankList({ title, books, types, scenes }: QuestionBankListProps) {
  const [typeFilter, setTypeFilter] = useState('全部')
  const [sceneFilter, setSceneFilter] = useState('全部')
  const [progressFilter, setProgressFilter] = useState('全部')

  const typeOptions = useMemo(() => ['全部', ...types], [types])
  const sceneOptions = useMemo(() => (scenes ? ['全部', ...scenes] : null), [scenes])

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-ink-900">{title}</h1>
      <div className="mb-4 rounded-md border border-ink-400/15 bg-surface p-4">
        <FilterChips label="题型" options={typeOptions} value={typeFilter} onChange={setTypeFilter} />
        {sceneOptions && (
          <FilterChips label="场景" options={sceneOptions} value={sceneFilter} onChange={setSceneFilter} />
        )}
        <FilterChips label="进度" options={PROGRESS_OPTIONS} value={progressFilter} onChange={setProgressFilter} />
      </div>
      <div className="flex flex-col gap-4">
        {books.map((book, i) => (
          <Accordion
            key={book.id}
            defaultOpen={i === 0}
            header={
              <span>
                <span className="font-bold">{book.title}</span>
                <span className="ml-2 text-xs text-white/70">{book.subtitle}</span>
              </span>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {book.tests.map((test) => (
                <div key={test.id}>
                  <h4 className="mb-2 text-sm font-semibold text-ink-800">{test.title}</h4>
                  <div className="flex flex-col gap-2">
                    {test.parts.map((part) => (
                      <div key={part.id} className="rounded border border-ink-400/15 p-2">
                        <div className="mb-1 text-xs font-medium text-ink-600">{part.title}</div>
                        <div className="flex flex-col gap-1">
                          {part.items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              className="flex items-center justify-between rounded bg-surface-alt px-2 py-1 text-xs hover:bg-brand-50"
                            >
                              <span>
                                {item.type && <span className="mr-1 text-ink-400">{item.type}</span>}
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
    </div>
  )
}
