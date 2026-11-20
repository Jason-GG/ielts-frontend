import type {
  BookGroup,
  CorpusWord,
  ExamTestDetail,
  MembershipTier,
  PlatformUser,
  ProgressStatus,
  SpeakingQuestion,
  SubmitExamResponse,
  UserMembership,
  WordBook,
} from '../types'
import type { SpecialtySeries } from '../data/corpus'
import type { WritingPaper } from '../data/questionBanks'

const TOKEN_KEY = 'ielts_auth_token'
const API_BASE = import.meta.env.VITE_API_BASE || ''

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init?.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const method = (init?.method || 'GET').toUpperCase()
  const url = `${API_BASE}${path}`
  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
  console.info(`[IELTS API ->] ${method} ${url}`)

  const res = await fetch(url, {
    ...init,
    headers,
  })
  const elapsedMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt)
  if (!res.ok) {
    console.error(`[IELTS API <-] ${res.status} ${method} ${url} (${elapsedMs}ms)`)
    let errMsg = `请求失败 (${res.status})`
    try {
      const errBody = await res.json()
      if (errBody?.detail) {
        errMsg = typeof errBody.detail === 'string' ? errBody.detail : JSON.stringify(errBody.detail)
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errMsg)
  }
  console.info(`[IELTS API <-] ${res.status} ${method} ${url} (${elapsedMs}ms)`)
  return res.json() as Promise<T>
}

export const api = {
  // Home & Health
  getHomeSummary: () =>
    apiRequest<{
      stats: {
        total_books: number
        total_tests: number
        total_sections: number
        total_questions: number
        speaking_topics_count: number
        corpus_words_count: number
        total_attempts: number
      }
      cambridgeBooksRange: string
      nineScoreBooksRange: string
    }>('/api/home/summary'),

  // Auth & Membership
  register: (payload: {
    username: string
    password: string
    display_name?: string
    phone?: string
    email?: string
    target_band?: number
  }) =>
    apiRequest<{ token: string; user: PlatformUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { account: string; password: string }) =>
    apiRequest<{ token: string; user: PlatformUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  demoWechatLogin: () =>
    apiRequest<{ token: string; user: PlatformUser }>('/api/auth/demo-wechat-login', {
      method: 'POST',
    }),

  getMe: () => apiRequest<{ user: PlatformUser }>('/api/auth/me'),

  logout: () => apiRequest<{ status: string }>('/api/auth/logout', { method: 'POST' }),

  getMembershipTiers: () =>
    apiRequest<{ tiers: MembershipTier[]; activeMemberships: UserMembership[] }>('/api/memberships/tiers'),

  subscribeMembership: (tier_id: string, plan_term: string) =>
    apiRequest<{ status: string; memberships: UserMembership[] }>('/api/memberships/subscribe', {
      method: 'POST',
      body: JSON.stringify({ tier_id, plan_term }),
    }),

  createBooking: (payload: {
    service_type: 'speaking_mock' | 'self_study_camp' | 'tutor_onboarding'
    plan_name?: string
    contact_name: string
    contact_info: string
    notes?: string
  }) =>
    apiRequest<{ status: string; booking: { id: number; service_type: string } }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Question Banks
  getListeningBank: (params?: { type?: string; scene?: string; progress?: string }) => {
    const qs = new URLSearchParams()
    if (params?.type) qs.set('type', params.type)
    if (params?.scene) qs.set('scene', params.scene)
    if (params?.progress) qs.set('progress', params.progress)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return apiRequest<{ books: BookGroup[]; types: string[]; scenes: string[] }>(
      `/api/question-banks/listening${suffix}`,
    )
  },

  getReadingBank: (variant: 'A' | 'G', params?: { type?: string; scene?: string; progress?: string }) => {
    const qs = new URLSearchParams({ variant })
    if (params?.type) qs.set('type', params.type)
    if (params?.scene) qs.set('scene', params.scene)
    if (params?.progress) qs.set('progress', params.progress)
    return apiRequest<{ books: BookGroup[]; types: string[]; scenes: string[] | null }>(
      `/api/question-banks/reading?${qs.toString()}`,
    )
  },

  getWritingBank: (variant: 'A' | 'G', typeFilter = '全部') => {
    const qs = new URLSearchParams({ variant, type: typeFilter })
    return apiRequest<{ papers: WritingPaper[]; types: string[] }>(
      `/api/question-banks/writing?${qs.toString()}`,
    )
  },

  getDictationBank: (tab: 'cambridge' | 'nine_score' | 'bookmarks') =>
    apiRequest<{
      books: Array<{
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
      bookmarkedSectionIds: number[]
    }>(`/api/question-banks/dictation?tab=${tab}`),

  toggleBookmark: (target_type: string, target_id: number) =>
    apiRequest<{ status: string; bookmarked: boolean }>('/api/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ target_type, target_id }),
    }),

  // Jijing & Sets
  getJijingRanking: (subject: 'listening' | 'reading' | 'writing') =>
    apiRequest<{
      subject: string
      total: number
      completedCount: number
      updatedAt: string
      items: Array<{
        id: number
        rank: number
        title: string
        part: string
        scene: string
        questionType?: string
        testId: number | null
        sectionId: number | null
        status: ProgressStatus
      }>
    }>(`/api/jijing/${subject}`),

  getPracticeSets: (category: string) =>
    apiRequest<{
      category: string
      books: Array<{
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
    }>(`/api/sets?category=${encodeURIComponent(category)}`),

  generateMockSet: (subject: '听力' | '阅读') =>
    apiRequest<{
      set: {
        id: number
        subject: string
        title: string
        sectionIds: number[]
        status: ProgressStatus
        score: number | null
        total_questions: number
        band_score: number | null
        created_at: string
      }
    }>('/api/sets/generate', {
      method: 'POST',
      body: JSON.stringify({ subject }),
    }),

  getGeneratedSets: () =>
    apiRequest<{
      sets: Array<{
        id: number
        subject: string
        title: string
        sectionIds: number[]
        status: ProgressStatus
        score: number | null
        total_questions: number
        band_score: number | null
        created_at: string
      }>
    }>('/api/sets/generated'),

  getGeneratedSetDetail: (setId: number) => apiRequest<ExamTestDetail>(`/api/sets/generated/${setId}`),

  submitGeneratedSet: (setId: number, answers: Record<string, string>) =>
    apiRequest<SubmitExamResponse>(`/api/sets/generated/${setId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  // Corpus
  getListeningCorpus: (chapter = 'chapter-1', search = '') => {
    const qs = new URLSearchParams({ chapter })
    if (search.trim()) qs.set('search', search.trim())
    return apiRequest<{
      chapters: Array<{ id: string; title: string; theme: string; tooltip: string }>
      wordBooks: WordBook[]
      specialtySeries: SpecialtySeries[]
      studyGuideSteps: Array<{ step: number; title: string; body: string }>
      searchResults: CorpusWord[]
    }>(`/api/corpus/listening?${qs.toString()}`)
  },

  getCorpusBookWords: (bookId: string, limit = 12) =>
    apiRequest<{
      book: { id: string; title: string; targetAccuracy: number; rationale: string }
      words: CorpusWord[]
    }>(`/api/corpus/books/${encodeURIComponent(bookId)}/words?limit=${limit}`),

  submitCorpusPractice: (
    bookId: string,
    mode: 'test' | 'learn',
    items: Array<{ word_id: number; user_spelling: string; self_marked_known?: boolean }>,
  ) =>
    apiRequest<{
      book_id: string
      mode: string
      correct: number
      total: number
      accuracy: number
      persisted: boolean
      results: Array<{
        word_id: number
        word: string
        phonetic?: string
        meaning_zh: string
        user_spelling: string
        is_correct: boolean
      }>
    }>(`/api/corpus/books/${encodeURIComponent(bookId)}/submit`, {
      method: 'POST',
      body: JSON.stringify({ mode, items }),
    }),

  // Speaking
  getSpeakingQuestions: (params?: { module?: string; tag?: string; topic?: string; q?: string }) => {
    const qs = new URLSearchParams()
    if (params?.module) qs.set('module', params.module)
    if (params?.tag) qs.set('tag', params.tag)
    if (params?.topic) qs.set('topic', params.topic)
    if (params?.q) qs.set('q', params.q)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return apiRequest<{
      questions: SpeakingQuestion[]
      modules: Array<'Part 1' | 'Part 2' | 'Part 3'>
      tags: string[]
      topics: string[]
    }>(`/api/speaking/questions${suffix}`)
  },

  createSpeakingSet: (question_ids: string[], title?: string) =>
    apiRequest<{
      status: string
      set: {
        id: number
        title: string
        createdAt: string
        questions: Array<{
          id: number
          module: string
          topic: string
          title: string
          sub_questions_json: string[]
          sample_answer: string
        }>
      }
    }>('/api/speaking/sets', {
      method: 'POST',
      body: JSON.stringify({ question_ids, title }),
    }),

  // Core Exam Runner
  getTestDetail: (testId: number, sectionId?: number | null) => {
    const qs = new URLSearchParams()
    if (sectionId) qs.set('section_id', String(sectionId))
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return apiRequest<ExamTestDetail>(`/api/tests/${testId}${suffix}`)
  },

  saveTestDraft: (testId: number, payload: { section_id?: number | null; elapsed_seconds: number; answers: Record<string, string> }) =>
    apiRequest<{ status: string }>(`/api/tests/${testId}/draft`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  submitTestAttempt: (
    testId: number,
    payload: {
      student_name?: string
      mode?: string
      section_id?: number | null
      duration_seconds: number
      answers: Record<string, string>
    },
  ) =>
    apiRequest<SubmitExamResponse>(`/api/tests/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
