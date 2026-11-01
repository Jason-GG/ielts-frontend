import { MEMBERSHIP_TIERS } from '../../data/speakingAndMembership'
import { Modal } from '../common/Modal'

interface MembershipModalProps {
  open: boolean
  onClose: () => void
}

export function MembershipModal({ open, onClose }: MembershipModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="会员中心" widthClass="max-w-3xl">
      <div className="grid gap-4 sm:grid-cols-2">
        {MEMBERSHIP_TIERS.map((tier) => (
          <div key={tier.id} className="rounded-md border border-ink-400/15 p-4">
            <h4 className="text-sm font-semibold text-ink-900">{tier.name}</h4>
            <p className="mt-1 text-xs text-ink-600">{tier.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tier.plans.map((plan) => (
                <div key={plan.term} className="rounded border border-brand-200 px-3 py-2 text-center">
                  <div className="text-xs text-ink-600">{plan.term}</div>
                  <div className="text-sm font-bold text-brand-700">{plan.price}</div>
                  {plan.note && <div className="text-[11px] text-ink-400">{plan.note}</div>}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-3 w-full rounded bg-brand-600 py-2 text-sm text-white hover:bg-brand-700"
            >
              立即支付
            </button>
          </div>
        ))}
      </div>
    </Modal>
  )
}
