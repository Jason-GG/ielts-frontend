import { Breadcrumb } from '../../components/common/Breadcrumb'
import { LISTENING_BOOKS } from '../../data/questionBanks'

export function FullDictationPage() {
  return (
    <div>
      <Breadcrumb current="全文精听" />
      <h1 className="mb-4 text-xl font-semibold text-ink-900">全文精听</h1>
      <div className="mb-4 flex gap-2 text-sm">
        {['剑雅真题', '考场真题', '我的收藏'].map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={`rounded-full px-3 py-1 ${i === 0 ? 'bg-brand-600 text-white' : 'bg-surface-alt text-ink-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {LISTENING_BOOKS.map((book) => (
          <div key={book.id} className="rounded-md border border-ink-400/15 bg-surface p-4">
            <h3 className="mb-2 text-sm font-semibold text-ink-900">{book.title}</h3>
            <div className="flex flex-wrap gap-2 text-xs text-ink-600">
              {book.tests.map((test) => (
                <span key={test.id} className="rounded bg-surface-alt px-2 py-1">
                  {test.title}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
