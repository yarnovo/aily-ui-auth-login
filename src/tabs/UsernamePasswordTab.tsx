import { useEffect, useState } from 'react'
import { Button } from '@aily-ui/button'
import { PHONE_RE } from '../LoginFlow.behavior'
import { PasswordInput } from '../shared/PasswordInput'
import { SmsCodeInput } from '../shared/SmsCodeInput'
import type { PasswordSubMode, SendCodeResult, VerifyCodeResult } from '../types'

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,32}$/

export interface UsernamePasswordTabProps {
  onLogin: (username: string, password: string) => Promise<VerifyCodeResult>
  onRegister?: (
    username: string,
    password: string,
    phone: string,
    smsCode: string,
  ) => Promise<VerifyCodeResult>
  onReset?: (
    username: string,
    smsCode: string,
    newPassword: string,
  ) => Promise<VerifyCodeResult>
  onSendCode?: (phone: string) => Promise<SendCodeResult | void>
  onSuccess: (auth: VerifyCodeResult) => void
  onError: (msg: string) => void
  onDebugCode: (code: string) => void
  resendSeconds: number
  codeLength: number
}

/** username-password tab · 3 sub-mode (login / register / reset) */
export function UsernamePasswordTab(props: UsernamePasswordTabProps) {
  const {
    onLogin,
    onRegister,
    onReset,
    onSendCode,
    onSuccess,
    onError,
    onDebugCode,
    resendSeconds,
    codeLength,
  } = props

  const [mode, setMode] = useState<PasswordSubMode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sending, setSending] = useState(false)
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  const usernameValid = USERNAME_RE.test(username)
  const passwordValid = password.length >= 6
  const phoneValid = PHONE_RE.test(phone)
  const smsCodeReady = smsCode.length === codeLength

  const doSendSms = async () => {
    if (!phoneValid) {
      onError('请输入正确的 11 位手机号')
      return
    }
    if (!onSendCode) {
      onError('未配置 onSendCode')
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
      setResendIn(resendSeconds)
    } catch (e) {
      onError(`发送失败: ${String(e instanceof Error ? e.message : e)}`)
    } finally {
      setSending(false)
    }
  }

  const doSubmit = async () => {
    if (submitting) return
    if (!usernameValid) {
      onError('用户名 3-32 位 · 字母/数字/_-')
      return
    }

    try {
      setSubmitting(true)
      if (mode === 'login') {
        if (!passwordValid) {
          onError('密码至少 6 位')
          return
        }
        const r = await onLogin(username, password)
        onSuccess(r)
      } else if (mode === 'register') {
        if (!onRegister) {
          onError('未配置注册回调')
          return
        }
        if (!passwordValid) {
          onError('密码至少 6 位')
          return
        }
        if (!phoneValid) {
          onError('请输入正确手机号')
          return
        }
        if (!smsCodeReady) {
          onError(`请输入 ${codeLength} 位验证码`)
          return
        }
        const r = await onRegister(username, password, phone, smsCode)
        onSuccess(r)
      } else {
        // reset
        if (!onReset) {
          onError('未配置重置回调')
          return
        }
        if (!phoneValid) {
          onError('请输入正确手机号')
          return
        }
        if (!smsCodeReady) {
          onError(`请输入 ${codeLength} 位验证码`)
          return
        }
        if (!passwordValid) {
          onError('新密码至少 6 位')
          return
        }
        const r = await onReset(username, smsCode, password)
        onSuccess(r)
      }
    } catch (e) {
      onError(`操作失败: ${String(e instanceof Error ? e.message : e)}`)
    } finally {
      setSubmitting(false)
    }
  }

  const submitLabel =
    mode === 'login' ? '登录' : mode === 'register' ? '注册' : '重置密码'

  return (
    <div className="ak-login-flow__panel" data-testid="login-step-username-password">
      <input
        type="text"
        placeholder="用户名 (3-32 位)"
        value={username}
        onChange={(e) => setUsername(e.target.value.trim())}
        data-testid="login-username-input"
        className="ak-login-flow__input"
        autoComplete="username"
        maxLength={32}
      />

      {mode !== 'reset' && (
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder={mode === 'register' ? '设置密码 (至少 6 位)' : '密码'}
          testId="login-username-password-input"
        />
      )}

      {(mode === 'register' || mode === 'reset') && (
        <>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={11}
            placeholder="手机号 (验证用)"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            data-testid="login-username-phone-input"
            className="ak-login-flow__input"
          />
          <div className="ak-login-flow__row">
            <SmsCodeInput
              value={smsCode}
              onChange={setSmsCode}
              codeLength={codeLength}
              testId="login-username-sms-input"
            />
            <button
              type="button"
              className="ak-login-flow__link"
              disabled={!phoneValid || resendIn > 0 || sending}
              onClick={doSendSms}
              data-testid="login-username-send-sms-btn"
            >
              {sending
                ? '发送中...'
                : resendIn > 0
                ? `重发 (${resendIn}s)`
                : '发验证码'}
            </button>
          </div>

          {mode === 'reset' && (
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="新密码 (至少 6 位)"
              testId="login-username-newpassword-input"
            />
          )}
        </>
      )}

      <div data-testid="login-username-submit-btn-wrap">
        <Button
          fullWidth
          disabled={submitting}
          loading={submitting}
          onClick={doSubmit}
          data-testid="login-username-submit-btn"
        >
          {submitting ? '处理中...' : submitLabel}
        </Button>
      </div>

      <div className="ak-login-flow__row">
        <button
          type="button"
          className="ak-login-flow__link"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          data-testid="login-username-toggle-register-btn"
        >
          {mode === 'login' ? '没账号 · 注册' : '已有账号 · 登录'}
        </button>
        <button
          type="button"
          className="ak-login-flow__link"
          onClick={() => setMode(mode === 'reset' ? 'login' : 'reset')}
          data-testid="login-username-toggle-reset-btn"
        >
          {mode === 'reset' ? '回登录' : '忘密码'}
        </button>
      </div>
    </div>
  )
}

export default UsernamePasswordTab
