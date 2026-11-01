import { Breadcrumb } from '../../components/common/Breadcrumb'
import { SidebarRail } from '../../components/common/SidebarRail'
import { QuestionBankList } from '../../components/questionBank/QuestionBankList'
import { LISTENING_BOOKS, LISTENING_SCENES, LISTENING_TYPES } from '../../data/questionBanks'

export function ListeningBankPage() {
  return (
    <div>
      <Breadcrumb current="听力题库" />
      <div className="flex gap-6">
        <div className="flex-1">
          <QuestionBankList
            title="剑雅听力题库"
            books={LISTENING_BOOKS}
            types={LISTENING_TYPES}
            scenes={LISTENING_SCENES}
          />
        </div>
        <SidebarRail />
      </div>
    </div>
  )
}
