import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { Breadcrumb } from '../../components/common/Breadcrumb'
import { useAuth } from '../../context/AuthContext'

const TABS: Array<{ key: 'cambridge' | 'nine_score' | 'bookmarks'; label: string }> = [
  { key: 'cambridge', label: '剑雅真题' },
  { key: 'nine_score', label: '考场真题（9分达人）' },
  { key: 'bookmarks', label: '我的收藏' },
]

export function FullDictationPage() {
  const navigate = useNavigate()
  const { user, openLoginModal } = useAuth()
  const [tab, setTab] = useState<'cambridge' | 'nine_score' | 'bookmarks'>('cambridge')
  const [books, setBooks] = useState<
    Array<{
      id: string
      bookNumber: number
      title: string
      tests: Array<{
        id: string
        testId: number
        title: string
        sections: Array<{
          sectionId: number
          sectionNumber: number
          title: string
          audioStreamUrl: string
          audioExists: boolean
          bookmarked: boolean
        }>
      }>
    }>
  >([])
  const [playingSec, setPlayingSec] = useState<{
    sectionId: number
    testId: number
    title: string
    audioStreamUrl: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  function loadTab(activeTab: 'cambridge' | 'nine_score' | 'bookmarks') {
    setLoading(true)
    api
      .getDictationBank(activeTab)
      .then((res) => setBooks(res.books))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTab(tab)
  }, [tab, user?.id])

  async function handleToggleBookmark(sectionId: number) {
    if (!user) {
      openLoginModal()
      return
    }
    await api.toggleBookmark('section', sectionId)
    loadTab(tab)
  }

  return (
    <div>
      <Breadcrumb current="全文精听" />
      <h1 className="mb-4 text-xl font-semibold text-ink-900">全文精听</h1>
      <div className="mb-4 flex gap-2 text-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              t.key === tab ? 'bg-brand-600 text-white' : 'bg-surface text-ink-600 hover:bg-brand-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {playingSec && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-200 bg-brand-50 px-5 py-4">
          <div>
            <div className="text-xs font-semibold text-brand-700">正在精听播放</div>
            <div className="text-sm font-bold text-ink-900">{playingSec.title}</div>
          </div>
          <audio controls autoPlay src={playingSec.audioStreamUrl} className="h-9 flex-1 max-w-md" />
          <button
            type="button"
            onClick={() => navigate(`/practice/test/${playingSec.testId}?sectionId=${playingSec.sectionId}`)}
            className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
          >
            边听边做题 ›
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-ink-400/15 bg-surface p-8 text-center text-sm text-ink-400">
          正在加载精听音频目录...
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-xl border border-ink-400/15 bg-surface p-8 text-center text-sm text-ink-400">
          {tab === 'bookmarks' ? '暂无收藏的精听篇章，点击任意篇章右侧「☆」即可收藏' : '暂无可用精听数据'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {books.map((book) => (
            <div key={book.id} className="rounded-xl border border-ink-400/15 bg-surface p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-ink-900">{book.title}</h3>
              <div className="space-y-2.5">
                {book.tests.map((test) => (
                  <div key={test.id} className="rounded-lg bg-surface-alt/60 p-2.5">
                    <div className="mb-1.5 text-xs font-semibold text-ink-700">{test.title}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {test.sections.map((sec) => (
                        <div
                          key={sec.sectionId}
                          className="inline-flex items-center gap-1 rounded-full border border-ink-400/15 bg-surface px-2.5 py-1 text-xs"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setPlayingSec({
                                sectionId: sec.sectionId,
                                testId: test.testId,
                                title: `${book.title} · ${test.title} · Part ${sec.sectionNumber}`,
                                audioStreamUrl: sec.audioStreamUrl,
                              })
                            }
                            className="font-medium text-ink-800 hover:text-brand-600"
                          >
                            ▶ Part {sec.sectionNumber}
                          </button>
                          <button
                            type="button"
                            title="收藏篇章"
                            onClick={() => handleToggleBookmark(sec.sectionId)}
                            className={`ml-0.5 text-xs ${sec.bookmarked ? 'text-amber-500' : 'text-ink-400 hover:text-amber-500'}`}
                          >
                            {sec.bookmarked ? '★' : '☆'}
                          </button>
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
