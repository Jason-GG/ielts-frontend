import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Breadcrumb } from '../../components/common/Breadcrumb'
import { SidebarRail } from '../../components/common/SidebarRail'
import { QuestionBankList } from '../../components/questionBank/QuestionBankList'
import { useAuth } from '../../context/AuthContext'
import { LISTENING_BOOKS, LISTENING_SCENES, LISTENING_TYPES } from '../../data/questionBanks'
import type { BookGroup } from '../../types'

export function ListeningBankPage() {
  const { user } = useAuth()
  const [books, setBooks] = useState<BookGroup[]>(LISTENING_BOOKS)
  const [types, setTypes] = useState<string[]>(LISTENING_TYPES)
  const [scenes, setScenes] = useState<string[]>(LISTENING_SCENES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .getListeningBank()
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
      <Breadcrumb current="听力题库" />
      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <QuestionBankList
            title="剑雅 & 9分达人听力题库"
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
