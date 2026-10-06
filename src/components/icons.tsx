const strokeProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#1E6B47" />
      <path d="M30 12 V52" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <path d="M34 16 L50 44 H34 Z" fill="#FFFFFF" />
      <path d="M16 52 H48" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function SunIcon() {
  return (
    <svg {...strokeProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg {...strokeProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" />
    </svg>
  )
}

export function TargetIcon() {
  return (
    <svg {...strokeProps}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  )
}

export function JournalIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M9 9h3M9 13h7M9 17h7" />
    </svg>
  )
}

export function ChartIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M3 21h18M6 21v-8M12 21V5M18 21v-11" />
    </svg>
  )
}
