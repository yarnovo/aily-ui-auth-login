import { useEffect, useState } from 'react'
import { Button } from '@aily-ui/button'
import type { LoginFlowProps, LoginStep } from './LoginFlow.types'
import { PhoneInputStep } from './PhoneInputStep'
import { OtpInputStep } from './OtpInputStep'
import { PHONE_RE } from './LoginFlow.behavior'
import './LoginFlow.css'

/** akong AuthLogin · LoginFlow · Web · 2 步手机号登录 wizard
 *
 * 第 1 步: phone input + "发验证码"
 * 第 2 步: phone (灰显示) + code input + "登录" + 倒计时重发 + 换手机号
 *
 * sendCode / verifyCode / onSuccess 通过 props 注入 · 组件不写死 endpoint。
 */
export function LoginFlow(props: LoginFlowProps) {
  const {
    title,
    subtitle,
    sendCode,
    verifyCode,
    onSuccess,
    onError,
    onDebugCode,
    resendSeconds = 60,
    codeLength = 6,
    className,
  } = props

  const [step, setStep] = useState<LoginStep>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resendIn, setResendIn] = useState(0)

  /** 倒计时 · 1s tick · resendIn = 0 时停 */
  useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  const reportError = (msg: string) => {
    if (onError) onError(msg)
    else if (typeof window !== 'undefined') window.alert(msg)
  }

  const reportDebugCode = (code: string) => {
    if (onDebugCode) onDebugCode(code)
    else if (typeof window !== 'undefined') {
      window.alert(`debug 模式 · 验证码: ${code}\n(prod 切真 SMS 后此 alert 不弹)`)
    }
  }

  const onSendCode = async () => {
    if (!PHONE_RE.test(phone)) {
      reportError('请输入正确的 11 位手机号')
      return
    }
    if (sending) return
    setSending(true)
    try {
      const r = (await sendCode(phone)) as { ok?: boolean; debug_code?: string | null } | void
      if (r && r.ok === false) throw new Error('发送失败')
      // debug 模式 · sendCode 返 debug_code 时调 onDebugCode (让自测)
      if (r && r.debug_code) {
        reportDebugCode(r.debug_code)
      }
      setStep('code')
      setResendIn(resendSeconds)
    } catch (e) {
      reportError(`发送失败: ${String(e instanceof Error ? e.message : e)}`)
    } finally {
      setSending(false)
    }
  }

  const onVerify = async () => {
    if (code.length !== codeLength) {
      reportError(`请输入 ${codeLength} 位验证码`)
      return
    }
    if (verifying) return
    setVerifying(true)
    try {
      const r = await verifyCode(phone, code)
      onSuccess(r)
    } catch (e) {
      reportError(`验证失败: ${String(e instanceof Error ? e.message : e)}`)
    } finally {
      setVerifying(false)
    }
  }

  const onResend = () => {
    if (resendIn > 0) return
    setCode('')
    onSendCode()
  }

  const onChangePhone = () => {
    setStep('phone')
    setCode('')
  }

  const phoneValid = PHONE_RE.test(phone)

  return (
    <div
      className={['ak-login-flow', className].filter(Boolean).join(' ')}
      data-testid="login-page"
    >
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

      {step === 'phone' && (
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
              onClick={onSendCode}
              data-testid="login-send-code-btn"
            >
              {sending ? '发送中...' : '发验证码'}
            </Button>
          </div>
        </div>
      )}

      {step === 'code' && (
        <OtpInputStep
          phone={phone}
          code={code}
          onCodeChange={setCode}
          onVerify={onVerify}
          verifying={verifying}
          onResend={onResend}
          resendIn={resendIn}
          onChangePhone={onChangePhone}
          codeLength={codeLength}
          sending={sending}
        />
      )}
    </div>
  )
}

// re-export sub-step components for convenience
export { PhoneInputStep, OtpInputStep }
export default LoginFlow
