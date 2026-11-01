import { Breadcrumb } from '../../components/common/Breadcrumb'
import { StatusPill } from '../../components/common/StatusPill'
import { LISTENING_BOOKS } from '../../data/questionBanks'
import type { ProgressStatus } from '../../types'

const SUBJECTS = ['LISTENING', 'READING', 'WRITING', 'SPEAKING'] as const

function cellStatus(seed: number): ProgressStatus {
  const options: ProgressStatus[] = ['未开始', '练习中', '已完成']
  return options[seed % options.length]
}

interface SetPracticePageProps {
  title: string
  breadcrumb: string
  showWarning?: boolean
}

export function SetPracticePage({ title, breadcrumb, showWarning }: SetPracticePageProps) {
  return (
    <div>
      <Breadcrumb current={breadcrumb} />
      <h1 className="mb-2 text-xl font-semibold text-ink-900">{title}</h1>
      {showWarning && (
        <p className="mb-4 rounded bg-amber-50 px-3 py-2 text-xs text-amber-700">
          三科全真模考必须三科题目都完成后才可查看分数答案!
        </p>
      )}
      <div className="flex flex-col gap-4">
        {LISTENING_BOOKS.map((book, bi) => (
          <div key={book.id} className="rounded-md border border-ink-400/15 bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink-900">{book.title}</h3>
            <div className="grid grid-cols-4 gap-3 text-xs">
              {book.tests.map((test, ti) => (
                <div key={test.id} className="rounded border border-ink-400/15 p-2">
                  <div className="mb-2 font-medium text-ink-700">{test.title}</div>
                  <div className="flex flex-col gap-1">
                    {SUBJECTS.map((subject, si) => (
                      <div key={subject} className="flex items-center justify-between">
                        <span>{subject === 'SPEAKING' ? '口语' : subject}</span>
                        {subject === 'SPEAKING' ? (
                          <button type="button" className="text-brand-600 underline underline-offset-2">
                            前往报名模考
                          </button>
                        ) : (
                          <StatusPill status={cellStatus(bi + ti + si)} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
