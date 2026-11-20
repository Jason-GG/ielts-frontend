import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Footer } from './Footer'
import { Header } from './Header'

export function Layout() {
  const { openBookingModal } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[1300px] flex-1 px-[70px] py-6">
        <Outlet />
      </main>
      <Footer />
      <button
        type="button"
        onClick={() =>
          openBookingModal({
            serviceType: 'self_study_camp',
            title: '在线咨询题库客服 Candy',
            planName: '会员权益 / 课程规划 / 异常反馈答疑',
          })
        }
        className="fixed bottom-6 right-6 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-emerald-600"
      >
        咨询客服
      </button>
    </div>
  )
}
