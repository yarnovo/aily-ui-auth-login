/**
 * akong AuthLogin · React Native 实现
 *
 * Metro bundler 默认按 `.native.tsx` 后缀解析 RN 端 · `.tsx` 解析 Web 端
 * 用方 `import { LoginFlow } from '@aily-ui/auth-login'` 自动取对应平台
 */

import { useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native'
import { tokens } from '@aily-ui/tokens'
import type { LoginFlowProps, LoginStep } from './LoginFlow.types'
import { PHONE_RE } from './LoginFlow.behavior'

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
  } = props

  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark'
  const t = scheme === 'dark' ? tokens.dark : tokens.light

  const [step, setStep] = useState<LoginStep>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (resendIn <= 0) return
    const id = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [resendIn])

  const reportError = (msg: string) => {
    if (onError) onError(msg)
    else Alert.alert(msg)
  }
  const reportDebugCode = (c: string) => {
    if (onDebugCode) onDebugCode(c)
    else Alert.alert(`debug · 验证码: ${c}`)
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
      if (r && r.debug_code) reportDebugCode(r.debug_code)
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

  const inputStyle = {
    height: 44,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.space[3],
    backgroundColor: t.bgElevated,
    color: t.fg,
    fontSize: 16,
  } as const

  const sendBtnStyle = (disabled: boolean) =>
    ({
      height: 44,
      borderRadius: tokens.radius.md,
      backgroundColor: disabled ? t.borderSubtle : t.fg,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.5 : 1,
    }) as const

  const phoneValid = PHONE_RE.test(phone)

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: t.bg, paddingHorizontal: tokens.space[6], paddingTop: 80 }}
    >
      <View style={{ alignItems: 'center', marginBottom: 48 }}>
        <Text style={{ fontSize: 36, fontWeight: '600', color: t.fg, marginBottom: 8 }}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ fontSize: 14, color: t.fgMuted }}>{subtitle}</Text>
        ) : null}
      </View>

      {step === 'phone' && (
        <View style={{ width: '100%', maxWidth: 384, alignSelf: 'center', gap: 16 }}>
          <TextInput
            value={phone}
            onChangeText={(v) => setPhone(v.replace(/\D/g, ''))}
            placeholder="手机号"
            placeholderTextColor={t.fgSubtle}
            keyboardType="phone-pad"
            maxLength={11}
            style={inputStyle}
          />
          <Pressable
            disabled={!phoneValid || sending}
            onPress={onSendCode}
            style={sendBtnStyle(!phoneValid || sending)}
          >
            <Text style={{ color: t.fgInverse, fontSize: 16, fontWeight: '500' }}>
              {sending ? '发送中...' : '发验证码'}
            </Text>
          </Pressable>
        </View>
      )}

      {step === 'code' && (
        <View style={{ width: '100%', maxWidth: 384, alignSelf: 'center', gap: 16 }}>
          <Text style={{ fontSize: 14, color: t.fgMuted, textAlign: 'center' }}>
            验证码已发送至 {phone}
          </Text>
          <TextInput
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, ''))}
            placeholder={`${codeLength} 位验证码`}
            placeholderTextColor={t.fgSubtle}
            keyboardType="number-pad"
            maxLength={codeLength}
            autoFocus
            style={inputStyle}
          />
          <Pressable
            disabled={code.length !== codeLength || verifying}
            onPress={onVerify}
            style={sendBtnStyle(code.length !== codeLength || verifying)}
          >
            <Text style={{ color: t.fgInverse, fontSize: 16, fontWeight: '500' }}>
              {verifying ? '登录中...' : '登录'}
            </Text>
          </Pressable>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Pressable
              onPress={() => {
                setStep('phone')
                setCode('')
              }}
            >
              <Text style={{ fontSize: 14, color: t.fgMuted }}>换个手机号</Text>
            </Pressable>
            <Pressable disabled={resendIn > 0 || sending} onPress={onResend}>
              <Text
                style={{
                  fontSize: 14,
                  color: t.fgMuted,
                  opacity: resendIn > 0 || sending ? 0.5 : 1,
                }}
              >
                {resendIn > 0 ? `重发 (${resendIn}s)` : '重发验证码'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

export default LoginFlow
