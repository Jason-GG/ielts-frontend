import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../../api/client'
import { Breadcrumb } from '../../components/common/Breadcrumb'
import { useAuth } from '../../context/AuthContext'
import type { ExamQuestion, ExamQuestionGroup, ExamTestDetail, SubmitExamResponse } from '../../types'

const TFNG_OPTIONS = [
  { key: 'TRUE', text: 'TRUE' },
  { key: 'FALSE', text: 'FALSE' },
  { key: 'NOT GIVEN', text: 'NOT GIVEN' },
]

const YNNG_OPTIONS = [
  { key: 'YES', text: 'YES' },
  { key: 'NO', text: 'NO' },
  { key: 'NOT GIVEN', text: 'NOT GIVEN' },
]

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function countWords(text: string): number {
  return (text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

/** Safely extract plain-text paragraphs from HTML transcript without dangerouslySetInnerHTML (XSS-safe). */
function extractSafeParagraphs(html: string): string[] {
  if (!html) return []
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const blocks = Array.from(doc.body.querySelectorAll('p, li, div, h3, h4'))
      .map((el) => (el.textContent || '').trim())
      .filter(Boolean)
    if (blocks.length > 0) return blocks
    return (doc.body.textContent || '')
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
  } catch {
    return html
      .replace(/<[^>]+>/g, '\n')
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
}

interface ExamPracticePageProps {
  isGeneratedSet?: boolean
}

export function ExamPracticePage({ isGeneratedSet = false }: ExamPracticePageProps) {
  const { testId, setId } = useParams<{ testId?: string; setId?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, openLoginModal } = useAuth()

  const sectionIdParam = searchParams.get('sectionId')
  const numericSectionId = sectionIdParam ? Number(sectionIdParam) : null

  const [exam, setExam] = useState<ExamTestDetail | null>(null)
  const [activeSecIdx, setActiveSecIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [elapsed, setElapsed] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [draftNotice, setDraftNotice] = useState<string | null>(null)
  const [result, setResult] = useState<SubmitExamResponse | null>(null)
  const [showTranscript, setShowTranscript] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setResult(null)
    setShowTranscript(false)

    const promise = isGeneratedSet
      ? api.getGeneratedSetDetail(Number(setId))
      : api.getTestDetail(Number(testId), numericSectionId)

    promise
      .then((data) => {
        if (cancelled) return
        setExam(data)
        setActiveSecIdx(0)
        if (data.saved_draft?.answers_json) {
          setAnswers(data.saved_draft.answers_json)
          setElapsed(data.saved_draft.elapsed_seconds || 0)
        } else {
          setAnswers({})
          setElapsed(0)
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '加载试卷失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [testId, setId, numericSectionId, isGeneratedSet])

  useEffect(() => {
    if (!exam || result) return
    const timer = window.setInterval(() => setElapsed((prev) => prev + 1), 1000)
    return () => window.clearInterval(timer)
  }, [exam, result])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate, activeSecIdx])

  const activeSection = exam?.sections[activeSecIdx] ?? exam?.sections[0]

  const passageData = useMemo(() => {
    if (!activeSection) return null
    for (const g of activeSection.groups) {
      if (g.shared_content_json?.passage_paragraphs && g.shared_content_json.passage_paragraphs.length > 0) {
        return {
          title: g.shared_content_json.passage_title || activeSection.title || 'Reading Passage',
          subtitle: g.shared_content_json.passage_subtitle,
          paragraphs: g.shared_content_json.passage_paragraphs,
        }
      }
    }
    return null
  }, [activeSection])

  const activeTranscriptParagraphs = useMemo(() => {
    if (!result?.sections_review || !activeSection) return []
    const rev =
      result.sections_review.find((s) => s.id === activeSection.id) ??
      result.sections_review[activeSecIdx] ??
      result.sections_review[0]
    return rev?.transcript_html ? extractSafeParagraphs(rev.transcript_html) : []
  }, [result, activeSection, activeSecIdx])

  const resultByQuestionKey = useMemo(() => {
    const map: Record<string, SubmitExamResponse['question_results'][number]> = {}
    if (!result) return map
    for (const qr of result.question_results) {
      map[`id_${qr.question_id}`] = qr
      map[`num_${qr.question_number}`] = qr
    }
    return map
  }, [result])

  function answerKeyForQuestion(q: ExamQuestion): string {
    return isGeneratedSet ? `qid_${q.id}` : String(q.question_number)
  }

  function setAnswer(key: string, val: string) {
    setAnswers((prev) => ({ ...prev, [key]: val }))
  }

  function renderInlineTextWithBlanks(text: string, groupQuestions: ExamQuestion[]) {
    const byNum: Record<string, ExamQuestion> = {}
    for (const q of groupQuestions) {
      byNum[String(q.question_number)] = q
    }
    const parts = text.split(/(\{\{\d+\}\})/g)
    return parts.map((part, i) => {
      const m = part.match(/^\{\{(\d+)\}\}$/)
      if (!m) return <span key={i}>{part}</span>
      const qnum = m[1]
      const qObj = byNum[qnum]
      const aKey = qObj ? answerKeyForQuestion(qObj) : qnum
      const qLabel = qObj ? (qObj.display_number ?? qObj.question_number) : Number(qnum)
      const qr = qObj
        ? resultByQuestionKey[`id_${qObj.id}`] ?? resultByQuestionKey[`num_${qLabel}`]
        : resultByQuestionKey[`num_${qnum}`]

      return (
        <span key={i} className="mx-1 inline-flex items-center gap-1">
          <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[11px] font-bold text-brand-700">{qLabel}</span>
          <input
            disabled={Boolean(result)}
            value={answers[aKey] || ''}
            onChange={(e) => setAnswer(aKey, e.target.value)}
            placeholder={`第 ${qLabel} 题`}
            className={`w-32 rounded border px-2 py-0.5 text-xs text-ink-900 focus:outline-none ${
              qr
                ? qr.is_correct
                  ? 'border-emerald-400 bg-emerald-50 font-semibold text-emerald-800'
                  : 'border-red-400 bg-red-50 font-semibold text-red-700'
                : 'border-brand-300 bg-surface focus:border-brand-600'
            }`}
          />
        </span>
      )
    })
  }

  async function handleSaveDraft() {
    if (!exam || isGeneratedSet) return
    if (!user) {
      openLoginModal()
      return
    }
    try {
      await api.saveTestDraft(exam.id, {
        section_id: numericSectionId,
        elapsed_seconds: elapsed,
        answers,
      })
      setDraftNotice('做题草稿已保存（题库列表状态已更新为「练习中」）')
      window.setTimeout(() => setDraftNotice(null), 3500)
    } catch (e) {
      setDraftNotice(e instanceof Error ? e.message : '暂存失败')
    }
  }

  async function handleSubmitExam() {
    if (!exam) return
    setSubmitting(true)
    setError(null)
    try {
      const res = isGeneratedSet
        ? await api.submitGeneratedSet(exam.id, answers)
        : await api.submitTestAttempt(exam.id, {
            student_name: user?.display_name || 'Student',
            mode: numericSectionId ? 'section_practice' : 'full_test',
            section_id: numericSectionId,
            duration_seconds: elapsed,
            answers,
          })
      setResult(res)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e instanceof Error ? e.message : '交卷失败')
    } finally {
      setSubmitting(false)
    }
  }

  function renderQuestionControl(q: ExamQuestion, group: ExamQuestionGroup) {
    const aKey = answerKeyForQuestion(q)
    const val = answers[aKey] || ''
    const qNumLabel = q.display_number ?? q.question_number
    const qr = resultByQuestionKey[`id_${q.id}`] ?? resultByQuestionKey[`num_${qNumLabel}`]

    const promptUpper = (q.prompt_text || '').toUpperCase()
    const isEssayOrSpeaking =
      q.question_type === 'essay' ||
      q.question_type === 'speaking_prompt' ||
      promptUpper.includes('WRITING TASK') ||
      promptUpper.startsWith('PART ')

    if (isEssayOrSpeaking) {
      const wc = countWords(val)
      return (
        <div key={q.id} className="rounded-xl border border-ink-400/15 bg-surface p-4">
          <div className="mb-2 whitespace-pre-line text-sm leading-relaxed text-ink-900">{q.prompt_text}</div>
          <textarea
            rows={10}
            disabled={Boolean(result)}
            value={val}
            onChange={(e) => setAnswer(aKey, e.target.value)}
            placeholder="请在此输入您的英文作文或口语作答提纲..."
            className="w-full rounded-xl border border-ink-400/25 bg-surface-alt/30 p-3 text-sm leading-relaxed focus:border-brand-500 focus:bg-surface focus:outline-none"
          />
          <div className="mt-1.5 flex items-center justify-between text-xs text-ink-400">
            <span>当前词数：{wc} words</span>
            <span>Task 1 建议 ≥ 150 词 · Task 2 建议 ≥ 250 词</span>
          </div>
          {qr && (
            <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50 p-3 text-xs text-ink-800">
              <div className="font-semibold text-brand-700">批改反馈与参考解析：</div>
              <p className="mt-1 whitespace-pre-line">{qr.explanation_zh}</p>
            </div>
          )}
        </div>
      )
    }

    const gType = (group.group_type || '').toLowerCase()
    const qType = (q.question_type || '').toLowerCase()
    let choiceOptions = q.options_json?.filter((o) => o.key && o.text) as Array<{ key: string; text: string }>
    if ((!choiceOptions || choiceOptions.length === 0) && (gType.includes('true_false') || qType.includes('true_false'))) {
      choiceOptions = TFNG_OPTIONS
    } else if ((!choiceOptions || choiceOptions.length === 0) && (gType.includes('yes_no') || qType.includes('yes_no'))) {
      choiceOptions = YNNG_OPTIONS
    }

    const cleanPrompt = (q.prompt_text || '').replace(/\{\{blank\}\}/g, ' ________ ')

    return (
      <div
        key={q.id}
        className={`rounded-xl border p-3.5 text-sm transition ${
          qr
            ? qr.is_correct
              ? 'border-emerald-300 bg-emerald-50/40'
              : 'border-red-300 bg-red-50/40'
            : 'border-ink-400/15 bg-surface'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 text-ink-900">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {qNumLabel}
            </span>
            <span>{cleanPrompt}</span>
          </div>

          {(!choiceOptions || choiceOptions.length === 0) && (
            <input
              disabled={Boolean(result)}
              value={val}
              onChange={(e) => setAnswer(aKey, e.target.value)}
              placeholder={group.shared_content_json?.box_options ? '填写选项字母 (如 A)' : '输入答案'}
              className="w-44 rounded-lg border border-ink-400/30 bg-surface px-3 py-1.5 text-sm focus:border-brand-600 focus:outline-none"
            />
          )}
        </div>

        {choiceOptions && choiceOptions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 pl-8">
            {choiceOptions.map((opt) => {
              const selected = val.toUpperCase() === opt.key.toUpperCase()
              return (
                <button
                  key={opt.key}
                  type="button"
                  disabled={Boolean(result)}
                  onClick={() => setAnswer(aKey, opt.key)}
                  className={`rounded-lg border px-3 py-1.5 text-left text-xs transition ${
                    selected
                      ? 'border-brand-600 bg-brand-600 font-semibold text-white'
                      : 'border-ink-400/20 bg-surface-alt/50 text-ink-800 hover:border-brand-300'
                  }`}
                >
                  <span className="font-bold">{opt.key}.</span> {opt.text}
                </button>
              )
            })}
          </div>
        )}

        {qr && (
          <div className="mt-2.5 border-t border-ink-400/10 pt-2 pl-8 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className={qr.is_correct ? 'font-bold text-emerald-600' : 'font-bold text-red-600'}>
                {qr.is_correct ? '✓ 回答正确' : `✗ 你的答案：${qr.user_answer || '（未作答）'}`}
              </span>
              <span className="font-semibold text-brand-700">标准答案：{qr.correct_answer}</span>
            </div>
            {qr.explanation_zh && <p className="mt-1 text-ink-600">解析：{qr.explanation_zh}</p>}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return <div className="py-16 text-center text-sm text-ink-400">正在加载机考真题卷与多媒体资源...</div>
  }

  if (error || !exam || !activeSection) {
    return (
      <div className="rounded-2xl border border-red-200 bg-surface p-8 text-center">
        <p className="text-sm text-red-600">{error || '未找到对应试卷'}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 rounded-full bg-brand-600 px-5 py-2 text-xs text-white"
        >
          返回上一页
        </button>
      </div>
    )
  }

  const isListening = exam.module === 'listening' || exam.subject === 'listening'
  const isWriting = exam.module === 'writing'
  const answeredCount = Object.values(answers).filter((v) => String(v).trim().length > 0).length
  const showSectionScanImages =
    (isWriting || activeSection.groups.some((g) => (g.group_type || '').toLowerCase().includes('map'))) &&
    activeSection.page_image_urls &&
    activeSection.page_image_urls.length > 0

  return (
    <div>
      <Breadcrumb current={exam.book_title ? `${exam.book_title} · ${exam.title}` : exam.title} />

      {/* Top Exam Control Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink-400/15 bg-surface px-5 py-3.5 shadow-sm">
        <div>
          <h1 className="text-base font-bold text-ink-900">
            {exam.book_title ? `${exam.book_title} · ` : ''}
            {exam.title}
          </h1>
          <p className="text-xs text-ink-400">
            已答 {answeredCount} / {exam.total_questions} 题 · 用时 {formatDuration(elapsed)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!result && !isGeneratedSet && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="rounded-full border border-brand-400 px-4 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50"
            >
              暂存草稿
            </button>
          )}
          {!result ? (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitExam}
              className="rounded-full bg-accent-500 px-5 py-1.5 text-xs font-semibold text-white hover:bg-accent-600 disabled:opacity-50"
            >
              {submitting ? '正在批改...' : '提交交卷'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setResult(null)
                setShowTranscript(false)
                setAnswers({})
                setElapsed(0)
              }}
              className="rounded-full bg-brand-600 px-5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
            >
              重新做题
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-ink-400/25 px-4 py-1.5 text-xs text-ink-600 hover:bg-surface-alt"
          >
            返回列表
          </button>
        </div>
      </div>

      {draftNotice && (
        <div className="mb-4 rounded-xl bg-brand-50 px-4 py-2.5 text-xs font-medium text-brand-700">{draftNotice}</div>
      )}

      {/* Score Banner on Submit */}
      {result && (
        <div className="mb-5 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 p-6 text-white shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-brand-100">IELTS Official Band Conversion</div>
              <div className="mt-1 text-3xl font-extrabold">
                Band {result.band_score.toFixed(1)}{' '}
                <span className="text-lg font-semibold text-brand-100">
                  （答对 {result.score} / {result.total_questions} 题）
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-xs text-brand-50">{result.evaluation_feedback}</p>
            </div>
            {activeTranscriptParagraphs.length > 0 && (
              <button
                type="button"
                onClick={() => setShowTranscript((v) => !v)}
                className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/25"
              >
                {showTranscript ? '收起听力原文' : '查看本节听力原文'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Safe Listening Transcript Viewer (Post-Submission) */}
      {result && showTranscript && activeTranscriptParagraphs.length > 0 && (
        <div className="mb-5 max-h-72 overflow-y-auto rounded-2xl border border-brand-200 bg-surface p-5 text-xs leading-relaxed text-ink-800 shadow-sm">
          <div className="mb-2 font-bold text-brand-700">听力原文对照（{activeSection.title || `Part ${activeSection.section_number}`}）：</div>
          <div className="space-y-2">
            {activeTranscriptParagraphs.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Section Tabs */}
      {exam.sections.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {exam.sections.map((sec, idx) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSecIdx(idx)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                idx === activeSecIdx
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-surface text-ink-600 hover:bg-brand-50'
              }`}
            >
              {sec.title ? sec.title.slice(0, 32) : `Part ${sec.section_number}`}
            </button>
          ))}
        </div>
      )}

      {/* Listening Audio Bar */}
      {isListening && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-200 bg-surface px-5 py-3 shadow-sm">
          <div className="text-xs font-semibold text-ink-800">
            🎧 听力音频：{activeSection.title || `Section ${activeSection.section_number}`}
          </div>
          <audio
            ref={audioRef}
            key={activeSection.id}
            controls
            src={activeSection.audio_stream_url}
            className="h-9 flex-1 max-w-md"
          />
          <div className="flex items-center gap-1 text-xs">
            <span className="mr-1 text-ink-400">倍速:</span>
            {[0.75, 1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setPlaybackRate(rate)}
                className={`rounded px-2 py-0.5 ${
                  playbackRate === rate ? 'bg-brand-600 text-white' : 'bg-surface-alt text-ink-600'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scanned Chart / Map Reference for Writing Task 1 or Map Sections */}
      {showSectionScanImages && (
        <div className="mb-5 rounded-2xl border border-ink-400/15 bg-surface p-4 shadow-sm">
          <div className="mb-2 text-xs font-semibold text-ink-600">原卷图表 / 题面扫描页参考：</div>
          <div className="flex flex-wrap gap-4">
            {activeSection.page_image_urls.slice(0, 2).map((imgUrl) => (
              <img
                key={imgUrl}
                src={imgUrl}
                alt={activeSection.title || 'Exam Chart'}
                className="max-h-96 rounded-lg border border-ink-400/15 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Split Workspace (Reading Passage on Left + Questions on Right) */}
      <div className={`grid gap-6 ${passageData ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {passageData && (
          <div className="max-h-[78vh] overflow-y-auto rounded-2xl border border-ink-400/15 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink-900">{passageData.title}</h2>
            {passageData.subtitle && <p className="mt-1 text-xs italic text-ink-600">{passageData.subtitle}</p>}
            <div className="mt-4 space-y-3.5 text-sm leading-relaxed text-ink-800">
              {passageData.paragraphs.map((p, idx) => (
                <p key={idx}>
                  {p.label && (
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded bg-brand-100 text-xs font-bold text-brand-700">
                      {p.label}
                    </span>
                  )}
                  {p.text}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-5">
          {activeSection.groups.map((group) => {
            const sc = group.shared_content_json
            const hasTable = sc?.headers && Array.isArray(sc.rows)
            const hasFormRows = !sc?.headers && Array.isArray(sc?.rows)

            return (
              <div key={group.id} className="rounded-2xl border border-ink-400/15 bg-surface p-5 shadow-sm">
                <div className="mb-3 border-b border-ink-400/10 pb-2.5">
                  <div className="text-xs font-bold uppercase tracking-wide text-brand-600">
                    Questions {group.question_start}–{group.question_end}
                    {group.group_title ? ` · ${group.group_title}` : ''}
                  </div>
                  <p className="mt-1 text-xs font-medium text-ink-600">{group.instructions}</p>
                </div>

                {/* Map / Diagram Image */}
                {group.diagram_url && (
                  <div className="mb-4 rounded-xl border border-ink-400/15 bg-surface-alt/40 p-3">
                    <img
                      src={group.diagram_url}
                      alt={group.group_title || 'Question Diagram'}
                      className="mx-auto max-h-80 rounded object-contain"
                      onError={(e) => {
                        ;(e.currentTarget.parentElement as HTMLElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}

                {/* Shared Option Box (Matching / Multiple Choice Box) */}
                {sc?.box_options && sc.box_options.length > 0 && (
                  <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50/50 p-3.5 text-xs">
                    <div className="mb-1.5 font-bold text-brand-800">备选框 (Options)：</div>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {sc.box_options.map((bo) => (
                        <div key={bo.key}>
                          <span className="font-bold text-brand-700">{bo.key}.</span> {bo.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structured Table Completion */}
                {hasTable && sc?.headers && sc.rows && (
                  <div className="mb-4 overflow-x-auto rounded-xl border border-ink-400/15">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-surface-alt text-ink-800">
                        <tr>
                          {sc.headers.map((h, hi) => (
                            <th key={hi} className="border-b border-ink-400/15 px-3 py-2 font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-400/10">
                        {(sc.rows as string[][]).map((row, ri) => (
                          <tr key={ri}>
                            {Array.isArray(row) &&
                              row.map((cell, ci) => (
                                <td key={ci} className="whitespace-pre-line px-3 py-2.5 text-ink-800">
                                  {renderInlineTextWithBlanks(String(cell), group.questions)}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Form Completion Key-Value Rows */}
                {hasFormRows && sc?.rows && (
                  <div className="mb-4 space-y-2 rounded-xl border border-ink-400/15 bg-surface-alt/40 p-4 text-xs">
                    {sc.example && (
                      <div className="text-ink-400">
                        Example — <span className="font-semibold">{sc.example.label}</span> {sc.example.value}
                      </div>
                    )}
                    {(sc.rows as Array<{ label?: string; text?: string }>).map((r, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-2 text-ink-800">
                        {r.label && <span className="w-36 font-semibold">{r.label}</span>}
                        <span>{renderInlineTextWithBlanks(r.text || '', group.questions)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  {group.questions.map((q) => renderQuestionControl(q, group))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
