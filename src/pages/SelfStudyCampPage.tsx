import { Breadcrumb } from '../components/common/Breadcrumb'

const STEPS = ['先诊断', '抢分规划', '每日反馈', '自习室', '结营诊断', '自己走']

export function SelfStudyCampPage() {
  return (
    <div>
      <Breadcrumb current="听阅自学营" />
      <section className="rounded-lg bg-brand-600 p-8 text-white">
        <h1 className="text-2xl font-bold">我为什么劝你自学</h1>
        <p className="mt-2 max-w-xl text-sm text-white/70">刘夏来 · 4 周 / 6 步学习方法</p>
      </section>
      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STEPS.map((step, i) => (
          <div key={step} className="rounded-md border border-ink-400/15 bg-surface p-4 text-center text-sm">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white">
              {i + 1}
            </div>
            {step}
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-ink-400/15 bg-surface p-5">
          <h3 className="text-sm font-semibold text-ink-900">先诊断</h3>
          <p className="mt-1 text-xs text-ink-400 line-through">原价 ¥428</p>
          <p className="text-xl font-bold text-brand-600">¥198</p>
        </div>
        <div className="rounded-md border border-ink-400/15 bg-surface p-5">
          <h3 className="text-sm font-semibold text-ink-900">报自学营 · 听阅双科</h3>
          <p className="text-xl font-bold text-brand-600">¥1,700</p>
        </div>
      </div>
      <button type="button" className="mt-6 rounded bg-brand-600 px-6 py-2 text-sm text-white hover:bg-brand-700">
        立即咨询
      </button>
    </div>
  )
}
