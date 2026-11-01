import { useState } from 'react'
import { Breadcrumb } from '../../components/common/Breadcrumb'
import { SidebarRail } from '../../components/common/SidebarRail'
import type { WritingPaper } from '../../data/questionBanks'

interface WritingBankPageProps {
  title: string
  breadcrumb: string
  papers: WritingPaper[]
}

export function WritingBankPage({ title, breadcrumb, papers }: WritingBankPageProps) {
  const [selectedId, setSelectedId] = useState(papers[0]?.id)
  const selected = papers.find((p) => p.id === selectedId) ?? papers[0]

  return (
    <div>
      <Breadcrumb current={breadcrumb} />
      <h1 className="mb-4 text-xl font-semibold text-ink-900">{title}</h1>
      <div className="flex gap-6">
        <div className="flex w-[975px] gap-0 rounded-md border border-ink-400/15 bg-surface">
          <div className="w-[268px] shrink-0 overflow-y-auto border-r border-ink-400/15">
            {papers.map((paper) => (
              <button
                key={paper.id}
                type="button"
                onClick={() => setSelectedId(paper.id)}
                className={`flex w-full items-center justify-between border-b border-ink-400/10 px-4 py-3 text-left text-sm ${
                  paper.id === selected?.id ? 'bg-brand-50 text-brand-700' : 'hover:bg-surface-alt'
                }`}
              >
                <span>{paper.title}</span>
                <span className="text-xs text-ink-400">{paper.type}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 p-6">
            {selected && (
              <>
                <h3 className="mb-2 text-sm font-semibold text-ink-900">{selected.title} · {selected.type}</h3>
                <div className="mb-4 rounded border border-ink-400/15 bg-surface-alt p-3 text-xs text-ink-600">
                  {selected.task}
                </div>
                <p className="text-sm leading-relaxed text-ink-800">{selected.prompt}</p>
                <div className="mt-6 flex gap-3">
                  <button type="button" className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">
                    写作文
                  </button>
                  <button type="button" className="rounded border border-ink-400/30 px-4 py-2 text-sm text-ink-700">
                    看范文
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <SidebarRail />
      </div>
    </div>
  )
}
