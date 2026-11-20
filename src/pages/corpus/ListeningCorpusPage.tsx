import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Breadcrumb } from '../../components/common/Breadcrumb'
import { Modal } from '../../components/common/Modal'
import { SidebarRail } from '../../components/common/SidebarRail'
import { useAuth } from '../../context/AuthContext'
import {
  LISTENING_CHAPTERS,
  LISTENING_WORD_BOOKS,
  SPECIALTY_SERIES,
  STUDY_GUIDE_STEPS,
  type SpecialtySeries,
} from '../../data/corpus'
import type { CorpusWord, WordBook } from '../../types'

type Mode = 'test' | 'learn'

function escapeRegExp(raw: string): string {
  return raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function ListeningCorpusPage() {
  const { user } = useAuth()
  const [chapters, setChapters] = useState(LISTENING_CHAPTERS)
  const [chapter, setChapter] = useState(LISTENING_CHAPTERS[0].id)
  const [mode, setMode] = useState<Mode>('test')
  const [wordBooks, setWordBooks] = useState<WordBook[]>(LISTENING_WORD_BOOKS)
  const [specialtySeries, setSpecialtySeries] = useState<SpecialtySeries[]>(SPECIALTY_SERIES)
  const [seriesTab, setSeriesTab] = useState(SPECIALTY_SERIES[0].id)
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideStep, setGuideStep] = useState(0)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<CorpusWord[]>([])

  // Interactive Corpus Practice Modal state
  const [practiceBook, setPracticeBook] = useState<{ id: string; title: string } | null>(null)
  const [practiceWords, setPracticeWords] = useState<CorpusWord[]>([])
  const [spellings, setSpellings] = useState<Record<number, string>>({})
  const [practiceBusy, setPracticeBusy] = useState(false)
  const [practiceResult, setPracticeResult] = useState<{
    correct: number
    total: number
    accuracy: number
    persisted: boolean
    results: Array<{
      word_id: number
      word: string
      meaning_zh: string
      user_spelling: string
      is_correct: boolean
    }>
  } | null>(null)

  const refreshCorpus = useCallback(
    (activeChapter: string, searchKw = '') => {
      api
        .getListeningCorpus(activeChapter, searchKw)
        .then((res) => {
          if (res.chapters.length > 0) setChapters(res.chapters)
          setWordBooks(res.wordBooks)
          if (res.specialtySeries.length > 0) setSpecialtySeries(res.specialtySeries)
          setSearchResults(res.searchResults)
        })
        .catch(() => {})
    },
    [],
  )

  useEffect(() => {
    refreshCorpus(chapter)
  }, [chapter, user?.id, refreshCorpus])

  async function startPractice(bookId: string, title: string) {
    setPracticeBook({ id: bookId, title })
    setPracticeResult(null)
    setSpellings({})
    setPracticeBusy(true)
    try {
      const res = await api.getCorpusBookWords(bookId, 10)
      setPracticeWords(res.words)
    } catch {
      setPracticeWords([])
    } finally {
      setPracticeBusy(false)
    }
  }

  async function handleSubmitPractice() {
    if (!practiceBook || practiceWords.length === 0) return
    setPracticeBusy(true)
    try {
      const items = practiceWords.map((w) => ({
        word_id: w.id,
        user_spelling: spellings[w.id] || '',
      }))
      const res = await api.submitCorpusPractice(practiceBook.id, mode, items)
      setPracticeResult(res)
      refreshCorpus(chapter, search)
    } finally {
      setPracticeBusy(false)
    }
  }

  const activeSeries = specialtySeries.find((s) => s.id === seriesTab) ?? specialtySeries[0]
  const activeChapter = chapters.find((c) => c.id === chapter) ?? chapters[0]
  const mainWordBooks = wordBooks.filter((b) => b.id !== 'error-book')
  const errorBook = wordBooks.find((b) => b.id === 'error-book')

  return (
    <div>
      <Breadcrumb current="刘夏来雅思听力语料库" />
      <div className="flex gap-6">
        <nav className="flex w-[200px] shrink-0 flex-col gap-2">
          {chapters.map((c) => {
            const active = c.id === chapter
            return (
              <button
                key={c.id}
                type="button"
                title={c.tooltip}
                onClick={() => setChapter(c.id)}
                className={`rounded-xl p-3 text-left transition ${
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'border border-ink-400/15 bg-surface text-ink-600 hover:border-brand-300'
                }`}
              >
                <div className="flex items-center justify-between text-sm font-bold">
                  {c.title}
                  {active && <span className="text-xs">✓</span>}
                </div>
                <div className="mt-1 text-xs opacity-80">{c.theme}</div>
              </button>
            )
          })}
        </nav>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-ink-900">
                {activeChapter.title} · {activeChapter.theme}
              </h2>
              <p className="mt-0.5 text-xs text-ink-400">{activeChapter.tooltip}</p>
            </div>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="shrink-0 rounded-full bg-accent-50 px-3 py-1.5 text-sm font-medium text-accent-600 hover:bg-accent-100"
            >
              💡 高效刷词指南 ›
            </button>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <div className="flex rounded-full border border-ink-400/15 bg-surface p-1 text-sm shadow-sm">
              <button
                type="button"
                onClick={() => setMode('test')}
                className={`rounded-full px-4 py-1.5 font-medium transition ${mode === 'test' ? 'bg-brand-600 text-white' : 'text-ink-600 hover:text-brand-600'}`}
              >
                测试模式
              </button>
              <button
                type="button"
                onClick={() => setMode('learn')}
                className={`rounded-full px-4 py-1.5 font-medium transition ${mode === 'learn' ? 'bg-brand-600 text-white' : 'text-ink-600 hover:text-brand-600'}`}
              >
                学习模式
              </button>
            </div>
            {mode === 'learn' && (
              <div className="flex gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && refreshCorpus(chapter, search)}
                  placeholder={`搜索 ${activeChapter.title} 的单词或中文释义`}
                  className="w-60 rounded-full border border-ink-400/20 bg-surface px-4 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => refreshCorpus(chapter, search)}
                  className="rounded-full bg-brand-600 px-4 py-1.5 text-sm text-white hover:bg-brand-700"
                >
                  搜索
                </button>
              </div>
            )}
          </div>

          {mode === 'learn' && searchResults.length > 0 && (
            <div className="mb-5 rounded-2xl border border-brand-200 bg-surface p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between text-xs text-ink-400">
                <span>搜索结果（共 {searchResults.length} 词）</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setSearchResults([])
                  }}
                  className="text-brand-600 hover:underline"
                >
                  清除搜索
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {searchResults.map((w) => (
                  <div key={w.id} className="rounded-lg bg-surface-alt/60 px-3 py-2 text-xs">
                    <div className="font-bold text-ink-900">
                      {w.word} {w.phonetic && <span className="font-normal text-ink-400">{w.phonetic}</span>}
                    </div>
                    <div className="mt-0.5 text-ink-600">{w.meaning_zh}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            {mainWordBooks.map((book) => {
              const denom = book.seededCount && book.seededCount > 0 ? book.seededCount : Math.max(1, book.total)
              const learnedRatio = Math.min(100, Math.round((book.mastered / denom) * 100))
              return (
                <div
                  key={book.id}
                  className="flex flex-col justify-between rounded-2xl border border-ink-400/15 bg-surface p-5 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-ink-900">{book.title}</h4>
                      <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[11px] text-ink-600">{book.tag}</span>
                    </div>
                    <p className="mb-3 text-xs text-ink-600">{book.rationale}</p>

                    {mode === 'test' ? (
                      <p className="text-xs text-ink-400">
                        我的正确率{' '}
                        <span className="font-semibold text-brand-600">
                          {book.myAccuracy !== null && book.myAccuracy !== undefined ? `${book.myAccuracy}%` : '暂无'}
                        </span>{' '}
                        / 目标 {book.targetAccuracy}%
                      </p>
                    ) : (
                      <>
                        <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-alt">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${learnedRatio}%` }} />
                        </div>
                        <p className="text-xs text-ink-400">
                          已掌握 {book.mastered} / {book.total}，学习中 {book.learning}，未学习{' '}
                          {Math.max(0, book.total - book.mastered - book.learning)}
                        </p>
                      </>
                    )}
                  </div>

                  <div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-ink-400">
                        全部 {book.total} 词 · 建议今日复习单词 {Math.min(20, Math.max(10, book.total))} 词
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => startPractice(book.id, book.title)}
                      className="mt-3 w-full rounded-full bg-brand-600 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                    >
                      {mode === 'test' ? '开始测试' : '开始学习'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {errorBook && (
            <div className="mb-8 flex items-center justify-between rounded-2xl border border-dashed border-brand-300 bg-brand-50 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-brand-700">
                  ⚡ {errorBook.title} · 当前待复习 {errorBook.total} 词（目标正确率 {errorBook.targetAccuracy}%）
                </p>
                <p className="mt-0.5 text-xs text-brand-600/80">{errorBook.rationale}</p>
              </div>
              <button
                type="button"
                onClick={() => startPractice(errorBook.id, errorBook.title)}
                className="shrink-0 rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                {mode === 'test' ? '开始测试' : '开始学习'}
              </button>
            </div>
          )}

          {chapter === 'chapter-1' && activeSeries && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink-900">
                <span className="h-4 w-1 rounded-full bg-brand-500" />
                专项答案词
              </h3>
              <div className="mb-3 flex flex-wrap gap-2 text-sm">
                {specialtySeries.map((series) => (
                  <button
                    key={series.id}
                    type="button"
                    onClick={() => setSeriesTab(series.id)}
                    className={`rounded-full px-3 py-1.5 transition ${
                      series.id === seriesTab
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                    }`}
                  >
                    {series.title}
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {activeSeries.cards.map((card) => (
                  <div
                    key={card.title}
                    onClick={() => card.id && startPractice(card.id, `${activeSeries.title} · ${card.title}`)}
                    className="cursor-pointer rounded-xl border border-ink-400/15 bg-surface p-3 text-sm transition hover:border-brand-300 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink-800">{card.title}</span>
                      <span className="text-xs text-ink-400">{card.count} 词</span>
                    </div>
                    {card.note && <p className="mt-1 text-xs text-ink-400">{card.note}</p>}
                    <div className="mt-2 text-[11px] font-medium text-brand-600">
                      点击开始拼写训练 ›
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <SidebarRail />
      </div>

      {/* Study Guide Modal */}
      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="高效刷词指南" widthClass="max-w-md">
        <div>
          <p className="mb-1 text-xs text-brand-600">第 {STUDY_GUIDE_STEPS[guideStep].step} / 4 步</p>
          <h4 className="mb-2 text-sm font-semibold text-ink-900">{STUDY_GUIDE_STEPS[guideStep].title}</h4>
          <p className="text-sm text-ink-600">{STUDY_GUIDE_STEPS[guideStep].body}</p>
          <div className="mt-5 flex justify-end gap-2">
            {guideStep < STUDY_GUIDE_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setGuideStep((s) => s + 1)}
                className="rounded-full bg-brand-600 px-4 py-1.5 text-sm text-white hover:bg-brand-700"
              >
                下一步
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setGuideOpen(false)
                  setGuideStep(0)
                }}
                className="rounded-full bg-brand-600 px-4 py-1.5 text-sm text-white hover:bg-brand-700"
              >
                知道了
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Interactive Word Dictation / Study Modal */}
      <Modal
        open={Boolean(practiceBook)}
        onClose={() => setPracticeBook(null)}
        title={`${practiceBook?.title || ''} · ${mode === 'test' ? '拼写测试模式' : '词汇学习模式'}`}
        widthClass="max-w-2xl"
      >
        {practiceBusy && practiceWords.length === 0 ? (
          <div className="py-8 text-center text-sm text-ink-400">正在加载词书真题词条...</div>
        ) : practiceResult ? (
          <div>
            <div className="mb-4 rounded-xl bg-brand-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-ink-900">
                  本次正确率：{practiceResult.accuracy}%（{practiceResult.correct} / {practiceResult.total}）
                </span>
                <span className="text-xs text-brand-700">
                  {practiceResult.persisted ? '已同步至学习进度与错词本' : '未登录状态仅展示当次批改'}
                </span>
              </div>
            </div>
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {practiceResult.results.map((r) => (
                <div
                  key={r.word_id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                    r.is_correct ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'
                  }`}
                >
                  <div>
                    <span className="font-bold text-ink-900">{r.word}</span>
                    <span className="ml-2 text-ink-600">{r.meaning_zh}</span>
                  </div>
                  <div className="text-right">
                    <span className={r.is_correct ? 'font-semibold text-emerald-600' : 'font-semibold text-red-600'}>
                      {r.is_correct ? '✓ 拼写正确' : `✗ 你的拼写：${r.user_spelling || '（未填）'}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => practiceBook && startPractice(practiceBook.id, practiceBook.title)}
                className="rounded-full border border-brand-500 px-4 py-1.5 text-xs font-semibold text-brand-600"
              >
                再练一轮
              </button>
              <button
                type="button"
                onClick={() => setPracticeBook(null)}
                className="rounded-full bg-brand-600 px-5 py-1.5 text-xs font-semibold text-white"
              >
                完成
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-3 text-xs text-ink-600">
              {mode === 'test'
                ? '请根据中文释义与真题语境拼写对应的英文答案词（拼错的词将自动加入错词本）：'
                : '学习模式：先记忆标准拼写与真题例句，并在右侧跟打一遍加深肌肉记忆：'}
            </p>
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {practiceWords.map((w, idx) => (
                <div key={w.id} className="rounded-xl border border-ink-400/15 bg-surface-alt/40 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-ink-800">
                        {idx + 1}. {w.meaning_zh}
                        {mode === 'learn' && (
                          <span className="ml-2 font-bold text-brand-700">
                            [{w.word}] {w.phonetic || ''}
                          </span>
                        )}
                      </div>
                      {w.example_sentence && (
                        <div className="mt-1 text-[11px] text-ink-400">
                          例句：
                          {mode === 'test'
                            ? w.example_sentence.replace(new RegExp(escapeRegExp(w.word), 'gi'), '____')
                            : w.example_sentence}
                        </div>
                      )}
                    </div>
                    <input
                      value={spellings[w.id] || ''}
                      onChange={(e) => setSpellings((prev) => ({ ...prev, [w.id]: e.target.value }))}
                      placeholder={mode === 'learn' ? `跟打：${w.word}` : '输入英文拼写'}
                      className="w-44 rounded-lg border border-ink-400/30 bg-surface px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPracticeBook(null)}
                className="rounded-full border border-ink-400/30 px-4 py-1.5 text-xs text-ink-600"
              >
                取消
              </button>
              <button
                type="button"
                disabled={practiceBusy || practiceWords.length === 0}
                onClick={handleSubmitPractice}
                className="rounded-full bg-brand-600 px-5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {practiceBusy ? '正在判分...' : '提交拼写并查看正确率'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
