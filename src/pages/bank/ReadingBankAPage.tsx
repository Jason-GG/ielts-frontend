import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Breadcrumb } from '../../components/common/Breadcrumb'
import { SidebarRail } from '../../components/common/SidebarRail'
import { QuestionBankList } from '../../components/questionBank/QuestionBankList'
import { useAuth } from '../../context/AuthContext'
import { READING_BOOKS_A, READING_SCENES, READING_TYPES } from '../../data/questionBanks'
import type { BookGroup } from '../../types'

export function ReadingBankAPage() {
  const { user } = useAuth()
  const [books, setBooks] = useState<BookGroup[]>(READING_BOOKS_A)
  const [types, setTypes] = useState<string[]>(READING_TYPES)
  const [scenes, setScenes] = useState<string[] | null>(READING_SCENES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .getReadingBank('A')
      .then((res) => {
        if (cancelled) return
        setBooks(res.books)
        setTypes(res.types)
        setScenes(res.scenes)
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
      <Breadcrumb current="阅读题库 A类" />
      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <QuestionBankList
            title="剑雅阅读题库 · A类"
            books={books}
            types={types}
            scenes={scenes}
            loading={loading}
          />
        </div>
        <SidebarRail />
      </div>
    </div>
  )
}
