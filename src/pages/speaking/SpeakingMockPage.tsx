import { Breadcrumb } from '../../components/common/Breadcrumb'

export function SpeakingMockPage() {
  return (
    <div>
      <Breadcrumb current="口语模考" />
      <div className="rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white">
        <p className="text-sm text-brand-100">原价 ¥71.7</p>
        <h1 className="mt-1 text-2xl font-bold">¥18.8 起 · 50 分钟真人口语全真模考</h1>
        <p className="mt-2 max-w-lg text-sm text-brand-100">
          测试 + Feedback + 备考技巧录音 30 分钟 · 课堂笔记 + 模考报告 · 熟悉流程/缓解紧张
        </p>
        <button type="button" className="mt-5 rounded bg-white px-5 py-2 text-sm font-medium text-brand-700">
          立即报名
        </button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm text-ink-600">
        <div className="rounded-md border border-ink-400/15 p-4">老师平均教龄 8 年+，本科以上</div>
        <div className="rounded-md border border-ink-400/15 p-4">教学资格认证齐全</div>
        <div className="rounded-md border border-ink-400/15 p-4">4 步流程 + 模考报告样例</div>
      </div>
    </div>
  )
}
