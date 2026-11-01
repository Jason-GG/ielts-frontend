export function Footer() {
  return (
    <footer className="mt-10 bg-[#1f1f1f] py-10 text-sm text-ink-400/80">
      <div className="mx-auto grid max-w-[1300px] gap-8 px-[70px] sm:grid-cols-3">
        <div>
          <h4 className="mb-2 font-semibold text-white">同桌教育</h4>
          <p>珠海同桌教育科技有限公司</p>
          <p>邮箱：eric@itongzhuo.com</p>
        </div>
        <div>
          <h4 className="mb-2 font-semibold text-white">站点链接</h4>
          <ul className="space-y-1">
            <li>雅思题库</li>
            <li>刘夏来语料库</li>
            <li>刘夏来视频课</li>
            <li>雅思资讯</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold text-white">联系客服</h4>
          <div className="flex h-20 w-20 items-center justify-center rounded border border-dashed border-white/20 text-[10px]">
            客服 QR
          </div>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-[1300px] px-[70px] text-xs">粤ICP备14060018</p>
    </footer>
  )
}
