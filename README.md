# @aily-ui/auth-login

> ← 回 [aily-ui design system](https://yarnovo.github.io/aily-ui-core/) 总站

aily-ui AuthLogin · 真 unified login UI · 真支持 6 provider:

- **password-based 3 个** (tab 切): `phone-sms` · `email-password` · `username-password`
- **OAuth 3 个** (button row): `oauth-google` · `oauth-wechat` · `oauth-qq`

跨端 (Web + React Native · phone-sms tab) · 真按 `providers` props enable list 真显隐 · 真接口适配通过 props 注入 (组件不写死 endpoint)。

## 安装

```bash
npm i github:yarnovo/aily-ui-auth-login github:yarnovo/aily-ui-tokens github:yarnovo/aily-ui-button
```

## 用法 · 6 provider 全 enable

```tsx
import { LoginFlow } from '@aily-ui/auth-login'
import '@aily-ui/auth-login/style.css'
import '@aily-ui/button/style.css'
import '@aily-ui/tokens/style.css'

<LoginFlow
  title="阿空登录"
  subtitle="接入小喜 · 大喜 · 任意 agent"
  providers={[
    'phone-sms',
    'email-password',
    'username-password',
    'oauth-google',
    'oauth-wechat',
    'oauth-qq',
  ]}

  // phone-sms (真 backwards-compat default)
  onSendCode={async (phone) => {
    const r = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    return r.json()  // { ok, debug_code }
  }}
  onVerifyCode={async (phone, code) => {
    const r = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    })
    return r.json()
  }}

  // email-password
  onEmailLogin={async (email, password) => {
    const r = await fetch('/api/auth/email-login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return r.json()
  }}
  onEmailRegister={async (email, password, phone, smsCode) => { /* ... */ }}
  onEmailReset={async (email, smsCode, newPassword) => { /* ... */ }}

  // username-password
  onUsernameLogin={async (username, password) => { /* ... */ }}
  onUsernameRegister={async (username, password, phone, smsCode) => { /* ... */ }}
  onUsernameReset={async (username, smsCode, newPassword) => { /* ... */ }}

  // OAuth (调用方自处理 redirect 到 OAuth url)
  onOAuthLogin={(provider) => {
    window.location.href = `/api/auth/oauth/${provider}/start`
  }}

  // unified login UI · 登完 redirect 回原 origin
  redirectAfterLogin="https://app.example.com/callback?token=xxx"

  onSuccess={(auth) => {
    localStorage.setItem('jwt', auth.jwt)
    nav('/chat')
  }}
  onError={(msg) => toast.error(msg)}
/>
```

## backwards-compat · 真旧 caller 不破

旧 caller (channel-h5 · platform-auth/app · akong-hr) 真无需改:

```tsx
<LoginFlow
  title="小喜"
  subtitle="找你的人"
  // providers 真未传 · default ['phone-sms']
  onSendCode={...}
  onVerifyCode={...}
  onSuccess={...}
/>
```

## React Native (phone-sms tab only)

```tsx
import { LoginFlow } from '@aily-ui/auth-login'

<LoginFlow
  title="小喜"
  onSendCode={...}
  onVerifyCode={...}
  onSuccess={...}
/>
```

Metro bundler 自动按 `.native.tsx` 后缀解析 RN 端 · `.tsx` 解析 Web 端。

## 单独使用 sub-components

```tsx
import {
  PhoneSmsTab,
  EmailPasswordTab,
  UsernamePasswordTab,
  GoogleButton,
  WechatButton,
  QQButton,
  PasswordInput,
  SmsCodeInput,
  ProviderDivider,
  PHONE_RE,
} from '@aily-ui/auth-login'
```

## API · LoginFlowProps

| Prop | Type | Default | 说明 |
|---|---|---|---|
| `title` | `string` | — | 大标题 |
| `subtitle` | `string` | — | 副标题 |
| `providers` | `Provider[]` | `['phone-sms']` | enable list (真按顺序显示) |
| `onSendCode` | `(phone) => Promise<{ok?, debug_code?}>` | — | phone-sms · 发验证码 |
| `onVerifyCode` | `(phone, code) => Promise<unknown>` | — | phone-sms · 验证码登录 |
| `onEmailLogin` | `(email, password) => Promise<unknown>` | — | email-password · 登录 |
| `onEmailRegister` | `(email, password, phone, smsCode) => Promise<unknown>` | — | email-password · 注册 |
| `onEmailReset` | `(email, smsCode, newPassword) => Promise<unknown>` | — | email-password · 重置 |
| `onUsernameLogin` | `(username, password) => Promise<unknown>` | — | username-password · 登录 |
| `onUsernameRegister` | `(username, password, phone, smsCode) => Promise<unknown>` | — | username-password · 注册 |
| `onUsernameReset` | `(username, smsCode, newPassword) => Promise<unknown>` | — | username-password · 重置 |
| `onOAuthLogin` | `(provider: 'google' \| 'wechat' \| 'qq') => void` | — | OAuth · 调用方真 redirect |
| `redirectAfterLogin` | `string` | — | 登完 redirect url · setTimeout 0 真 forward |
| `onSuccess` | `(auth) => void` | — | 登录成功回调 · 拿原始返回 |
| `onError` | `(msg) => void` | window.alert | error 通知 |
| `onDebugCode` | `(code) => void` | window.alert | debug 模式 SMS 自测 |
| `resendSeconds` | `number` | 60 | 重发倒计时秒数 |
| `codeLength` | `number` | 6 | 验证码长度 |
| `className` | `string` | — | 外层 className |

## Provider 类型

```ts
type Provider =
  | 'phone-sms'
  | 'email-password'
  | 'username-password'
  | 'oauth-google'
  | 'oauth-wechat'
  | 'oauth-qq'
```

## 行为

- **password-based tabs (≥ 2 个)**: 真渲 tab 切 · 1 个时不渲 tab (直接显)
- **email/username register/reset**: 真带 phone + SMS 二次验证 (复用 `onSendCode`)
- **OAuth**: 真触发 `onOAuthLogin(provider)` · 调用方自 redirect 到 OAuth url
- **redirectAfterLogin**: `onSuccess` 后真 setTimeout 0 redirect (让 setState 真 flush)
- **手机号校验**: `^1[3-9]\d{9}$`
- **邮箱校验**: 简单 RFC (`@` 拆 + 必有 `.`)
- **用户名校验**: `^[a-zA-Z0-9_-]{3,32}$`
- **密码最小**: 6 位
- **数字过滤**: phone / code input 自动过滤非数字
- **a11y**: 全 `data-testid` · `role=tablist` · `aria-selected` · `aria-label`

## 设计原则

- **接口适配通过 props 注入**: 组件不写死 endpoint
- **目录即架构**: `tabs/` (3 password tab) + `oauth/` (3 OAuth button) + `shared/` (PasswordInput / SmsCodeInput / ProviderDivider)
- **token 100% 接 @aily-ui/tokens**: 改一处 token 自动 update
- **复用 @aily-ui/button**: 主提交按钮真 `<Button fullWidth>` · OAuth 按钮自带样式
- **backwards-compat**: 真旧 caller `providers` 不传 = default `['phone-sms']` 真不破

## 视觉

- 全屏深底 · 居中 · top padding 5rem · max-width 24rem
- title 36px / 600 · subtitle 14px / fg-secondary
- input: bg-elevated · border + focus:accent · radius md · 44px 高
- tab: 2px 底边 · active accent 色
- OAuth button: 44px 高 · 真自带品牌图标 (Google 4 色 / 微信绿 / QQ 蓝)
- divider: "其他登录方式" 文字 + 两侧细线

## 测试

```bash
npm test          # vitest · 33 case
npm run typecheck # tsc --noEmit
```

≥ 33 cases · 6 provider × 真 cover (login + register + reset + click + 显隐)。

## demo

https://yarnovo.github.io/aily-ui-auth-login/
