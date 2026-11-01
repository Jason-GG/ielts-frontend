import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LoginModal } from '../membership/LoginModal'
import { MembershipModal } from '../membership/MembershipModal'

const NAV_ITEMS: { label: string; to: string; hot?: boolean; dropdown?: { label: string; to: string }[] }[] = [
  { label: '首页', to: '/' },
  { label: '雅思语料库', to: '/corpus/listening', hot: true },
  {
    label: '口语题库',
    to: '/speaking',
    dropdown: [
      { label: '口语题库', to: '/speaking' },
      { label: '口语模考', to: '/speaking/mock' },
    ],
  },
  {
    label: '剑雅题库',
    to: '/bank/listening',
    dropdown: [
      { label: '听力 A/G', to: '/bank/listening' },
      { label: '阅读 A', to: '/bank/reading-a' },
      { label: '阅读 G', to: '/bank/reading-g' },
      { label: '写作 A', to: '/bank/writing-a' },
      { label: '写作 G', to: '/bank/writing-g' },
      { label: '全文精听', to: '/bank/full-dictation' },
    ],
  },
  {
    label: '机经题库',
    to: '/jijing/listening',
    dropdown: [
      { label: '听力', to: '/jijing/listening' },
      { label: '阅读', to: '/jijing/reading' },
      { label: '写作', to: '/jijing/writing' },
    ],
  },
  {
    label: '套题模考',
    to: '/sets/practice-a',
    dropdown: [
      { label: '单科套题练习 A', to: '/sets/practice-a' },
      { label: '单科套题练习 G', to: '/sets/practice-g' },
      { label: '三科全真模考 A', to: '/sets/full-mock-a' },
      { label: '三科全真模考 G', to: '/sets/full-mock-g' },
      { label: '单科机经模考', to: '/sets/generate' },
      { label: '三科机经真题 A', to: '/sets/jijing-a' },
    ],
  },
  { label: '听阅自学营', to: '/self-study-camp' },
]

export function Header() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [membershipOpen, setMembershipOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-surface shadow-sm">
      <div className="mx-auto flex h-[70px] max-w-[1300px] items-center justify-between px-[70px]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-brand-600 text-sm font-bold text-white">
            同
          </div>
          <div>
            <div className="text-base font-semibold text-ink-900">同桌英语自学网</div>
            <div className="text-[11px] text-ink-400">让雅思学习更简单</div>
          </div>
        </div>
        <button
          type="button"
          className="rounded-full border border-ink-900 px-4 py-1.5 text-xs font-medium text-ink-900 hover:bg-ink-900 hover:text-white"
        >
          机构/老师入驻
        </button>
      </div>
      <nav className="bg-[#383838]">
        <div className="mx-auto flex h-[50px] max-w-[1300px] items-center justify-between px-[70px] text-sm text-white">
          <ul className="flex h-full items-stretch">
            {NAV_ITEMS.map((item) => (
              <li key={item.label} className="group relative flex items-center">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex h-full items-center gap-1 px-4 ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-white/10'}`
                  }
                >
                  {item.label}
                  {item.hot && (
                    <span className="rounded bg-brand-500 px-1 text-[10px] leading-4">hot</span>
                  )}
                </NavLink>
                {item.dropdown && (
                  <ul className="absolute left-0 top-full hidden min-w-[180px] flex-col rounded-b bg-surface py-1 text-ink-800 shadow-lg group-hover:flex">
                    {item.dropdown.map((sub) => (
                      <li key={sub.to}>
                        <NavLink
                          to={sub.to}
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm hover:bg-brand-50 ${isActive ? 'text-brand-600' : ''}`
                          }
                        >
                          {sub.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setLoginOpen(true)} className="hover:text-brand-300">
              登录
            </button>
            <button type="button" onClick={() => setMembershipOpen(true)} className="hover:text-brand-300">
              注册
            </button>
          </div>
        </div>
      </nav>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <MembershipModal open={membershipOpen} onClose={() => setMembershipOpen(false)} />
    </header>
  )
}
