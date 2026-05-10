/** 真 backwards-compat shim · 真旧 import 路径真 re-export 自 types.ts
 *
 * 真新代码真 import 自 './types' 直接 · 真旧 caller 真不破 (PhoneInputStep / OtpInputStep / RN)
 */

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
