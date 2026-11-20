import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

const SECTIONS = [
  {
    eyebrow: 'Listening',
    title: '听力真题题库',
    to: '/bank/listening',
    bullets: ['完整机考界面', 'C1–C21 剑雅 + 9分达人 1–7', '分段音频流媒体播放', '专家中文答案解析', '原文对照+题型场景筛选'],
  },
  {
    eyebrow: 'Speaking',
    title: '口语题库',
    to: '/speaking',
    bullets: ['2026 Sep–Dec 最新题库', '剑雅真题 Part 1/2/3 全覆盖', '新旧题与必考话题标签', '高分思路示范+一键组卷'],
  },
  {
    eyebrow: 'Reading',
    title: '阅读真题题库',
    to: '/bank/reading-a',
    bullets: ['A类 / G类 全覆盖', '双栏原文段落对照阅读', '题型+十大高频场景筛选', '自动判分与 9 分制换算'],
  },
  {
    eyebrow: 'Writing',
    title: '写作真题题库',
    to: '/bank/writing-a',
    bullets: ['剑雅 Task 1 / Task 2 完整题库', '实时字数统计与审题提示', '考官范文思路与评分标准解析'],
  },
]

export function Home() {
  const { user, openLoginModal, openMembershipModal } = useAuth()
  const [stats, setStats] = useState<{
    total_books: number
    total_tests: number
    total_sections: number
    total_questions: number
  } | null>(null)

  useEffect(() => {
    api
      .getHomeSummary()
      .then((res) => setStats(res.stats))
      .catch(() => {})
  }, [])

  const heroBullets = [
    stats
      ? `已收录 ${stats.total_books} 本真题集 · ${stats.total_tests} 套试卷 · ${stats.total_questions.toLocaleString()} 道真题`
      : '68 套 A 类 / 50 套 G 类真题',
    '专家精讲答案解析与 IELTS 9 分制自动批改',
    '刘夏来听力语料库拼写听写 + 错词本自动收录',
    '10000+ 活跃考生同期备考',
  ]

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
            {heroBullets.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex gap-3">
            {user ? (
              <>
                <Link
                  to="/bank/listening"
                  className="rounded-full bg-accent-500 px-7 py-2.5 text-sm font-semibold text-white hover:bg-accent-600"
                >
                  开始刷题
                </Link>
                <button
                  type="button"
                  onClick={openMembershipModal}
                  className="rounded-full border border-brand-500 px-7 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-500 hover:text-white"
                >
                  查看会员权益
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="rounded-full bg-accent-500 px-7 py-2.5 text-sm font-semibold text-white hover:bg-accent-600"
                >
                  立即注册 / 体验登录
                </button>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="rounded-full border border-brand-500 px-7 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-500 hover:text-white"
                >
                  登录
                </button>
              </>
            )}
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
