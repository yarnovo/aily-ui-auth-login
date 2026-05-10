import { useEffect, useState } from 'react'
import { Button } from '@aily-ui/button'
import { PHONE_RE } from '../LoginFlow.behavior'
import { OtpInputStep } from '../OtpInputStep'
import { SmsCodeInput } from '../shared/SmsCodeInput'
import type { LoginStep, SendCodeResult, VerifyCodeResult } from '../types'

export interface PhoneSmsTabProps {
  onSendCode: (phone: string) => Promise<SendCodeResult | void>
  onVerifyCode: (phone: string, code: string) => Promise<VerifyCodeResult>
  onSuccess: (auth: VerifyCodeResult) => void
  onError: (msg: string) => void
  onDebugCode: (code: string) => void
  resendSeconds: number
  codeLength: number
}

/** phone-sms tab · 真 2 step (phone → code) · 真复用 OtpInputStep (含 SmsCodeInput) */
export function PhoneSmsTab(props: PhoneSmsTabProps) {
  const {
    onSendCode,
    onVerifyCode,
    onSuccess,
    onError,
    onDebugCode,
    resendSeconds,
    codeLength,
  } = props

  const [step, setStep] = useState<LoginStep>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  const doSendCode = async () => {
    if (!PHONE_RE.test(phone)) {
      onError('请输入正确的 11 位手机号')
      return
    }
    if (sending) return
    setSending(true)
    try {
      const r = (await onSendCode(phone)) as
        | { ok?: boolean; debug_code?: string | null }
        | void
      if (r && r.ok === false) throw new Error('发送失败')
      if (r && r.debug_code) onDebugCode(r.debug_code)
      setStep('code')
      setResendIn(resendSeconds)
    } catch (e) {
      onError(`发送失败: ${String(e instanceof Error ? e.message : e)}`)
    } finally {
      setSending(false)
    }
  }

  const doVerify = async () => {
    if (code.length !== codeLength) {
      onError(`请输入 ${codeLength} 位验证码`)
      return
    }
    if (verifying) return
    setVerifying(true)
    try {
      const r = await onVerifyCode(phone, code)
      onSuccess(r)
    } catch (e) {
      onError(`验证失败: ${String(e instanceof Error ? e.message : e)}`)
    } finally {
      setVerifying(false)
    }
  }

  const onResend = () => {
    if (resendIn > 0) return
    setCode('')
    doSendCode()
  }

  const onChangePhone = () => {
    setStep('phone')
    setCode('')
  }

  const phoneValid = PHONE_RE.test(phone)

  if (step === 'phone') {
    return (
      <div className="ak-login-flow__panel" data-testid="login-step-phone">
        <input
          type="tel"
          inputMode="numeric"
          maxLength={11}
          placeholder="手机号"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          data-testid="login-phone-input"
          className="ak-login-flow__input"
        />
        <div data-testid="login-send-code-btn-wrap">
          <Button
            fullWidth
            disabled={!phoneValid || sending}
            loading={sending}
            onClick={doSendCode}
            data-testid="login-send-code-btn"
          >
            {sending ? '发送中...' : '发验证码'}
          </Button>
        </div>
      </div>
    )
  }

  // step === 'code'
  return (
    <OtpInputStep
      phone={phone}
      code={code}
      onCodeChange={setCode}
      onVerify={doVerify}
      verifying={verifying}
      onResend={onResend}
      resendIn={resendIn}
      onChangePhone={onChangePhone}
      codeLength={codeLength}
      sending={sending}
    />
  )
}

// 真 SmsCodeInput 真在 register/reset tab 真直接用 (此处真不渲)
export { SmsCodeInput }

export default PhoneSmsTab
