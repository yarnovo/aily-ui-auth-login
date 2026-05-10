import type { ChangeEvent } from 'react'

export interface SmsCodeInputProps {
  value: string
  onChange: (v: string) => void
  codeLength?: number
  testId?: string
  autoFocus?: boolean
}

/** 真共享 SMS code input · 真 phone-sms / register / reset 共用 */
export function SmsCodeInput(props: SmsCodeInputProps) {
  const {
    value,
    onChange,
    codeLength = 6,
    testId = 'login-code-input',
    autoFocus = false,
  } = props

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.replace(/\D/g, ''))
  }

  return (
    <input
      type="tel"
      inputMode="numeric"
      maxLength={codeLength}
      placeholder={`${codeLength} 位验证码`}
      value={value}
      onChange={handleChange}
      data-testid={testId}
      className="ak-login-flow__input"
      autoFocus={autoFocus}
    />
  )
}

export default SmsCodeInput
