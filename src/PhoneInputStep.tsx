import type { ChangeEvent } from 'react'
import { Button } from '@aily-ui/button'
import type { PhoneInputStepProps } from './LoginFlow.types'

/** akong AuthLogin · phone 输入 step · 单独可用 */
export function PhoneInputStep(props: PhoneInputStepProps) {
  const {
    title,
    subtitle,
    phone,
    onPhoneChange,
    onSendCode,
    sending = false,
    phoneValid = true,
    sendLabel = '发验证码',
  } = props

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // 仅保留数字 · 上限 11 位由 maxLength 控
    onPhoneChange(e.target.value.replace(/\D/g, ''))
  }

  return (
    <div className="ak-login-flow" data-testid="login-page">
      <div className="ak-login-flow__header">
        <h1 className="ak-login-flow__title" data-testid="login-logo">
          {title}
        </h1>
        {subtitle && (
          <p className="ak-login-flow__subtitle" data-testid="login-subtitle">
            {subtitle}
          </p>
        )}
      </div>
      <div className="ak-login-flow__panel" data-testid="login-step-phone">
        <input
          type="tel"
          inputMode="numeric"
          maxLength={11}
          placeholder="手机号"
          value={phone}
          onChange={handleChange}
          data-testid="login-phone-input"
          className="ak-login-flow__input"
        />
        <div data-testid="login-send-code-btn-wrap">
          <Button
            fullWidth
            disabled={!phoneValid || sending}
            loading={sending}
            onClick={onSendCode}
          >
            {sending ? '发送中...' : sendLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PhoneInputStep
