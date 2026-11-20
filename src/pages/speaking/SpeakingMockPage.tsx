import { Breadcrumb } from '../../components/common/Breadcrumb'
import { useAuth } from '../../context/AuthContext'

export function SpeakingMockPage() {
  const { openBookingModal } = useAuth()

  return (
    <div>
      <Breadcrumb current="口语模考" />
      <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white">
        <p className="text-sm text-brand-100 line-through">原价 ¥71.7</p>
        <h1 className="mt-1 text-2xl font-bold">¥18.8 起 · 50 分钟真人口语全真模考</h1>
        <p className="mt-2 max-w-lg text-sm text-brand-100">
          测试 + Feedback + 备考技巧录音 30 分钟 · 课堂笔记 + 模考报告 · 熟悉流程/缓解紧张
        </p>
        <button
          type="button"
          onClick={() =>
            openBookingModal({
              serviceType: 'speaking_mock',
              title: '报名 50 分钟真人口语全真模考',
              planName: '真人口语全真模考（¥18.8 新人特惠）',
            })
          }
          className="mt-5 rounded-full bg-white px-6 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          立即报名
        </button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm text-ink-600">
        <div className="rounded-xl border border-ink-400/15 bg-surface p-4">老师平均教龄 8 年+，本科以上</div>
        <div className="rounded-xl border border-ink-400/15 bg-surface p-4">教学资格认证齐全</div>
        <div className="rounded-xl border border-ink-400/15 bg-surface p-4">4 步流程 + 模考报告样例</div>
      </div>
    </div>
  )
}
