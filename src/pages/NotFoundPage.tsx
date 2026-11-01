import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <h1 className="text-3xl font-bold text-ink-900">404</h1>
      <p className="text-sm text-ink-600">当前页面暂无内容，敬请期待~</p>
      <Link to="/" className="text-brand-600 hover:underline">
        返回首页
      </Link>
    </div>
  )
}
