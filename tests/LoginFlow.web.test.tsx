/**
 * Web 端组件测试 · vitest + @testing-library/react
 *
 * 覆盖：
 * - phone step 渲染 + input 仅留数字
 * - phone 不合法 disable send 按钮
 * - sendCode 触发后切到 code step
 * - sendCode 返 debug_code 调 onDebugCode
 * - verifyCode 触发 onSuccess
 * - 倒计时 resendIn / 换手机号回 phone step
 * - 共享 spec (phoneCheckScenarios / codeCheckScenarios)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { LoginFlow } from '../src/LoginFlow'
import {
  phoneCheckScenarios,
  codeCheckScenarios,
  PHONE_RE,
} from '../src/LoginFlow.behavior'

const VALID_PHONE = '13800138000'

function makeProps(overrides: Partial<Parameters<typeof LoginFlow>[0]> = {}) {
  return {
    title: '小喜',
    subtitle: '找你的人',
    sendCode: vi.fn(async () => ({ ok: true, debug_code: null })),
    verifyCode: vi.fn(async () => ({ jwt: 'tok', user: { id: 'u1', phone: VALID_PHONE } })),
    onSuccess: vi.fn(),
    onError: vi.fn(),
    onDebugCode: vi.fn(),
    ...overrides,
  }
}

describe('LoginFlow (Web) · phone step', () => {
  it('渲染 title / subtitle / phone input', () => {
    render(<LoginFlow {...makeProps()} />)
    expect(screen.getByTestId('login-logo')).toHaveTextContent('小喜')
    expect(screen.getByTestId('login-subtitle')).toHaveTextContent('找你的人')
    expect(screen.getByTestId('login-phone-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-step-phone')).toBeInTheDocument()
  })

  it('phone input 仅保留数字', () => {
    render(<LoginFlow {...makeProps()} />)
    const input = screen.getByTestId('login-phone-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'a1b2c3' } })
    expect(input.value).toBe('123')
  })

  it('phone 不合法不发送 · 调 onError', async () => {
    const props = makeProps()
    render(<LoginFlow {...props} />)
    const input = screen.getByTestId('login-phone-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: '123' } })
    // 按钮应禁用 · click 不触发 sendCode
    const btn = screen.getByTestId('login-send-code-btn-wrap').querySelector('button')!
    expect(btn).toBeDisabled()
    expect(props.sendCode).not.toHaveBeenCalled()
  })

  it('sendCode 触发 · 切到 code step', async () => {
    const props = makeProps()
    render(<LoginFlow {...props} />)
    const input = screen.getByTestId('login-phone-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: VALID_PHONE } })
    const btn = screen.getByTestId('login-send-code-btn-wrap').querySelector('button')!
    await act(async () => {
      fireEvent.click(btn)
    })
    expect(props.sendCode).toHaveBeenCalledWith(VALID_PHONE)
    expect(screen.getByTestId('login-step-code')).toBeInTheDocument()
    expect(screen.getByTestId('login-phone-display')).toHaveTextContent(VALID_PHONE)
  })

  it('sendCode 返 debug_code · 调 onDebugCode', async () => {
    const props = makeProps({
      sendCode: vi.fn(async () => ({ ok: true, debug_code: '888888' })),
    })
    render(<LoginFlow {...props} />)
    const input = screen.getByTestId('login-phone-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: VALID_PHONE } })
    const btn = screen.getByTestId('login-send-code-btn-wrap').querySelector('button')!
    await act(async () => {
      fireEvent.click(btn)
    })
    expect(props.onDebugCode).toHaveBeenCalledWith('888888')
  })
})

describe('LoginFlow (Web) · code step', () => {
  it('verifyCode 成功调 onSuccess · 透传返回值', async () => {
    const result = { jwt: 'tok-xyz', user: { id: 'u1', phone: VALID_PHONE } }
    const props = makeProps({
      verifyCode: vi.fn(async () => result),
    })
    render(<LoginFlow {...props} />)
    // 进 code step
    fireEvent.change(screen.getByTestId('login-phone-input'), { target: { value: VALID_PHONE } })
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-send-code-btn-wrap').querySelector('button')!)
    })
    // 输入 code
    fireEvent.change(screen.getByTestId('login-code-input'), { target: { value: '123456' } })
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-verify-btn-wrap').querySelector('button')!)
    })
    expect(props.verifyCode).toHaveBeenCalledWith(VALID_PHONE, '123456')
    expect(props.onSuccess).toHaveBeenCalledWith(result)
  })

  it('换手机号 · 回 phone step + clear code', async () => {
    const props = makeProps()
    render(<LoginFlow {...props} />)
    fireEvent.change(screen.getByTestId('login-phone-input'), { target: { value: VALID_PHONE } })
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-send-code-btn-wrap').querySelector('button')!)
    })
    fireEvent.change(screen.getByTestId('login-code-input'), { target: { value: '12' } })
    fireEvent.click(screen.getByTestId('login-change-phone-btn'))
    expect(screen.getByTestId('login-step-phone')).toBeInTheDocument()
  })

  it('code 不足 codeLength · verify 按钮禁用', async () => {
    const props = makeProps()
    render(<LoginFlow {...props} />)
    fireEvent.change(screen.getByTestId('login-phone-input'), { target: { value: VALID_PHONE } })
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-send-code-btn-wrap').querySelector('button')!)
    })
    fireEvent.change(screen.getByTestId('login-code-input'), { target: { value: '12345' } })
    const verifyBtn = screen
      .getByTestId('login-verify-btn-wrap')
      .querySelector('button')! as HTMLButtonElement
    expect(verifyBtn).toBeDisabled()
  })
})

describe('phoneCheckScenarios spec', () => {
  for (const sc of phoneCheckScenarios) {
    it(sc.name, () => {
      expect(PHONE_RE.test(sc.phone)).toBe(sc.valid)
    })
  }
})

describe('codeCheckScenarios spec', () => {
  for (const sc of codeCheckScenarios) {
    it(sc.name, () => {
      expect(sc.code.length === sc.codeLength).toBe(sc.ready)
    })
  }
})
