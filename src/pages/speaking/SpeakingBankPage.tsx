import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { Breadcrumb } from '../../components/common/Breadcrumb'
import { FilterChips } from '../../components/common/FilterChips'
import { Modal } from '../../components/common/Modal'
import {
  SPEAKING_MODULES,
  SPEAKING_QUESTIONS,
  SPEAKING_TAGS,
  SPEAKING_TOPICS,
} from '../../data/speakingAndMembership'
import type { SpeakingQuestion } from '../../types'

export function SpeakingBankPage() {
  const [questions, setQuestions] = useState<SpeakingQuestion[]>(SPEAKING_QUESTIONS)
  const [moduleFilter, setModuleFilter] = useState('全部')
  const [tagFilter, setTagFilter] = useState('全部')
  const [topicFilter, setTopicFilter] = useState('全部')
  const [searchKw, setSearchKw] = useState('')
  const [debouncedKw, setDebouncedKw] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [buildError, setBuildError] = useState<string | null>(null)
  const [previewQuestion, setPreviewQuestion] = useState<SpeakingQuestion | null>(null)
  const [createdSetModal, setCreatedSetModal] = useState<{
    title: string
    questions: Array<{ id: number; module: string; topic: string; title: string; sub_questions_json: string[]; sample_answer: string }>
  } | null>(null)

  const moduleOptions = useMemo(() => ['全部', ...SPEAKING_MODULES], [])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKw(searchKw.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [searchKw])

  useEffect(() => {
    let cancelled = false
    api
      .getSpeakingQuestions({
        module: moduleFilter,
        tag: tagFilter,
        topic: topicFilter,
        q: debouncedKw || undefined,
      })
      .then((res) => {
        if (!cancelled) setQuestions(res.questions)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [moduleFilter, tagFilter, topicFilter, debouncedKw])

  function toggle(id: string) {
    setBuildError(null)
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleBuildSet() {
    if (selected.length === 0) return
    setBuildError(null)
    try {
      const res = await api.createSpeakingSet(selected)
      setCreatedSetModal(res.set)
      setSelected([])
    } catch (err) {
      setBuildError(err instanceof Error ? err.message : '生成练习集失败')
    }
  }

  return (
    <div>
      <Breadcrumb current="口语题库" />
      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex gap-2">
              <button type="button" className="rounded-lg bg-brand-600 px-3 py-1.5 text-white">
                题库&素材
              </button>
              <button type="button" className="rounded-lg bg-surface px-3 py-1.5 text-ink-600">
                答题元素 <span className="text-[10px] text-brand-500">Beta</span>
              </button>
              <button type="button" className="rounded-lg bg-surface px-3 py-1.5 text-ink-600">
                答题结构 <span className="text-[10px] text-brand-500">Beta</span>
              </button>
            </div>
            <input
              value={searchKw}
              onChange={(e) => setSearchKw(e.target.value)}
              placeholder="搜索口语话题关键词..."
              className="w-56 rounded-full border border-ink-400/25 bg-surface px-4 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="mb-4 rounded-xl border border-ink-400/15 bg-surface p-4 shadow-sm">
            <FilterChips label="模块" options={moduleOptions} value={moduleFilter} onChange={setModuleFilter} />
            <FilterChips label="新旧" options={SPEAKING_TAGS} value={tagFilter} onChange={setTagFilter} />
            <FilterChips label="主题" options={SPEAKING_TOPICS} value={topicFilter} onChange={setTopicFilter} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {questions.map((q) => (
              <div
                key={q.id}
                className="relative flex items-start justify-between gap-3 rounded-xl border border-ink-400/15 bg-surface p-3.5 text-sm shadow-sm transition hover:border-brand-300"
              >
                {q.isNew && (
                  <span className="absolute -top-2 -left-2 rounded bg-accent-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    新题
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(q.id)}
                    onChange={() => toggle(q.id)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-xs text-ink-400">
                      {q.module} · {q.topic} {q.tag ? `· ${q.tag}` : ''}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewQuestion(q)}
                      className="mt-0.5 text-left font-medium text-ink-800 hover:text-brand-600"
                    >
                      {q.title}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewQuestion(q)}
                  className="shrink-0 text-xs text-brand-600 hover:underline"
                >
                  素材 ›
                </button>
              </div>
            ))}
          </div>
        </div>
        <aside className="flex w-[280px] shrink-0 flex-col gap-4">
          <div className="rounded-xl border border-ink-400/15 bg-surface p-4 shadow-sm">
            <h4 className="mb-1 text-sm font-semibold text-ink-900">口语全真模考</h4>
            <p className="text-xs text-ink-600">今日报名 301 · 7 日 2,552</p>
            <p className="mt-1 text-lg font-bold text-brand-600">¥18.8/节</p>
            <p className="text-[11px] text-ink-400">每 30 天仅可购买一节</p>
            <Link
              to="/speaking/mock"
              className="mt-3 block rounded-full bg-brand-600 py-1.5 text-center text-xs font-semibold text-white hover:bg-brand-700"
            >
              了解真人口语模考
            </Link>
          </div>
          <div className="rounded-xl border border-dashed border-ink-400/30 p-4 text-center text-xs text-ink-400">
            移动口语题库 — 微信扫码即可打开
          </div>
        </aside>
      </div>
      {selected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full bg-brand-700 px-6 py-3 text-sm text-white shadow-lg">
          <span>已选 {selected.length} 题</span>
          {buildError && <span className="text-xs text-amber-200">{buildError}</span>}
          <button
            type="button"
            onClick={handleBuildSet}
            className="rounded-full bg-accent-500 px-4 py-1 text-xs font-semibold text-white hover:bg-accent-600"
          >
            生成练习集
          </button>
        </div>
      )}

      {/* Question & Sample Material Preview Modal */}
      <Modal
        open={Boolean(previewQuestion)}
        onClose={() => setPreviewQuestion(null)}
        title={previewQuestion ? `${previewQuestion.module} · ${previewQuestion.topic}` : '口语话题卡'}
        widthClass="max-w-lg"
      >
        {previewQuestion && (
          <div className="space-y-3 text-sm">
            <h4 className="font-bold text-ink-900">{previewQuestion.title}</h4>
            {previewQuestion.subQuestions && previewQuestion.subQuestions.length > 0 && (
              <div className="rounded-lg bg-surface-alt p-3 text-xs text-ink-700">
                <div className="mb-1 font-semibold text-ink-900">追问 / 提纲要点 (Cue Points)：</div>
                <ul className="list-disc space-y-1 pl-4">
                  {previewQuestion.subQuestions.map((sq) => (
                    <li key={sq}>{sq}</li>
                  ))}
                </ul>
              </div>
            )}
            {previewQuestion.sampleAnswer && (
              <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-xs leading-relaxed text-ink-800">
                <div className="mb-1 font-semibold text-brand-700">高分示范思路 / 参考范文：</div>
                {previewQuestion.sampleAnswer}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Generated Speaking Set Modal */}
      <Modal
        open={Boolean(createdSetModal)}
        onClose={() => setCreatedSetModal(null)}
        title={createdSetModal?.title || '口语自选练习集'}
        widthClass="max-w-xl"
      >
        {createdSetModal && (
          <div className="max-h-96 space-y-3 overflow-y-auto pr-1 text-xs">
            {createdSetModal.questions.map((q, idx) => (
              <div key={q.id} className="rounded-xl border border-ink-400/15 p-3">
                <div className="font-bold text-ink-900">
                  {idx + 1}. [{q.module}] {q.title}
                </div>
                {q.sub_questions_json?.length > 0 && (
                  <ul className="mt-1 list-disc pl-4 text-ink-600">
                    {q.sub_questions_json.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                )}
                {q.sample_answer && <p className="mt-2 rounded bg-brand-50 p-2 text-ink-700">{q.sample_answer}</p>}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
