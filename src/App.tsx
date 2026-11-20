import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AuthProvider } from './context/AuthContext'
import { Home } from './pages/Home'
import { FullDictationPage } from './pages/bank/FullDictationPage'
import { ListeningBankPage } from './pages/bank/ListeningBankPage'
import { ReadingBankAPage } from './pages/bank/ReadingBankAPage'
import { ReadingBankGPage } from './pages/bank/ReadingBankGPage'
import { WritingBankAPage, WritingBankGPage } from './pages/bank/WritingBankVariants'
import { ListeningCorpusPage } from './pages/corpus/ListeningCorpusPage'
import { JijingListeningPage, JijingReadingPage, JijingWritingPage } from './pages/jijing/JijingVariants'
import { NotFoundPage } from './pages/NotFoundPage'
import { ExamPracticePage } from './pages/practice/ExamPracticePage'
import { SelfStudyCampPage } from './pages/SelfStudyCampPage'
import { SetGeneratePage } from './pages/sets/SetGeneratePage'
import {
  FullMockAPage,
  FullMockGPage,
  JijingSetAPage,
  SetPracticeAPage,
  SetPracticeGPage,
} from './pages/sets/SetPracticeVariants'
import { SpeakingBankPage } from './pages/speaking/SpeakingBankPage'
import { SpeakingMockPage } from './pages/speaking/SpeakingMockPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          <Route path="/bank/listening" element={<ListeningBankPage />} />
          <Route path="/bank/reading-a" element={<ReadingBankAPage />} />
          <Route path="/bank/reading-g" element={<ReadingBankGPage />} />
          <Route path="/bank/writing-a" element={<WritingBankAPage />} />
          <Route path="/bank/writing-g" element={<WritingBankGPage />} />
          <Route path="/bank/full-dictation" element={<FullDictationPage />} />

          <Route path="/jijing/listening" element={<JijingListeningPage />} />
          <Route path="/jijing/reading" element={<JijingReadingPage />} />
          <Route path="/jijing/writing" element={<JijingWritingPage />} />

          <Route path="/sets/practice-a" element={<SetPracticeAPage />} />
          <Route path="/sets/practice-g" element={<SetPracticeGPage />} />
          <Route path="/sets/full-mock-a" element={<FullMockAPage />} />
          <Route path="/sets/full-mock-g" element={<FullMockGPage />} />
          <Route path="/sets/generate" element={<SetGeneratePage />} />
          <Route path="/sets/jijing-a" element={<JijingSetAPage />} />

          <Route path="/corpus/listening" element={<ListeningCorpusPage />} />

          <Route path="/speaking" element={<SpeakingBankPage />} />
          <Route path="/speaking/mock" element={<SpeakingMockPage />} />

          <Route path="/self-study-camp" element={<SelfStudyCampPage />} />

          {/* Interactive IELTS Practice & Mock Runner */}
          <Route path="/practice/test/:testId" element={<ExamPracticePage />} />
          <Route path="/practice/generated/:setId" element={<ExamPracticePage isGeneratedSet />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
