import { useState } from 'react'
import { Breadcrumb } from '../../components/common/Breadcrumb'
import { SidebarRail } from '../../components/common/SidebarRail'
import { Modal } from '../../components/common/Modal'
import {
  LISTENING_CHAPTERS,
  LISTENING_WORD_BOOKS,
  SPECIALTY_SERIES,
  STUDY_GUIDE_STEPS,
} from '../../data/corpus'

type Mode = 'test' | 'learn'

export function ListeningCorpusPage() {
  const [chapter, setChapter] = useState(LISTENING_CHAPTERS[0].id)
  const [mode, setMode] = useState<Mode>('test')
  const [seriesTab, setSeriesTab] = useState(SPECIALTY_SERIES[0].id)
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideStep, setGuideStep] = useState(0)
  const [search, setSearch] = useState('')

  const activeSeries = SPECIALTY_SERIES.find((s) => s.id === seriesTab) ?? SPECIALTY_SERIES[0]
  const activeChapter = LISTENING_CHAPTERS.find((c) => c.id === chapter) ?? LISTENING_CHAPTERS[0]
  const mainWordBooks = LISTENING_WORD_BOOKS.filter((b) => b.id !== 'error-book')
  const errorBook = LISTENING_WORD_BOOKS.find((b) => b.id === 'error-book')

  return (
    <div>
      <Breadcrumb current="刘夏来雅思听力语料库" />
      <div className="flex gap-6">
        <nav className="flex w-[200px] shrink-0 flex-col gap-2">
          {LISTENING_CHAPTERS.map((c) => {
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
                  placeholder={`搜索 ${activeChapter.title} 的单词`}
                  className="w-56 rounded-full border border-ink-400/20 px-4 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
                />
                <button type="button" className="rounded-full bg-brand-600 px-4 py-1.5 text-sm text-white hover:bg-brand-700">
                  搜索
                </button>
              </div>
            )}
          </div>

          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            {mainWordBooks.map((book) => {
              const learnedRatio = book.total ? Math.round((book.mastered / book.total) * 100) : 0
              return (
                <div
                  key={book.id}
                  className="flex flex-col rounded-2xl border border-ink-400/15 bg-surface p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-ink-900">{book.title}</h4>
                    <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[11px] text-ink-600">{book.tag}</span>
                  </div>
                  <p className="mb-3 text-xs text-ink-600">{book.rationale}</p>

                  {mode === 'test' ? (
                    <p className="text-xs text-ink-400">
                      我的正确率 <span className="font-semibold text-brand-600">暂无</span> / 目标 {book.targetAccuracy}%
                    </p>
                  ) : (
                    <>
                      <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-alt">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${learnedRatio}%` }} />
                      </div>
                      <p className="text-xs text-ink-400">
                        已掌握 {book.mastered} / {book.total}，学习中 {book.learning}，未学习{' '}
                        {book.total - book.mastered - book.learning}
                      </p>
                    </>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-ink-400">
                      全部 {book.total} 词，未开始学习 · 建议今日复习单词 {Math.min(20, book.total)} 词
                    </span>
                  </div>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-full bg-brand-600 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    {mode === 'test' ? '开始测试' : '开始学习'}
                  </button>
                </div>
              )
            })}
          </div>

          {errorBook && (
            <div className="mb-8 flex items-center justify-between rounded-2xl border border-dashed border-brand-300 bg-brand-50 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-brand-700">⚡ {errorBook.title} · {errorBook.tag}</p>
                <p className="mt-0.5 text-xs text-brand-600/80">{errorBook.rationale}</p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                {mode === 'test' ? '开始测试' : '开始学习'}
              </button>
            </div>
          )}

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink-900">
              <span className="h-4 w-1 rounded-full bg-brand-500" />
              专项答案词
            </h3>
            <div className="mb-3 flex flex-wrap gap-2 text-sm">
              {SPECIALTY_SERIES.map((series) => (
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
                  className="rounded-xl border border-ink-400/15 bg-surface p-3 text-sm transition hover:border-brand-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink-800">{card.title}</span>
                    <span className="text-xs text-ink-400">{card.count} 词</span>
                  </div>
                  {card.note && <p className="mt-1 text-xs text-ink-400">{card.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <SidebarRail />
      </div>

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
    </div>
  )
}
