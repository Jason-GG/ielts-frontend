import { Breadcrumb } from '../../components/common/Breadcrumb'
import { SidebarRail } from '../../components/common/SidebarRail'
import { QuestionBankList } from '../../components/questionBank/QuestionBankList'
import { READING_BOOKS_A, READING_SCENES, READING_TYPES } from '../../data/questionBanks'

export function ReadingBankAPage() {
  return (
    <div>
      <Breadcrumb current="阅读题库 A类" />
      <div className="flex gap-6">
        <div className="flex-1">
          <QuestionBankList
            title="剑雅阅读题库 · A类"
            books={READING_BOOKS_A}
            types={READING_TYPES}
            scenes={READING_SCENES}
          />
        </div>
        <SidebarRail />
      </div>
    </div>
  )
}
