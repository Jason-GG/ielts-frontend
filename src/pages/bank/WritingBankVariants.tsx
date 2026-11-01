import { WRITING_PAPERS_A, WRITING_PAPERS_G } from '../../data/questionBanks'
import { WritingBankPage } from './WritingBankPage'

export function WritingBankAPage() {
  return <WritingBankPage title="剑雅写作题库 · A类" breadcrumb="写作题库 A类" papers={WRITING_PAPERS_A} />
}

export function WritingBankGPage() {
  return <WritingBankPage title="剑雅写作题库 · G类" breadcrumb="写作题库 G类" papers={WRITING_PAPERS_G} />
}

