import { Breadcrumb } from '../../components/common/Breadcrumb'
import { SidebarRail } from '../../components/common/SidebarRail'
import { QuestionBankList } from '../../components/questionBank/QuestionBankList'
import { READING_BOOKS_G, READING_TYPES } from '../../data/questionBanks'

export function ReadingBankGPage() {
  return (
    <div>
      <Breadcrumb current="阅读题库 G类" />
      <div className="flex gap-6">
        <div className="flex-1">
          <QuestionBankList title="剑雅阅读题库 · G类" books={READING_BOOKS_G} types={READING_TYPES} />
        </div>
        <SidebarRail />
      </div>
    </div>
  )
}
