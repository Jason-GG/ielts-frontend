import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[1300px] flex-1 px-[70px] py-6">
        <Outlet />
      </main>
      <Footer />
      <button
        type="button"
        className="fixed bottom-6 right-6 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-emerald-600"
      >
        咨询客服
      </button>
    </div>
  )
}
