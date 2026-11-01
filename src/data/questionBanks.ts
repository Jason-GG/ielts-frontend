import type { BookGroup, ProgressStatus, QuestionItem, TestGroup } from '../types'

const STATUSES: ProgressStatus[] = ['未开始', '练习中', '已完成']

function pickStatus(seed: number): ProgressStatus {
  return STATUSES[seed % STATUSES.length]
}

function buildParts(bookIndex: number, testIndex: number, types: string[]): TestGroup['parts'] {
  return Array.from({ length: 4 }, (_, partIndex) => {
    const seed = bookIndex * 31 + testIndex * 7 + partIndex
    const items: QuestionItem[] = Array.from({ length: 2 }, (_, i) => ({
      id: `b${bookIndex}-t${testIndex}-p${partIndex}-i${i}`,
      label: `Part ${partIndex + 1}`,
      type: types[(seed + i) % types.length],
      status: pickStatus(seed + i),
    }))
    return {
      id: `b${bookIndex}-t${testIndex}-p${partIndex}`,
      title: `Part ${partIndex + 1}`,
      items,
    }
  })
}

function buildBook(bookNumber: number, subtitle: string, types: string[]): BookGroup {
  const tests: TestGroup[] = Array.from({ length: 4 }, (_, testIndex) => ({
    id: `c${bookNumber}-test${testIndex + 1}`,
    title: `Test ${testIndex + 1}`,
    parts: buildParts(bookNumber, testIndex, types),
  }))
  return {
    id: `cambridge-${bookNumber}`,
    title: `CAMBRIDGE ${bookNumber}`,
    subtitle,
    tests,
  }
}

export const LISTENING_TYPES = ['填空', '单选', '配对', '地图', '多选']
export const LISTENING_SCENES = [
  '日常生活与社交活动',
  '求职与工作',
  '旅游与参观',
  '城市规划与设施建设',
  '文化与历史交流',
  '自然与环境保护',
  '商业与人文研究',
  '教育与学习',
  '食品与健康',
  '科技与自然科学',
]

export const READING_TYPES = ['填空', '判断', '单选', '配对', '小标题', '多选']
export const READING_SCENES = [
  '历史与考古',
  '科技与发展',
  '语言与教育',
  '商业与经济',
  '植物类',
  '动物类',
  '自然与环境保护',
  '医疗与健康',
  '心理学与社会行为',
  '文化与艺术',
]

export const WRITING_TASK1_A_TYPES = ['柱状图', '饼图', '表格', '曲线图', '混合图', '地图', '流程图']
export const WRITING_TASK1_G_TYPES = ['投诉信', '咨询信', '求助信', '道歉信', '建议信', '邀请信', '感谢信', '求职信', '请求信']

export const LISTENING_BOOKS: BookGroup[] = Array.from({ length: 4 }, (_, i) =>
  buildBook(20 - i, 'LISTENING', LISTENING_TYPES),
)

export const READING_BOOKS_A: BookGroup[] = Array.from({ length: 4 }, (_, i) =>
  buildBook(20 - i, 'READING · ACADEMIC', READING_TYPES),
)

export const READING_BOOKS_G: BookGroup[] = Array.from({ length: 4 }, (_, i) =>
  buildBook(20 - i, 'READING · GENERAL TRAINING', READING_TYPES),
)

export interface WritingPaper {
  id: string
  title: string
  type: string
  prompt: string
  task: string
}

export const WRITING_PAPERS_A: WritingPaper[] = Array.from({ length: 8 }, (_, i) => {
  const type = WRITING_TASK1_A_TYPES[i % WRITING_TASK1_A_TYPES.length]
  return {
    id: `writing-a-${i}`,
    title: `C${20 - i} Test${(i % 4) + 1}`,
    type,
    prompt: `The chart below shows data related to "${type}". Summarise the information by selecting and reporting the main features.`,
    task: 'You should spend about 20 minutes on this task. Write at least 150 words.',
  }
})

export const WRITING_PAPERS_G: WritingPaper[] = Array.from({ length: 9 }, (_, i) => {
  const type = WRITING_TASK1_G_TYPES[i % WRITING_TASK1_G_TYPES.length]
  return {
    id: `writing-g-${i}`,
    title: `C${20 - i} Test${(i % 4) + 1}`,
    type,
    prompt: `Write a letter (${type}) addressing the situation described in the prompt.`,
    task: 'You should spend about 20 minutes on this task. Write at least 150 words.',
  }
})

export const JIJING_RANKING = Array.from({ length: 20 }, (_, i) => ({
  rank: i + 1,
  title: `机经 Part ${(i % 4) + 1} · 场景 ${LISTENING_SCENES[i % LISTENING_SCENES.length]}`,
  status: '未开始' as const,
  part: `Part ${(i % 4) + 1}`,
  scene: LISTENING_SCENES[i % LISTENING_SCENES.length],
}))
