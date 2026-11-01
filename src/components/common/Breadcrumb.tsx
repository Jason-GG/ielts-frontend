import { Link } from 'react-router-dom'

export function Breadcrumb({ current }: { current: string }) {
  return (
    <nav className="mb-4 text-sm text-ink-600">
      <Link to="/" className="text-brand-600 hover:underline">
        首页
      </Link>
      <span className="mx-1">{'>'}</span>
      <span>{current}</span>
    </nav>
  )
}
