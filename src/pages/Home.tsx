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
      <section className="relative overflow-hidden rounded-2xl bg-lavender-50 px-10 py-14">
        <span className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full border-[3px] border-violet-300" />
        <span className="pointer-events-none absolute -left-4 top-10 h-16 w-16 rounded-full bg-violet-500" />

        <div className="relative max-w-xl">
          <p className="text-sm font-medium text-ink-600">BC / IELTS 白金级合作伙伴</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl">
            10000+ 同期考生在用的线上雅思题库
          </h1>
          <p className="mt-4 text-sm text-ink-600">
            真题 · 答案解析 · 口语素材 · 写作范文 —— 一站式雅思自学平台
          </p>

          <ul className="mt-6 space-y-2 text-sm text-ink-800">
            {['68 套 A 类 / 50 套 G 类真题', '专家精讲答案解析', '口语/写作 AI 素材库', '10000+ 活跃考生同期备考'].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    ✓
                  </span>
                  {item}
                </li>
              ),
            )}
          </ul>

          <div className="mt-8 flex gap-3">
            <button type="button" className="rounded-full bg-accent-500 px-7 py-2.5 text-sm font-semibold text-white hover:bg-accent-600">
              立即注册
            </button>
            <button type="button" className="rounded-full border border-brand-500 px-7 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-500 hover:text-white">
              登录
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <div key={section.title} className="rounded-2xl border border-ink-400/15 bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">→ {section.eyebrow}</p>
            <h2 className="mt-1 text-lg font-bold text-ink-900">{section.title}</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-600">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-600">
                    ✓
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
            <Link
              to={section.to}
              className="mt-4 inline-block rounded-full bg-accent-500 px-5 py-2 text-sm font-semibold text-white hover:bg-accent-600"
            >
              进入题库
            </Link>
          </div>
        ))}
      </section>
    </div>
  )
}
