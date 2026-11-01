export function SidebarRail() {
  return (
    <aside className="flex w-[260px] shrink-0 flex-col gap-4">
      <div className="rounded-md bg-brand-50 p-4 text-sm text-brand-700">
        <p className="font-semibold">会员费用报销</p>
        <p className="mt-1 text-xs">你的会员费用，我们来报销~</p>
      </div>
      <div className="rounded-md border border-ink-400/15 p-4 text-sm">
        <p className="mb-2 font-semibold text-ink-800">新手小贴士</p>
        <ul className="space-y-1 text-xs text-brand-600">
          <li>Safari 浏览器常见问题</li>
          <li>Highlight / Notes / Review 使用说明</li>
          <li>会员权益对比</li>
          <li>海外访问说明</li>
        </ul>
      </div>
      <div className="rounded-md border border-ink-400/15 p-4 text-center text-xs text-ink-400">
        <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded border border-dashed border-ink-400/40">
          反馈 QR
        </div>
        异常/错误反馈
      </div>
    </aside>
  )
}
