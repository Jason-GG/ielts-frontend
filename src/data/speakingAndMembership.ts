import type { MembershipTier, SpeakingQuestion } from '../types'

export const SPEAKING_MODULES: SpeakingQuestion['module'][] = ['Part 1', 'Part 2', 'Part 3']
export const SPEAKING_TAGS = ['全部', '本季新题', '保留话题', '必考话题']
export const SPEAKING_TOPICS = ['全部', '人物', '地点', '经历', '事物']

export const SPEAKING_QUESTIONS: SpeakingQuestion[] = [
  { id: 'sp-1', module: 'Part 1', topic: '人物', title: 'Describe a person you admire', isNew: true },
  { id: 'sp-2', module: 'Part 1', topic: '地点', title: 'Describe your hometown', isNew: false },
  { id: 'sp-3', module: 'Part 2', topic: '经历', title: 'Describe a time you helped someone', isNew: true },
  { id: 'sp-4', module: 'Part 2', topic: '事物', title: 'Describe a gift you received', isNew: false },
  { id: 'sp-5', module: 'Part 3', topic: '人物', title: 'How has the idea of role models changed over time?', isNew: false },
  { id: 'sp-6', module: 'Part 3', topic: '地点', title: 'Why do people like to travel to big cities?', isNew: true },
  { id: 'sp-7', module: 'Part 1', topic: '事物', title: 'Describe your favourite app', isNew: true },
  { id: 'sp-8', module: 'Part 2', topic: '地点', title: 'Describe a place you would like to visit', isNew: false },
]

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'standard',
    name: '普通会员',
    description: 'Cambridge 4–21 + 机经题目、听力原文与音频、口语题库 + AI 素材、刘夏来语料库（不含答案解析）',
    plans: [
      { term: '31天', price: '¥79' },
      { term: '92天', price: '¥89' },
      { term: '366天', price: '¥99', note: '赠送题库/语料库 VIP 月卡' },
    ],
  },
  {
    id: 'question-bank-vip',
    name: '题库VIP',
    description: 'Cambridge 4–21 + 机经答案解析、高分范文、AI 批改 Task 1/2',
    plans: [
      { term: '31天', price: '¥99', note: '¥3.19/天' },
      { term: '92天', price: '¥188', note: '¥2.04/天' },
      { term: '366天', price: '¥396', note: '¥1.08/天' },
    ],
  },
  {
    id: 'corpus-vip',
    name: '语料库VIP',
    description: '完整刘夏来语料库：听力答案词、核心/场景词汇、同义替换、破题训练',
    plans: [
      { term: '31天', price: '¥99' },
      { term: '92天', price: '¥188' },
      { term: '366天', price: '¥396' },
    ],
  },
  {
    id: 'speaking-vip',
    name: '口语VIP',
    description: '口语题库 + 范文音频 + AI 口语助手',
    plans: [
      { term: '31天', price: '¥79' },
      { term: '92天', price: '¥99' },
    ],
  },
  {
    id: 'writing-vip',
    name: '写作VIP',
    description: '6.5+ 范文、A/G 全覆盖、老师解析、翻译、AI 作文批改',
    plans: [
      { term: '31天', price: '¥79' },
      { term: '92天', price: '¥99' },
    ],
  },
]
