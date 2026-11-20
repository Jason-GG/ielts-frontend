import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Modal } from '../common/Modal'

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

type AuthTab = 'wechat' | 'password' | 'register'

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { loginWithDemoWechat, loginWithPassword, registerAccount } = useAuth()
  const [tab, setTab] = useState<AuthTab>('wechat')
  const [account, setAccount] = useState('demo_student')
  const [password, setPassword] = useState('ielts123456')
  const [regUsername, setRegUsername] = useState('')
  const [regDisplayName, setRegDisplayName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDemoWechat() {
    setBusy(true)
    setError(null)
    try {
      await loginWithDemoWechat()
    } catch (e) {
      setError(e instanceof Error ? e.message : '登录失败')
    } finally {
      setBusy(false)
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await loginWithPassword(account, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setBusy(false)
    }
  }

  async function handleRegisterSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await registerAccount({
        username: regUsername,
        password: regPassword,
        display_name: regDisplayName || undefined,
        email: regEmail || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="登录 / 注册「点对点英语」" widthClass="max-w-sm">
      <div className="mb-4 flex rounded-full bg-surface-alt p-1 text-xs font-medium">
        {[
          { key: 'wechat' as const, label: '微信扫码' },
          { key: 'password' as const, label: '密码登录' },
          { key: 'register' as const, label: '新用户注册' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setTab(item.key)
              setError(null)
            }}
            className={`flex-1 rounded-full py-1.5 transition ${
              tab === item.key ? 'bg-brand-600 text-white shadow-sm' : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}

      {tab === 'wechat' && (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="flex h-40 w-40 flex-col items-center justify-center rounded-xl border border-dashed border-brand-300 bg-brand-50 p-3 text-xs text-brand-700">
            <span className="text-2xl font-bold">扫码即登</span>
            <span className="mt-1 text-[11px] text-ink-600">支持一键体验 VIP 学生账号</span>
          </div>
          <p className="text-sm text-ink-800">使用微信扫一扫登录「同桌英语」</p>
          <button
            type="button"
            disabled={busy}
            onClick={handleDemoWechat}
            className="w-full rounded-full bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {busy ? '登录中...' : '一键模拟微信扫码登录（含VIP体验）'}
          </button>
          <button
            type="button"
            onClick={() => setTab('password')}
            className="text-xs text-brand-600 underline underline-offset-2"
          >
            使用账号密码登录
          </button>
        </div>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-ink-600">用户名 / 邮箱 / 手机号</label>
            <input
              required
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="demo_student"
              className="w-full rounded-lg border border-ink-400/30 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-600">登录密码</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full rounded-lg border border-ink-400/30 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-ink-400">默认体验账号：demo_student / 密码：ielts123456</p>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="mt-1 w-full rounded-full bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {busy ? '正在登录...' : '登录'}
          </button>
        </form>
      )}

      {tab === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-2.5">
          <div>
            <label className="mb-1 block text-xs text-ink-600">用户名 *</label>
            <input
              required
              minLength={2}
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              placeholder="例如：ielts_alice"
              className="w-full rounded-lg border border-ink-400/30 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-600">昵称</label>
            <input
              value={regDisplayName}
              onChange={(e) => setRegDisplayName(e.target.value)}
              placeholder="用于展示成绩单姓名"
              className="w-full rounded-lg border border-ink-400/30 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-600">邮箱（选填）</label>
            <input
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="alice@example.com"
              className="w-full rounded-lg border border-ink-400/30 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-600">设置密码 *</label>
            <input
              required
              minLength={4}
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="至少 4 位字符"
              className="w-full rounded-lg border border-ink-400/30 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="mt-2 w-full rounded-full bg-accent-500 py-2 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-50"
          >
            {busy ? '正在注册...' : '立即注册并登录'}
          </button>
        </form>
      )}
    </Modal>
  )
}
