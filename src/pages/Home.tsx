import { Link } from 'react-router-dom'

const SECTIONS = [
  {
    eyebrow: 'Listening',
    title: '听力真题题库',
    to: '/bank/listening',
    bullets: ['完整机考界面', 'C4–20 真题', '68 套 A / 50 套 G', '专家答案解析', '原文+分段音频'],
  },
  {
    eyebrow: 'Speaking',
    title: '口语题库',
    to: '/speaking',
    bullets: ['2026 Sep–Dec 最新题库', 'Part 1/2/3 全覆盖', '新旧题标签', 'AI 定制素材+音频'],
  },
  {
    eyebrow: 'Reading',
    title: '阅读真题题库',
    to: '/bank/reading-a',
    bullets: ['A/G 全覆盖', '题型+场景筛选', '专家答案解析'],
  },
  {
    eyebrow: 'Writing',
    title: '写作真题题库',
    to: '/bank/writing-a',
    bullets: ['高分范文', 'AI 作文反馈', 'Task 1/2 全覆盖'],
  },
]

export function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-white">
        <p className="text-sm text-brand-100">BC / IELTS 白金级合作伙伴</p>
        <h1 className="mt-2 text-3xl font-bold">10000+ 同期考生在用的线上雅思题库</h1>
        <p className="mt-3 max-w-xl text-sm text-brand-100">
          真题 · 答案解析 · 口语素材 · 写作范文 —— 一站式雅思自学平台
        </p>
        <div className="mt-6 flex gap-3">
          <button type="button" className="rounded bg-white px-5 py-2 text-sm font-medium text-brand-700">
            登录
          </button>
          <button type="button" className="rounded border border-white px-5 py-2 text-sm font-medium">
            注册
          </button>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <div key={section.title} className="rounded-lg border border-ink-400/15 bg-surface p-6">
            <p className="text-xs uppercase tracking-wide text-brand-500">→ {section.eyebrow}</p>
            <h2 className="mt-1 text-lg font-semibold text-ink-900">{section.title}</h2>
            <ul className="mt-3 space-y-1 text-sm text-ink-600">
              {section.bullets.map((bullet) => (
                <li key={bullet}>· {bullet}</li>
              ))}
            </ul>
            <Link
              to={section.to}
              className="mt-4 inline-block rounded bg-brand-600 px-4 py-1.5 text-sm text-white hover:bg-brand-700"
            >
              进入题库
            </Link>
          </div>
        ))}
      </section>
    </div>
  )
}
