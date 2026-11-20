export type ProgressStatus = '未开始' | '练习中' | '已完成'

export interface FilterGroup {
  label: string
  options: string[]
}

export interface QuestionItem {
  id: string
  label: string
  type?: string
  scene?: string
  status: ProgressStatus
  testId?: number
  sectionId?: number
  audioExists?: boolean
}

export interface TestGroup {
  id: string
  testId?: number
  title: string
  parts: {
    id: string
    sectionId?: number
    title: string
    scene?: string
    items: QuestionItem[]
  }[]
}

export interface BookGroup {
  id: string
  bookNumber?: number
  title: string
  subtitle: string
  tests: TestGroup[]
}

export interface WordBook {
  id: string
  title: string
  tag: string
  bandTag?: string | null
  rationale: string
  total: number
  seededCount?: number
  mastered: number
  learning: number
  targetAccuracy: number
  myAccuracy?: number | null
}

export interface CorpusWord {
  id: number
  book_id: string
  word: string
  phonetic?: string | null
  meaning_zh: string
  example_sentence?: string | null
  source_section_id?: number | null
}

export interface SpeakingQuestion {
  id: string
  numericId?: number
  code?: string
  module: 'Part 1' | 'Part 2' | 'Part 3'
  topic: string
  tag?: string
  title: string
  isNew: boolean
  subQuestions?: string[]
  sampleAnswer?: string
}

export interface MembershipPlan {
  term: string
  price: string
  days?: number
  amount_cny?: number
  note?: string
}

export interface MembershipTier {
  id: string
  name: string
  description: string
  plans: MembershipPlan[]
}

export interface UserMembership {
  id: number
  tier_id: string
  tier_name: string
  plan_term: string
  amount_cny: number
  status: string
  starts_at: string
  expires_at: string
}

export interface PlatformUser {
  id: number
  username: string
  phone?: string | null
  email?: string | null
  display_name: string
  role: string
  target_band: number
  memberships: UserMembership[]
  is_vip: boolean
}

export interface ExamQuestion {
  id: number
  test_id?: number
  section_id: number
  group_id: number
  question_number: number
  display_number?: number
  question_type: string
  prompt_text: string
  options_json: Array<{ key?: string; text?: string; min_words?: number; task_type?: string }>
  points: number
  correct_answer?: string
  accepted_answers?: string[]
  explanation_zh?: string
}

export interface ExamQuestionGroup {
  id: number
  section_id: number
  group_order: number
  question_start: number
  question_end: number
  group_type: string
  instructions: string
  group_title?: string | null
  shared_content_json?: {
    headers?: string[]
    rows?: Array<string[] | { label?: string; text?: string }>
    example?: { label?: string; value?: string }
    box_options?: Array<{ key: string; text: string }>
    passage_title?: string
    passage_subtitle?: string
    passage_paragraphs?: Array<{ label?: string; text: string }>
  }
  diagram_url?: string | null
  questions: ExamQuestion[]
}

export interface ExamSection {
  id: number
  test_id?: number
  section_number: number
  title?: string | null
  exam_dates?: string | null
  audio_exists?: boolean
  audio_stream_url: string
  page_image_urls: string[]
  groups: ExamQuestionGroup[]
}

export interface ExamTestDetail {
  id: number
  book_id?: number
  book_number?: number
  book_code?: string
  book_title?: string
  test_number?: number
  title: string
  module?: 'listening' | 'reading' | 'writing' | 'speaking'
  subject?: string
  total_questions: number
  sections: ExamSection[]
  saved_draft?: {
    answers_json: Record<string, string>
    elapsed_seconds: number
    updated_at: string
  } | null
}

export interface GradedQuestionResult {
  question_id: number
  question_number: number
  user_answer: string
  correct_answer: string
  accepted_answers: string[]
  is_correct: boolean
  explanation_zh: string
}

export interface SubmitExamResponse {
  attempt_id?: number
  set_id?: number
  submitted_at?: string
  test_id?: number
  test_title?: string
  title?: string
  score: number
  total_questions: number
  band_score: number
  evaluation_tier: string
  evaluation_feedback: string
  question_results: GradedQuestionResult[]
  sections_review?: Array<{
    id: number
    section_number: number
    title?: string
    transcript_html?: string | null
  }>
}
