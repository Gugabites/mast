import { useId } from 'react'

interface Option<T> {
  value: T
  label: string
  hint?: string
}

interface SegmentedProps<T> {
  name: string
  legend: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
}

/** Opções exclusivas: radios nativos (teclado e leitor de tela) com rótulos estilizados. */
export function Segmented<T extends string | number>({
  name,
  legend,
  options,
  value,
  onChange,
  disabled,
}: SegmentedProps<T>) {
  const uid = useId()

  return (
    <fieldset className="segmented" disabled={disabled}>
      <legend>{legend}</legend>
      <div className="segmented-track">
        {options.map((option) => {
          const id = `${uid}-${option.value}`
          return (
            <div key={option.value} className="segmented-option">
              <input
                type="radio"
                id={id}
                name={`${uid}-${name}`}
                className="visually-hidden"
                checked={option.value === value}
                onChange={() => onChange(option.value)}
              />
              <label htmlFor={id}>
                {option.label}
                {option.hint && <small>{option.hint}</small>}
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
