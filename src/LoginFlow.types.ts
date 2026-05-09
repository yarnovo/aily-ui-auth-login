import type { ReactNode } from 'react'

/** sendCode response · debug 模式可回 debug_code */
export interface SendCodeResult {
  ok?: boolean
  debug_code?: string | null
}

/** verifyCode response · 调用方自管 user / token shape · 这里只透传 */
export type VerifyCodeResult = unknown

/** LoginFlow Props · 2 步 wizard (phone → OTP) · 接口适配通过 props 注入 */
export interface LoginFlowProps {
  /** 大标题 · 例 "小喜" / "阿空小问" */
  title: string
  /** 副标题 · 例 "找你的人" / "真挖访谈 · 30 分钟真说" */
  subtitle?: string

  /** 发验证码 · 调用方自实现 fetch · 不写死 endpoint */
  sendCode: (phone: string) => Promise<SendCodeResult | void>
  /** 验证码登录 · 返回值原样透传给 onSuccess · 调用方决定 token / user shape */
  verifyCode: (phone: string, code: string) => Promise<VerifyCodeResult>

  /** 登录成功回调 · 拿 verifyCode 的原始返回 · 调用方自己存 token / 跳路由 */
  onSuccess: (auth: VerifyCodeResult) => void

  /** error 通知 · 调用方接 toast / 自己 setState · 不强依赖某 toast 库 */
  onError?: (msg: string) => void
  /** debug 模式 · sendCode 返 debug_code 时调用 (default 走 alert) */
  onDebugCode?: (code: string) => void

  /** 重发倒计时秒数 · default 60 */
  resendSeconds?: number
  /** 验证码长度 · default 6 */
  codeLength?: number

  /** 外层 className · 包到 ak-login-flow 根 */
  className?: string
}

/** PhoneInputStep Props · 单独导出 · 调用方自己拼 wizard */
export interface PhoneInputStepProps {
  /** 标题区 · default 跟 LoginFlow 一致 */
  title: string
  subtitle?: string
  /** 受控 phone 值 */
  phone: string
  onPhoneChange: (v: string) => void
  /** 发验证码 · loading 自管 */
  onSendCode: () => void
  sending?: boolean
  /** 11 位手机号正则验过 · 用于 disable 按钮 */
  phoneValid?: boolean
  /** 自定义按钮文案 · default '发验证码' */
  sendLabel?: string
}

/** OtpInputStep Props · 单独导出 */
export interface OtpInputStepProps {
  /** 当前手机号 · 灰显示 */
  phone: string
  /** 受控 code 值 */
  code: string
  onCodeChange: (v: string) => void
  /** 提交验证 */
  onVerify: () => void
  verifying?: boolean
  /** 重发 · resendIn > 0 时禁用 */
  onResend: () => void
  resendIn: number
  /** 换手机号 · 回 phone step */
  onChangePhone: () => void
  /** 验证码长度 · default 6 */
  codeLength?: number
  /** 按钮文案 · default '登录' */
  verifyLabel?: string
  /** sending 状态用来禁用 resend */
  sending?: boolean
}

/** 内部 step 状态 */
export type LoginStep = 'phone' | 'code'

/** 自定义 footer slot · 调用方放协议链接 / 第三方登录 */
export type LoginFooterSlot = ReactNode
