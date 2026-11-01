import type { WordBook } from '../types'

export const LISTENING_CHAPTERS = [
  {
    id: 'chapter-1',
    title: 'Chapter 1',
    theme: '填空题答案词拼写训练',
    tooltip: '仅学习 2000 词即可覆盖 93% 的听力填空题答案词，1~2 周即可解决听力答案拼写问题',
  },
  {
    id: 'chapter-2',
    title: 'Chapter 2',
    theme: '考点分析能力提升训练',
    tooltip: '对替换或考点不够熟悉会导致丢分，可通过《替换训练》和《考点专项训练》提升',
  },
  {
    id: 'chapter-3',
    title: 'Chapter 3',
    theme: '听音辨音能力提升训练',
    tooltip: '听不懂原文或跟不上音频速度往往是对发音不熟悉，刷完《核心词》+《场景词》+《语块》的听音识词训练，95% 的词汇就都能听懂',
  },
]

export const LISTENING_WORD_BOOKS: WordBook[] = [
  {
    id: 'high-frequency',
    title: '高频答案词',
    tag: '必修 · HOT明星词书',
    rationale: '历年听力考试中经常考到的答案词，正确率达到 95% 才算达标',
    total: 984,
    mastered: 0,
    learning: 0,
    targetAccuracy: 95,
  },
  {
    id: 'basic',
    title: '基础答案词',
    tag: '必修 · 目标分 ≤ 6.5 · A1–B2',
    rationale: '简单的答案词，基础弱的同学练完《基础》再去练《高频》',
    total: 598,
    mastered: 0,
    learning: 0,
    targetAccuracy: 90,
  },
  {
    id: 'advanced',
    title: '进阶答案词',
    tag: '选修 · 目标分 ≥ 7.0 · C1–C2',
    rationale: '较难的答案词，建议《高频》正确率达标后再开始',
    total: 195,
    mastered: 0,
    learning: 0,
    targetAccuracy: 90,
  },
  {
    id: 'phrase',
    title: '短语答案词',
    tag: '选修',
    rationale: '答案由两个及以上词构成，"no more than two words" 易丢分的同学要练',
    total: 315,
    mastered: 0,
    learning: 0,
    targetAccuracy: 90,
  },
  {
    id: 'error-book',
    title: '错词本',
    tag: '自动收录',
    rationale: '学习模式/测试模式中拼错的词自动收录，考前快速过一遍',
    total: 0,
    mastered: 0,
    learning: 0,
    targetAccuracy: 98,
  },
]

export interface SpecialtySeries {
  id: string
  title: string
  cards: { title: string; count: number; note?: string }[]
}

export const SPECIALTY_SERIES: SpecialtySeries[] = [
  {
    id: 'plural',
    title: '单复数系列',
    cards: [
      { title: '复数', count: 153, note: '必加 s' },
      { title: '同词单复数', count: 386, note: '单复数都考过，需听题干判断' },
      { title: '不可数', count: 35, note: '绝不加 s' },
    ],
  },
  {
    id: 'number',
    title: '数字系列',
    cards: [
      { title: '号码', count: 81 },
      { title: '价格', count: 77 },
      { title: '数字', count: 140 },
    ],
  },
  {
    id: 'time',
    title: '时间系列',
    cards: [
      { title: '月份', count: 12 },
      { title: '星期', count: 7 },
      { title: '序数词', count: 21 },
      { title: '日期', count: 110 },
      { title: '时间', count: 63 },
    ],
  },
  {
    id: 'proper-noun',
    title: '专有名词系列',
    cards: [
      { title: '地址', count: 83 },
      { title: '人名', count: 59 },
      { title: '邮编/航班号', count: 41 },
      { title: '其他名称', count: 31 },
    ],
  },
]

export const STUDY_GUIDE_STEPS = [
  {
    step: 1,
    title: '别急着学，先去测试模式测一测',
    body: '你不需要花时间在已经会的单词上，用测试模式筛选出需要学习的词。如果连续错多个，请停止测试，先去学习模式。',
  },
  {
    step: 2,
    title: '学习模式，系统掌握词汇',
    body: '拼错的单词会在第二天被推送回学习模式。推荐顺序：高频 → 专项 → 基础 → 进阶 → 词组，考前可直接跳到第 3 步。',
  },
  {
    step: 3,
    title: '查漏补缺，错词本精准复习',
    body: '学习后重新测试，当天的错词会进入错词本；清空错词本后再测试一次。',
  },
  {
    step: 4,
    title: '刷完单词了，下一步去练听力审题',
    body: '知道单词还不够，去听力审题训练中做"答案词预判"，提前在听音频之前预测答案。',
  },
]
