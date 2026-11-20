import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../../api/client'
import { useAuth, type BookingModalTarget } from '../../context/AuthContext'
import { Modal } from '../common/Modal'

interface BookingModalProps {
  target: BookingModalTarget | null
  onClose: () => void
}

export function BookingModal({ target, onClose }: BookingModalProps) {
  const { user } = useAuth()
  const [contactName, setContactName] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [submittedId, setSubmittedId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!target) return
    setContactName((prev) => prev || user?.display_name || '')
    setContactInfo((prev) => prev || user?.phone || user?.email || '')
  }, [target, user])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!target) return
    setBusy(true)
    setError(null)
    try {
      const res = await api.createBooking({
        service_type: target.serviceType,
        plan_name: target.planName,
        contact_name: contactName,
        contact_info: contactInfo,
        notes: notes || undefined,
      })
      setSubmittedId(res.booking.id)
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败')
    } finally {
      setBusy(false)
    }
  }

  function handleClose() {
    setSubmittedId(null)
    setError(null)
    setNotes('')
    onClose()
  }

  return (
    <Modal open={Boolean(target)} onClose={handleClose} title={target?.title || '预约咨询'} widthClass="max-w-md">
      {submittedId ? (
        <div className="py-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-600">
            ✓
          </div>
          <h4 className="text-base font-bold text-ink-900">预约提交成功（单号 #{submittedId}）</h4>
          <p className="mt-1 text-xs text-ink-600">课程顾问将在 15 分钟内通过预留联系方式与您对接。</p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-5 rounded-full bg-brand-600 px-6 py-2 text-sm text-white hover:bg-brand-700"
          >
            完成
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {target?.planName && (
            <div className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
              所选项目：<span className="font-semibold">{target.planName}</span>
            </div>
          )}
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}
          <div>
            <label className="mb-1 block text-xs text-ink-600">您的称呼 *</label>
            <input
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="请输入姓名或昵称"
              className="w-full rounded-lg border border-ink-400/30 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-600">微信号 / 手机号 *</label>
            <input
              required
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="方便助教老师添加您沟通"
              className="w-full rounded-lg border border-ink-400/30 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-600">目标分数 / 备考备注</label>
            <textarea
              rows={3}
              maxLength={1000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：下月机考，目标总分 7.0（小分 6.5）"
              className="w-full rounded-lg border border-ink-400/30 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-full bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {busy ? '正在提交...' : '立即提交预约'}
          </button>
        </form>
      )}
    </Modal>
  )
}
