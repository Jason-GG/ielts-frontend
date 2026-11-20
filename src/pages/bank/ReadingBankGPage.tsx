import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Breadcrumb } from '../../components/common/Breadcrumb'
import { SidebarRail } from '../../components/common/SidebarRail'
import { QuestionBankList } from '../../components/questionBank/QuestionBankList'
import { useAuth } from '../../context/AuthContext'
import { READING_BOOKS_G, READING_TYPES } from '../../data/questionBanks'
import type { BookGroup } from '../../types'

export function ReadingBankGPage() {
  const { user } = useAuth()
  const [books, setBooks] = useState<BookGroup[]>(READING_BOOKS_G)
  const [types, setTypes] = useState<string[]>(READING_TYPES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .getReadingBank('G')
      .then((res) => {
        if (cancelled) return
        setBooks(res.books)
        setTypes(res.types)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user?.id])

  return (
    <div>
      <Breadcrumb current="阅读题库 G类" />
      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <QuestionBankList title="剑雅阅读题库 · G类" books={books} types={types} loading={loading} />
        </div>
        <SidebarRail />
      </div>
    </div>
  )
}
