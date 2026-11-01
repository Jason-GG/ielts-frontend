interface FilterChipsProps {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}

export function FilterChips({ label, options, value, onChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-1.5">
      <span className="w-20 shrink-0 text-sm text-ink-600">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option === value
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={
                active
                  ? 'rounded-full bg-brand-600 px-3 py-1 text-xs text-white'
                  : 'rounded-full bg-surface-alt px-3 py-1 text-xs text-ink-600 hover:bg-brand-50'
              }
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
