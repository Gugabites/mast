import type { ReactNode } from 'react'

interface IconProps {
  size?: number
}

// Ícones de traço: herdam a cor do texto (currentColor).
function Svg({ size = 20, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function Logo({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#1E6B47" />
      <path d="M30 12 V52" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <path d="M34 16 L50 44 H34 Z" fill="#FFFFFF" />
      <path d="M16 52 H48" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

/* ---------- navegação ---------- */

export function SunIcon({ size = 24 }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  )
}

export function CheckIcon({ size = 24 }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" />
    </Svg>
  )
}

export function TargetIcon({ size = 24 }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </Svg>
  )
}

export function JournalIcon({ size = 24 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M9 9h3M9 13h7M9 17h7" />
    </Svg>
  )
}

export function ChartIcon({ size = 24 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M3 21h18M6 21v-8M12 21V5M18 21v-11" />
    </Svg>
  )
}

/* ---------- ações ---------- */

export function PlusIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  )
}

export function MinusIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M5 12h14" />
    </Svg>
  )
}

export function EditIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13 7l4 4" />
    </Svg>
  )
}

export function ArchiveIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M3 5h18v4H3z" />
      <path d="M5 9v10h14V9M10 13h4" />
    </Svg>
  )
}

export function TrashIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" />
    </Svg>
  )
}

export function ChevronLeftIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M15 5l-7 7 7 7" />
    </Svg>
  )
}

export function ChevronRightIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M9 5l7 7-7 7" />
    </Svg>
  )
}

export function CloseIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  )
}

export function TickIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </Svg>
  )
}

export function FlameIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M12 3s5 4 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 1.5.5 2.5 1.5 3C10.5 9 11 6 12 3z" />
    </Svg>
  )
}

export function MoreIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </Svg>
  )
}

export function RestoreIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </Svg>
  )
}
