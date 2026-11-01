export type ProgressStatus = '未开始' | '练习中' | '已完成'

export interface FilterGroup {
  label: string
  options: string[]
}

export interface QuestionItem {
  id: string
  label: string
  type?: string
  status: ProgressStatus
}

export interface TestGroup {
  id: string
  title: string
  parts: {
    id: string
    title: string
    items: QuestionItem[]
  }[]
}

export interface BookGroup {
  id: string
  title: string
  subtitle: string
  tests: TestGroup[]
}

export interface WordBook {
  id: string
  title: string
  tag: string
  bandTag?: string
  rationale: string
  total: number
  mastered: number
  learning: number
  targetAccuracy: number
  myAccuracy?: number
}

export interface SpeakingQuestion {
  id: string
  module: 'Part 1' | 'Part 2' | 'Part 3'
  topic: string
  title: string
  isNew: boolean
}

export interface MembershipPlan {
  term: string
  price: string
  note?: string
}

export interface MembershipTier {
  id: string
  name: string
  description: string
  plans: MembershipPlan[]
}
