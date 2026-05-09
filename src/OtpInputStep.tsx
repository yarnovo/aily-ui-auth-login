import type { ChangeEvent } from 'react'
import { Button } from '@aily-ui/button'
import type { OtpInputStepProps } from './LoginFlow.types'

/** akong AuthLogin · OTP 输入 step · 单独可用 */
export function OtpInputStep(props: OtpInputStepProps) {
  const {
    phone,
    code,
    onCodeChange,
    onVerify,
    verifying = false,
    onResend,
    resendIn,
    onChangePhone,
    codeLength = 6,
    verifyLabel = '登录',
    sending = false,
  } = props

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onCodeChange(e.target.value.replace(/\D/g, ''))
  }

  const ready = code.length === codeLength

  return (
    <div className="ak-login-flow__panel" data-testid="login-step-code">
      <div className="ak-login-flow__phone-display" data-testid="login-phone-display">
        验证码已发送至 {phone}
      </div>
      <input
        type="tel"
        inputMode="numeric"
        maxLength={codeLength}
        placeholder={`${codeLength} 位验证码`}
        value={code}
        onChange={handleChange}
        data-testid="login-code-input"
        className="ak-login-flow__input"
        autoFocus
      />
      <div data-testid="login-verify-btn-wrap">
        <Button fullWidth disabled={!ready || verifying} loading={verifying} onClick={onVerify}>
          {verifying ? '登录中...' : verifyLabel}
        </Button>
      </div>
      <div className="ak-login-flow__row">
        <button
          type="button"
          className="ak-login-flow__link"
          onClick={onChangePhone}
          data-testid="login-change-phone-btn"
        >
          换个手机号
        </button>
        <button
          type="button"
          className="ak-login-flow__link"
          disabled={resendIn > 0 || sending}
          onClick={onResend}
          data-testid="login-resend-btn"
        >
          {resendIn > 0 ? `重发 (${resendIn}s)` : '重发验证码'}
        </button>
      </div>
    </div>
  )
}

export default OtpInputStep
