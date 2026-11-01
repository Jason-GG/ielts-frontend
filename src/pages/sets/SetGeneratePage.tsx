import { useState } from 'react'
import { Breadcrumb } from '../../components/common/Breadcrumb'

const TABS = ['听力', '阅读', '模考记录'] as const

export function SetGeneratePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('听力')

  return (
    <div>
      <Breadcrumb current="单科机经模考" />
      <h1 className="mb-4 text-xl font-semibold text-ink-900">单科机经模考</h1>
      <div className="mb-4 flex gap-2 text-sm">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 ${t === tab ? 'bg-brand-600 text-white' : 'bg-surface-alt text-ink-600'}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab !== '模考记录' ? (
        <div className="flex gap-6">
          <div className="flex-1 rounded-md border border-ink-400/15 bg-surface p-6 text-center">
            <p className="mb-4 text-sm text-ink-600">点击下方按钮，系统将根据机经题库自动生成一套{tab}模考卷</p>
            <button type="button" className="rounded bg-brand-600 px-5 py-2 text-sm text-white hover:bg-brand-700">
              生成模考卷
            </button>
          </div>
          <aside className="w-[280px] shrink-0 rounded-md border border-ink-400/15 bg-surface-alt p-4 text-xs text-ink-600">
            <h4 className="mb-2 text-sm font-semibold text-ink-900">考场提示</h4>
            <ul className="space-y-1">
              <li>· 音频只放一遍，不能暂停、不能回放</li>
              <li>· 4 个 part × 10 题</li>
              <li>· 拼写错误算错</li>
            </ul>
          </aside>
        </div>
      ) : (
        <div className="rounded-md border border-ink-400/15 bg-surface p-6 text-sm text-ink-400">
          暂无模考记录
        </div>
      )}
    </div>
  )
}
