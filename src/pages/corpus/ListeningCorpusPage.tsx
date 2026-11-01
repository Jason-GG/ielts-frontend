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

  return (
    <div>
      <Breadcrumb current="刘夏来雅思听力语料库" />
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {LISTENING_CHAPTERS.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.tooltip}
                onClick={() => setChapter(c.id)}
                className={`rounded-md p-4 text-left ${
                  c.id === chapter ? 'bg-ink-900 text-white' : 'border border-ink-400/15 bg-surface text-ink-600'
                }`}
              >
                <div className="text-sm font-bold">{c.title}</div>
                <div className="mt-1 text-xs opacity-80">{c.theme}</div>
              </button>
            ))}
          </div>

          <div className="mb-5 flex items-center justify-between">
            <div className="flex rounded-full border border-ink-400/15 bg-surface p-1 text-sm">
              <button
                type="button"
                onClick={() => setMode('test')}
                className={`rounded-full px-4 py-1.5 font-medium ${mode === 'test' ? 'bg-brand-600 text-white' : 'text-ink-600'}`}
              >
                测试模式
              </button>
              <button
                type="button"
                onClick={() => setMode('learn')}
                className={`rounded-full px-4 py-1.5 font-medium ${mode === 'learn' ? 'bg-brand-600 text-white' : 'text-ink-600'}`}
              >
                学习模式
              </button>
            </div>
            <button type="button" onClick={() => setGuideOpen(true)} className="text-sm text-brand-600 hover:underline">
              💡 高效刷词指南 ›
            </button>
          </div>

          {mode === 'learn' && (
            <div className="mb-4 flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`搜索 ${LISTENING_CHAPTERS.find((c) => c.id === chapter)?.title} 的单词`}
                className="w-64 rounded border border-ink-400/20 px-3 py-1.5 text-sm"
              />
              <button type="button" className="rounded bg-brand-600 px-4 py-1.5 text-sm text-white">
                搜索
              </button>
            </div>
          )}

          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {LISTENING_WORD_BOOKS.map((book) => (
              <div key={book.id} className="rounded-md border border-ink-400/15 bg-surface p-4">
                <div className="mb-1 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-ink-900">{book.title}</h4>
                  <span className="text-[11px] text-ink-400">{book.tag}</span>
                </div>
                <p className="mb-2 text-xs text-ink-600">{book.rationale}</p>
                {mode === 'test' ? (
                  <p className="text-xs text-ink-400">
                    我的正确率 <span className="font-semibold text-brand-600">暂无</span> / 目标 {book.targetAccuracy}%
                  </p>
                ) : (
                  <p className="text-xs text-ink-400">
                    已掌握 {book.mastered} / {book.total}，学习中 {book.learning}，未学习{' '}
                    {book.total - book.mastered - book.learning}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-ink-400">
                    全部 {book.total} 词，未开始学习 · 建议今日复习单词 {Math.min(20, book.total)} 词
                  </span>
                </div>
                <button type="button" className="mt-3 w-full rounded bg-brand-600 py-1.5 text-sm text-white hover:bg-brand-700">
                  {mode === 'test' ? '开始测试' : '开始学习'}
                </button>
              </div>
            ))}
          </div>

          <div>
            <h3 className="mb-3 text-base font-semibold text-ink-900">专项答案词</h3>
            <div className="mb-3 flex gap-2 text-sm">
              {SPECIALTY_SERIES.map((series) => (
                <button
                  key={series.id}
                  type="button"
                  onClick={() => setSeriesTab(series.id)}
                  className={`rounded px-3 py-1.5 ${
                    series.id === seriesTab
                      ? 'border border-sky-300 bg-sky-100 text-sky-700'
                      : 'bg-sky-50 text-sky-600'
                  }`}
                >
                  {series.title}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeSeries.cards.map((card) => (
                <div key={card.title} className="rounded-md border border-ink-400/15 bg-surface p-3 text-sm">
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
                className="rounded bg-brand-600 px-4 py-1.5 text-sm text-white"
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
                className="rounded bg-brand-600 px-4 py-1.5 text-sm text-white"
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
