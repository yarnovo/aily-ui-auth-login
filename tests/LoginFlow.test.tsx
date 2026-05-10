/**
 * LoginFlow 真 6 provider 真 cover · vitest + @testing-library/react
 *
 * 真覆盖:
 * - phone-sms · sendCode + verifyCode flow + debug_code
 * - email-password · login + register + reset
 * - username-password · login + register + reset
 * - oauth-google · onOAuthLogin('google') 触发
 * - oauth-wechat · onOAuthLogin('wechat') 触发
 * - oauth-qq · onOAuthLogin('qq') 触发
 * - providers props · 真按 list 真显隐
 * - redirectAfterLogin · 真 forward
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { LoginFlow } from '../src/LoginFlow'
import type { Provider } from '../src/types'
import {
  phoneCheckScenarios,
  codeCheckScenarios,
  PHONE_RE,
} from '../src/LoginFlow.behavior'

const VALID_PHONE = '13800138000'
const VALID_EMAIL = 'a@b.com'
const VALID_USERNAME = 'alice_01'

function makeProps(overrides: Partial<Parameters<typeof LoginFlow>[0]> = {}) {
  return {
    title: '小喜',
    subtitle: '找你的人',
    providers: ['phone-sms'] as Provider[],
    onSendCode: vi.fn(async () => ({ ok: true, debug_code: null })),
    onVerifyCode: vi.fn(async () => ({ jwt: 'tok', user: { id: 'u1' } })),
    onEmailLogin: vi.fn(async () => ({ jwt: 'tok-email' })),
    onEmailRegister: vi.fn(async () => ({ jwt: 'tok-email-reg' })),
    onEmailReset: vi.fn(async () => ({ ok: true })),
    onUsernameLogin: vi.fn(async () => ({ jwt: 'tok-username' })),
    onUsernameRegister: vi.fn(async () => ({ jwt: 'tok-username-reg' })),
    onUsernameReset: vi.fn(async () => ({ ok: true })),
    onOAuthLogin: vi.fn(),
    onSuccess: vi.fn(),
    onError: vi.fn(),
    onDebugCode: vi.fn(),
    ...overrides,
  }
}

// ==================== phone-sms ====================
describe('LoginFlow · phone-sms (default · backwards-compat)', () => {
  it('default providers=[phone-sms] · 真渲 phone input', () => {
    render(<LoginFlow {...makeProps({ providers: undefined })} />)
    expect(screen.getByTestId('login-step-phone')).toBeInTheDocument()
    expect(screen.getByTestId('login-phone-input')).toBeInTheDocument()
  })

  it('phone input 仅保留数字', () => {
    render(<LoginFlow {...makeProps()} />)
    const input = screen.getByTestId('login-phone-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'a1b2c3' } })
    expect(input.value).toBe('123')
  })

  it('phone 不合法 disable send 按钮', () => {
    const props = makeProps()
    render(<LoginFlow {...props} />)
    const input = screen.getByTestId('login-phone-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: '123' } })
    const btn = screen.getByTestId('login-send-code-btn-wrap').querySelector('button')!
    expect(btn).toBeDisabled()
  })

  it('sendCode 触发 · 切到 code step', async () => {
    const props = makeProps()
    render(<LoginFlow {...props} />)
    fireEvent.change(screen.getByTestId('login-phone-input'), { target: { value: VALID_PHONE } })
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-send-code-btn-wrap').querySelector('button')!)
    })
    expect(props.onSendCode).toHaveBeenCalledWith(VALID_PHONE)
    expect(screen.getByTestId('login-step-code')).toBeInTheDocument()
  })

  it('sendCode 返 debug_code · 调 onDebugCode', async () => {
    const props = makeProps({
      onSendCode: vi.fn(async () => ({ ok: true, debug_code: '888888' })),
    })
    render(<LoginFlow {...props} />)
    fireEvent.change(screen.getByTestId('login-phone-input'), { target: { value: VALID_PHONE } })
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-send-code-btn-wrap').querySelector('button')!)
    })
    expect(props.onDebugCode).toHaveBeenCalledWith('888888')
  })

  it('verifyCode 成功 · 调 onSuccess 透传返回', async () => {
    const result = { jwt: 'tok-xyz' }
    const props = makeProps({ onVerifyCode: vi.fn(async () => result) })
    render(<LoginFlow {...props} />)
    fireEvent.change(screen.getByTestId('login-phone-input'), { target: { value: VALID_PHONE } })
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-send-code-btn-wrap').querySelector('button')!)
    })
    fireEvent.change(screen.getByTestId('login-code-input'), { target: { value: '123456' } })
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-verify-btn-wrap').querySelector('button')!)
    })
    expect(props.onVerifyCode).toHaveBeenCalledWith(VALID_PHONE, '123456')
    expect(props.onSuccess).toHaveBeenCalledWith(result)
  })
})

// ==================== email-password ====================
describe('LoginFlow · email-password', () => {
  it('login mode · onEmailLogin 触发', async () => {
    const props = makeProps({ providers: ['email-password'] })
    render(<LoginFlow {...props} />)
    fireEvent.change(screen.getByTestId('login-email-input'), { target: { value: VALID_EMAIL } })
    fireEvent.change(screen.getByTestId('login-email-password-input'), {
      target: { value: 'secret123' },
    })
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-email-submit-btn-wrap').querySelector('button')!)
    })
    expect(props.onEmailLogin).toHaveBeenCalledWith(VALID_EMAIL, 'secret123')
    expect(props.onSuccess).toHaveBeenCalledWith({ jwt: 'tok-email' })
  })

  it('register mode · onEmailRegister 触发 · 真带 phone + sms', async () => {
    const props = makeProps({ providers: ['email-password'] })
    render(<LoginFlow {...props} />)
    // 切到 register
    fireEvent.click(screen.getByTestId('login-email-toggle-register-btn'))
    fireEvent.change(screen.getByTestId('login-email-input'), { target: { value: VALID_EMAIL } })
    fireEvent.change(screen.getByTestId('login-email-password-input'), {
      target: { value: 'secret123' },
    })
    fireEvent.change(screen.getByTestId('login-email-phone-input'), {
      target: { value: VALID_PHONE },
    })
    fireEvent.change(screen.getByTestId('login-email-sms-input'), { target: { value: '654321' } })
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-email-submit-btn-wrap').querySelector('button')!)
    })
    expect(props.onEmailRegister).toHaveBeenCalledWith(
      VALID_EMAIL,
      'secret123',
      VALID_PHONE,
      '654321',
    )
  })

  it('reset mode · onEmailReset 触发 · 真带 sms + new password', async () => {
    const props = makeProps({ providers: ['email-password'] })
    render(<LoginFlow {...props} />)
    // 切到 reset
    fireEvent.click(screen.getByTestId('login-email-toggle-reset-btn'))
    fireEvent.change(screen.getByTestId('login-email-input'), { target: { value: VALID_EMAIL } })
    fireEvent.change(screen.getByTestId('login-email-phone-input'), {
      target: { value: VALID_PHONE },
    })
    fireEvent.change(screen.getByTestId('login-email-sms-input'), { target: { value: '654321' } })
    fireEvent.change(screen.getByTestId('login-email-newpassword-input'), {
      target: { value: 'newsecret123' },
    })
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-email-submit-btn-wrap').querySelector('button')!)
    })
    expect(props.onEmailReset).toHaveBeenCalledWith(VALID_EMAIL, '654321', 'newsecret123')
  })
})

// ==================== username-password ====================
describe('LoginFlow · username-password', () => {
  it('login mode · onUsernameLogin 触发', async () => {
    const props = makeProps({ providers: ['username-password'] })
    render(<LoginFlow {...props} />)
    fireEvent.change(screen.getByTestId('login-username-input'), {
      target: { value: VALID_USERNAME },
    })
    fireEvent.change(screen.getByTestId('login-username-password-input'), {
      target: { value: 'secret123' },
    })
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-username-submit-btn-wrap').querySelector('button')!)
    })
    expect(props.onUsernameLogin).toHaveBeenCalledWith(VALID_USERNAME, 'secret123')
  })

  it('register mode · onUsernameRegister 触发', async () => {
    const props = makeProps({ providers: ['username-password'] })
    render(<LoginFlow {...props} />)
    fireEvent.click(screen.getByTestId('login-username-toggle-register-btn'))
    fireEvent.change(screen.getByTestId('login-username-input'), {
      target: { value: VALID_USERNAME },
    })
    fireEvent.change(screen.getByTestId('login-username-password-input'), {
      target: { value: 'secret123' },
    })
    fireEvent.change(screen.getByTestId('login-username-phone-input'), {
      target: { value: VALID_PHONE },
    })
    fireEvent.change(screen.getByTestId('login-username-sms-input'), {
      target: { value: '654321' },
    })
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-username-submit-btn-wrap').querySelector('button')!)
    })
    expect(props.onUsernameRegister).toHaveBeenCalledWith(
      VALID_USERNAME,
      'secret123',
      VALID_PHONE,
      '654321',
    )
  })

  it('reset mode · onUsernameReset 触发', async () => {
    const props = makeProps({ providers: ['username-password'] })
    render(<LoginFlow {...props} />)
    fireEvent.click(screen.getByTestId('login-username-toggle-reset-btn'))
    fireEvent.change(screen.getByTestId('login-username-input'), {
      target: { value: VALID_USERNAME },
    })
    fireEvent.change(screen.getByTestId('login-username-phone-input'), {
      target: { value: VALID_PHONE },
    })
    fireEvent.change(screen.getByTestId('login-username-sms-input'), {
      target: { value: '654321' },
    })
    fireEvent.change(screen.getByTestId('login-username-newpassword-input'), {
      target: { value: 'newsecret123' },
    })
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-username-submit-btn-wrap').querySelector('button')!)
    })
    expect(props.onUsernameReset).toHaveBeenCalledWith(VALID_USERNAME, '654321', 'newsecret123')
  })
})

// ==================== oauth-* ====================
describe('LoginFlow · oauth-*', () => {
  it('oauth-google · click 触发 onOAuthLogin("google")', () => {
    const props = makeProps({ providers: ['phone-sms', 'oauth-google'] })
    render(<LoginFlow {...props} />)
    fireEvent.click(screen.getByTestId('login-oauth-google-btn'))
    expect(props.onOAuthLogin).toHaveBeenCalledWith('google')
  })

  it('oauth-wechat · click 触发 onOAuthLogin("wechat")', () => {
    const props = makeProps({ providers: ['oauth-wechat'] })
    render(<LoginFlow {...props} />)
    fireEvent.click(screen.getByTestId('login-oauth-wechat-btn'))
    expect(props.onOAuthLogin).toHaveBeenCalledWith('wechat')
  })

  it('oauth-qq · click 触发 onOAuthLogin("qq")', () => {
    const props = makeProps({ providers: ['oauth-qq'] })
    render(<LoginFlow {...props} />)
    fireEvent.click(screen.getByTestId('login-oauth-qq-btn'))
    expect(props.onOAuthLogin).toHaveBeenCalledWith('qq')
  })
})

// ==================== providers props 真显隐 ====================
describe('LoginFlow · providers props', () => {
  it('全 6 enable · tabs 3 个 + oauth row 3 个', () => {
    const props = makeProps({
      providers: [
        'phone-sms',
        'email-password',
        'username-password',
        'oauth-google',
        'oauth-wechat',
        'oauth-qq',
      ],
    })
    render(<LoginFlow {...props} />)
    expect(screen.getByTestId('login-tab-phone-sms')).toBeInTheDocument()
    expect(screen.getByTestId('login-tab-email-password')).toBeInTheDocument()
    expect(screen.getByTestId('login-tab-username-password')).toBeInTheDocument()
    expect(screen.getByTestId('login-oauth-google-btn')).toBeInTheDocument()
    expect(screen.getByTestId('login-oauth-wechat-btn')).toBeInTheDocument()
    expect(screen.getByTestId('login-oauth-qq-btn')).toBeInTheDocument()
  })

  it('单 phone-sms · 不渲 tabs (只 1 个 tab 时不显)', () => {
    render(<LoginFlow {...makeProps()} />)
    expect(screen.queryByTestId('login-tabs')).not.toBeInTheDocument()
  })

  it('只 oauth · 不渲 password tabs · 也不渲 divider', () => {
    const props = makeProps({ providers: ['oauth-google'] })
    render(<LoginFlow {...props} />)
    expect(screen.queryByTestId('login-step-phone')).not.toBeInTheDocument()
    expect(screen.queryByTestId('login-divider')).not.toBeInTheDocument()
    expect(screen.getByTestId('login-oauth-google-btn')).toBeInTheDocument()
  })

  it('tab 切换 · phone-sms ↔ email-password', () => {
    const props = makeProps({ providers: ['phone-sms', 'email-password'] })
    render(<LoginFlow {...props} />)
    expect(screen.getByTestId('login-step-phone')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('login-tab-email-password'))
    expect(screen.getByTestId('login-step-email-password')).toBeInTheDocument()
    expect(screen.queryByTestId('login-step-phone')).not.toBeInTheDocument()
  })
})

// ==================== redirectAfterLogin ====================
describe('LoginFlow · redirectAfterLogin', () => {
  it('真 forward · onSuccess 后真 redirect', async () => {
    // mock window.location.href setter
    const origLocation = window.location
    delete (window as unknown as { location?: Location }).location
    ;(window as unknown as { location: { href: string } }).location = { href: '' }

    const props = makeProps({
      providers: ['email-password'],
      redirectAfterLogin: 'https://example.com/callback?token=x',
    })
    render(<LoginFlow {...props} />)
    fireEvent.change(screen.getByTestId('login-email-input'), { target: { value: VALID_EMAIL } })
    fireEvent.change(screen.getByTestId('login-email-password-input'), {
      target: { value: 'secret123' },
    })
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-email-submit-btn-wrap').querySelector('button')!)
    })
    // setTimeout 0 真 flush
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(window.location.href).toBe('https://example.com/callback?token=x')

    // restore
    ;(window as unknown as { location: Location }).location = origLocation
  })
})

// ==================== shared spec ====================
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
