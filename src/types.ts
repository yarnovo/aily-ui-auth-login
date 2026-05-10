import type { ReactNode } from 'react'

/** 真支持 6 provider · enable list 决定真按顺序显示 */
export type Provider =
  | 'phone-sms'
  | 'email-password'
  | 'username-password'
  | 'oauth-google'
  | 'oauth-wechat'
  | 'oauth-qq'

/** OAuth 真 sub provider 真 (oauth-* 真 strip 前缀) */
export type OAuthProvider = 'google' | 'wechat' | 'qq'

/** sendCode 响应 · debug 模式可回 debug_code */
export interface SendCodeResult {
  ok?: boolean
  debug_code?: string | null
}

/** verifyCode 响应 · 调用方自管 user / token shape · 这里只透传 */
export type VerifyCodeResult = unknown

/** LoginFlow Props · 6 provider 真聚合 wizard
 *
 * default providers=['phone-sms'] · 真 backwards-compat (旧 caller 真不破)
 *
 * password-based 3 个 (phone-sms / email-password / username-password) 真 tab 真切
 * oauth-* 3 个 真"其他登录方式" 真 button row
 */
export interface LoginFlowProps {
  /** 大标题 · 例 "小喜" */
  title: string
  /** 副标题 · 例 "找你的人" */
  subtitle?: string

  /** 真 enable list (真按顺序显示) · default ['phone-sms'] */
  providers?: Provider[]

  // ==================== phone-sms (真现状 keep) ====================
  /** 发验证码 · sendCode(phone) */
  onSendCode?: (phone: string) => Promise<SendCodeResult | void>
  /** 验证码登录 · verifyCode(phone, code) · 返回值透传 onSuccess */
  onVerifyCode?: (phone: string, code: string) => Promise<VerifyCodeResult>

  // ==================== email-password (真新) ====================
  /** 邮箱密码登录 */
  onEmailLogin?: (email: string, password: string) => Promise<VerifyCodeResult>
  /** 邮箱注册 · 真带手机号 + SMS 二次验证 */
  onEmailRegister?: (
    email: string,
    password: string,
    phone: string,
    smsCode: string,
  ) => Promise<VerifyCodeResult>
  /** 邮箱重置密码 · 真 SMS 验证 */
  onEmailReset?: (email: string, smsCode: string, newPassword: string) => Promise<VerifyCodeResult>

  // ==================== username-password (真新) ====================
  /** 用户名密码登录 */
  onUsernameLogin?: (username: string, password: string) => Promise<VerifyCodeResult>
  /** 用户名注册 · 真带手机号 + SMS 二次验证 */
  onUsernameRegister?: (
    username: string,
    password: string,
    phone: string,
    smsCode: string,
  ) => Promise<VerifyCodeResult>
  /** 用户名重置密码 · 真 SMS 验证 */
  onUsernameReset?: (
    username: string,
    smsCode: string,
    newPassword: string,
  ) => Promise<VerifyCodeResult>

  // ==================== oauth-* (真新 · 真 redirect) ====================
  /** OAuth 触发 · 调用方真 redirect 到 provider OAuth url */
  onOAuthLogin?: (provider: OAuthProvider) => void

  // ==================== 共用回调 ====================
  /** 登录成功回调 · 透传 verifyCode / onEmailLogin / onUsernameLogin 返回值 */
  onSuccess: (auth: VerifyCodeResult) => void
  /** error 通知 · 调用方接 toast / 自己 setState */
  onError?: (msg: string) => void
  /** debug 模式 · sendCode 返 debug_code 时调用 (default 走 alert) */
  onDebugCode?: (code: string) => void

  /** 真 unified login UI · 登完 redirect 回原 origin (调用方自处理 url 拼接) */
  redirectAfterLogin?: string

  /** 重发倒计时秒数 · default 60 */
  resendSeconds?: number
  /** 验证码长度 · default 6 */
  codeLength?: number

  /** 外层 className · 包到 ak-login-flow 根 */
  className?: string
}

/** PhoneInputStep Props · 单独导出 · 真 phone-sms tab 真用 */
export interface PhoneInputStepProps {
  title: string
  subtitle?: string
  phone: string
  onPhoneChange: (v: string) => void
  onSendCode: () => void
  sending?: boolean
  phoneValid?: boolean
  sendLabel?: string
}

/** OtpInputStep Props · 单独导出 */
export interface OtpInputStepProps {
  phone: string
  code: string
  onCodeChange: (v: string) => void
  onVerify: () => void
  verifying?: boolean
  onResend: () => void
  resendIn: number
  onChangePhone: () => void
  codeLength?: number
  verifyLabel?: string
  sending?: boolean
}

/** 内部 wizard step (phone-sms tab) */
export type LoginStep = 'phone' | 'code'

/** password-based tab 真子模式 · login | register | reset */
export type PasswordSubMode = 'login' | 'register' | 'reset'

/** 自定义 footer slot · 调用方放协议链接 */
export type LoginFooterSlot = ReactNode
