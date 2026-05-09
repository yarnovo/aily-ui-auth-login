/**
 * 跨端行为契约 · Web + RN 都遵循
 *
 * "给定 phone / code · 期望 sendCode / verifyCode 是否触发"的纯描述
 * 各端测试 import 跑同一份 spec · 行为强一致
 */

export const PHONE_RE = /^1[3-9]\d{9}$/

export interface PhoneCheckScenario {
  name: string
  phone: string
  valid: boolean
}

/** 手机号校验 spec · 11 位 1[3-9] 开头 */
export const phoneCheckScenarios: PhoneCheckScenario[] = [
  { name: '正常 13 段', phone: '13800138000', valid: true },
  { name: '正常 18 段', phone: '18888888888', valid: true },
  { name: '正常 19 段', phone: '19912345678', valid: true },
  { name: '12 开头不接受', phone: '12345678901', valid: false },
  { name: '少 1 位', phone: '1380013800', valid: false },
  { name: '多 1 位', phone: '138001380000', valid: false },
  { name: '空', phone: '', valid: false },
  { name: '非数字', phone: 'abcde678901', valid: false },
]

export interface CodeCheckScenario {
  name: string
  code: string
  codeLength: number
  /** 期望可提交 (长度 = codeLength · 全数字) */
  ready: boolean
}

/** 验证码可提交 spec · 默认 6 位全数字 */
export const codeCheckScenarios: CodeCheckScenario[] = [
  { name: '6 位全数字', code: '123456', codeLength: 6, ready: true },
  { name: '5 位短一位', code: '12345', codeLength: 6, ready: false },
  { name: '7 位长一位', code: '1234567', codeLength: 6, ready: false },
  { name: '空', code: '', codeLength: 6, ready: false },
  { name: '4 位 codeLength=4 OK', code: '1234', codeLength: 4, ready: true },
]
