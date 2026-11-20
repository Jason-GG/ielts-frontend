import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { Breadcrumb } from '../../components/common/Breadcrumb'
import { StatusPill } from '../../components/common/StatusPill'
import { useAuth } from '../../context/AuthContext'
import type { ProgressStatus } from '../../types'

interface SetPracticePageProps {
  title: string
  breadcrumb: string
  category: string
  showWarning?: boolean
}

export function SetPracticePage({ title, breadcrumb, category, showWarning }: SetPracticePageProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [books, setBooks] = useState<
    Array<{
      id: string
      title: string
      tests: Array<{
        id: string
        title: string
        subjects: Array<{
          subject: string
          label: string
          testId: number | null
          status: ProgressStatus
          isSpeakingMock?: boolean
        }>
      }>
    }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .getPracticeSets(category)
      .then((res) => {
        if (!cancelled) setBooks(res.books)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [category, user?.id])

  return (
    <div>
      <Breadcrumb current={breadcrumb} />
      <h1 className="mb-2 text-xl font-semibold text-ink-900">{title}</h1>
      {showWarning && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          三科全真模考必须三科题目都完成后才可查看完整模考总分报告！点击单科名称可直接开始该科套题训练。
        </p>
      )}
      {loading ? (
        <div className="rounded-xl border border-ink-400/15 bg-surface p-8 text-center text-sm text-ink-400">
          正在加载套题模考目录...
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {books.map((book) => (
            <div key={book.id} className="rounded-xl border border-ink-400/15 bg-surface p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-ink-900">{book.title}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                {book.tests.map((test) => (
                  <div key={test.id} className="rounded-lg border border-ink-400/15 bg-surface-alt/40 p-3">
                    <div className="mb-2 font-semibold text-ink-800">{test.title}</div>
                    <div className="flex flex-col gap-1.5">
                      {test.subjects.map((subj) => (
                        <div key={subj.subject} className="flex items-center justify-between">
                          {subj.isSpeakingMock ? (
                            <>
                              <span className="text-ink-600">{subj.label}</span>
                              <div className="flex items-center gap-2">
                                {subj.testId && (
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/practice/test/${subj.testId}`)}
                                    className="text-ink-600 hover:text-brand-600"
                                  >
                                    题卡
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => navigate('/speaking/mock')}
                                  className="text-brand-600 underline underline-offset-2"
                                >
                                  前往报名模考
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                disabled={!subj.testId}
                                onClick={() => subj.testId && navigate(`/practice/test/${subj.testId}`)}
                                className="font-medium text-ink-800 hover:text-brand-600 disabled:opacity-40"
                              >
                                {subj.label} ›
                              </button>
                              <StatusPill status={subj.status} />
                            </>
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
      )}
    </div>
  )
}
