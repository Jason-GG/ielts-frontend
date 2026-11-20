import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { MEMBERSHIP_TIERS } from '../../data/speakingAndMembership'
import type { MembershipTier } from '../../types'
import { Modal } from '../common/Modal'

interface MembershipModalProps {
  open: boolean
  onClose: () => void
}

export function MembershipModal({ open, onClose }: MembershipModalProps) {
  const { user, openLoginModal, updateMemberships } = useAuth()
  const [tiers, setTiers] = useState<MembershipTier[]>(MEMBERSHIP_TIERS)
  const [selectedTerms, setSelectedTerms] = useState<Record<string, string>>({})
  const [busyTier, setBusyTier] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setNotice(null)
    api
      .getMembershipTiers()
      .then((res) => {
        if (res.tiers.length > 0) setTiers(res.tiers)
      })
      .catch(() => {
        // fallback to static MEMBERSHIP_TIERS
      })
  }, [open])

  async function handleSubscribe(tier: MembershipTier) {
    if (!user) {
      onClose()
      openLoginModal()
      return
    }
    const chosenTerm = selectedTerms[tier.id] || tier.plans[0]?.term || '31天'
    setBusyTier(tier.id)
    setNotice(null)
    try {
      const res = await api.subscribeMembership(tier.id, chosenTerm)
      updateMemberships(res.memberships)
      setNotice(`已成功开通「${tier.name} · ${chosenTerm}」！权益已实时生效。`)
    } catch (e) {
      setNotice(e instanceof Error ? e.message : '开通失败')
    } finally {
      setBusyTier(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="会员中心" widthClass="max-w-3xl">
      {user && user.memberships.length > 0 && (
        <div className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-xs text-brand-800">
          <span className="font-semibold">当前生效权益：</span>
          {user.memberships.map((m) => `${m.tier_name} (${m.plan_term})`).join(' · ')}
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-700">{notice}</div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {tiers.map((tier) => {
          const currentTerm = selectedTerms[tier.id] || tier.plans[0]?.term
          return (
            <div key={tier.id} className="flex flex-col justify-between rounded-xl border border-ink-400/15 p-4">
              <div>
                <h4 className="text-sm font-semibold text-ink-900">{tier.name}</h4>
                <p className="mt-1 text-xs text-ink-600">{tier.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tier.plans.map((plan) => {
                    const active = plan.term === currentTerm
                    return (
                      <button
                        key={plan.term}
                        type="button"
                        onClick={() => setSelectedTerms((prev) => ({ ...prev, [tier.id]: plan.term }))}
                        className={`rounded-lg border px-3 py-2 text-center transition ${
                          active
                            ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-500'
                            : 'border-brand-200 hover:border-brand-400'
                        }`}
                      >
                        <div className="text-xs text-ink-600">{plan.term}</div>
                        <div className="text-sm font-bold text-brand-700">{plan.price}</div>
                        {plan.note && <div className="text-[11px] text-ink-400">{plan.note}</div>}
                      </button>
                    )
                  })}
                </div>
              </div>
              <button
                type="button"
                disabled={busyTier === tier.id}
                onClick={() => handleSubscribe(tier)}
                className="mt-4 w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {busyTier === tier.id ? '处理中...' : user ? `立即开通 (${currentTerm})` : '登录后开通'}
              </button>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
