import { Modal } from '../common/Modal'

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="登录 / 注册" widthClass="max-w-sm">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="flex h-40 w-40 items-center justify-center rounded border border-dashed border-ink-400/40 bg-surface-alt text-xs text-ink-400">
          微信扫码登录占位
        </div>
        <p className="text-sm text-ink-800">使用微信扫一扫登录「同桌英语」</p>
        <button type="button" className="text-xs text-brand-600 underline underline-offset-2">
          使用密码 / 短信登录
        </button>
      </div>
    </Modal>
  )
}
