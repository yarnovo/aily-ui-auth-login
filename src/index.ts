export { LoginFlow, default } from './LoginFlow'
export { PhoneInputStep } from './PhoneInputStep'
export { OtpInputStep } from './OtpInputStep'
export type {
  LoginFlowProps,
  PhoneInputStepProps,
  OtpInputStepProps,
  LoginStep,
  SendCodeResult,
  VerifyCodeResult,
  LoginFooterSlot,
} from './LoginFlow.types'
export { PHONE_RE, phoneCheckScenarios, codeCheckScenarios } from './LoginFlow.behavior'
