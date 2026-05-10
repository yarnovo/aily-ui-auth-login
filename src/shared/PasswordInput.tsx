import type { ChangeEvent } from 'react'

export interface PasswordInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  testId?: string
  autoFocus?: boolean
  minLength?: number
  maxLength?: number
}

/** 真共享 password input · 真 ak-login-flow__input 样式复用 */
export function PasswordInput(props: PasswordInputProps) {
  const {
    value,
    onChange,
    placeholder = '密码',
    testId = 'login-password-input',
    autoFocus = false,
    minLength = 6,
    maxLength = 64,
  } = props

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <input
      type="password"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      data-testid={testId}
      className="ak-login-flow__input"
      autoFocus={autoFocus}
      minLength={minLength}
      maxLength={maxLength}
      autoComplete="current-password"
    />
  )
}

export default PasswordInput
