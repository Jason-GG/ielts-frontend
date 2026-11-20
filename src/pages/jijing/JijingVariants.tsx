import { JijingRankingPage } from './JijingRankingPage'

export function JijingListeningPage() {
  return <JijingRankingPage title="机经听力" breadcrumb="机经听力" subject="listening" />
}

export function JijingReadingPage() {
  return <JijingRankingPage title="机经阅读" breadcrumb="机经阅读" subject="reading" />
}

export function JijingWritingPage() {
  return <JijingRankingPage title="机经写作" breadcrumb="机经写作" subject="writing" />
}
