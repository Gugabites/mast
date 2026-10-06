import { MONDAY_FIRST, WEEKDAY_LETTER, WEEKDAY_LONG } from '../lib/format'

interface WeekdayPickerProps {
  /** Dias no padrão do banco: 0 = domingo … 6 = sábado. */
  value: number[]
  onChange: (days: number[]) => void
}

const SHORTCUTS = [
  { label: 'Dias úteis', days: [1, 2, 3, 4, 5] },
  { label: 'Fins de semana', days: [0, 6] },
  { label: 'Todos', days: [0, 1, 2, 3, 4, 5, 6] },
]

export function WeekdayPicker({ value, onChange }: WeekdayPickerProps) {
  const toggle = (day: number) =>
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day])

  return (
    <div className="weekday-picker">
      <div className="weekday-days">
        {MONDAY_FIRST.map((day) => (
          <button
            key={day}
            type="button"
            className="weekday-btn"
            aria-pressed={value.includes(day)}
            aria-label={WEEKDAY_LONG[day]}
            onClick={() => toggle(day)}
          >
            {WEEKDAY_LETTER[day]}
          </button>
        ))}
      </div>
      <div className="weekday-shortcuts">
        {SHORTCUTS.map((shortcut) => (
          <button
            key={shortcut.label}
            type="button"
            className="btn btn-text"
            onClick={() => onChange(shortcut.days)}
          >
            {shortcut.label}
          </button>
        ))}
      </div>
    </div>
  )
}
