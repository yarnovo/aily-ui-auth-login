export { LoginFlow, default } from './LoginFlow'

// password-based tabs
export { PhoneSmsTab } from './tabs/PhoneSmsTab'
export { EmailPasswordTab } from './tabs/EmailPasswordTab'
export { UsernamePasswordTab } from './tabs/UsernamePasswordTab'

// oauth buttons
export { GoogleButton } from './oauth/GoogleButton'
export { WechatButton } from './oauth/WechatButton'
export { QQButton } from './oauth/QQButton'

// shared components
export { PasswordInput } from './shared/PasswordInput'
export { SmsCodeInput } from './shared/SmsCodeInput'
export { ProviderDivider } from './shared/ProviderDivider'

// 真 backwards-compat · 真旧 step components 真保留
export { PhoneInputStep } from './PhoneInputStep'
export { OtpInputStep } from './OtpInputStep'

// types
export type {
  LoginFlowProps,
  PhoneInputStepProps,
  OtpInputStepProps,
  LoginStep,
  SendCodeResult,
  VerifyCodeResult,
  LoginFooterSlot,
  Provider,
  OAuthProvider,
  PasswordSubMode,
} from './types'

export { PHONE_RE, phoneCheckScenarios, codeCheckScenarios } from './LoginFlow.behavior'
