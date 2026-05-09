# @aily-ui/auth-login

> ← 回 [akong design system](https://yarnovo.github.io/aily-ui-core/) 总站

akong AuthLogin · 手机号 + OTP 2 步登录 wizard · 跨端 (Web + React Native)

## 安装

```bash
npm i github:yarnovo/aily-ui-auth-login github:yarnovo/aily-ui-tokens github:yarnovo/aily-ui-button
```

## Web

```tsx
import { LoginFlow } from '@aily-ui/auth-login'
import '@aily-ui/auth-login/style.css'
import '@aily-ui/button/style.css'
import '@aily-ui/tokens/style.css'  // 顶层引一次 token

<LoginFlow
  title="小喜"
  subtitle="找你的人"
  sendCode={async (phone) => {
    const r = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    return r.json()  // { ok, debug_code }
  }}
  verifyCode={async (phone, code) => {
    const r = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    })
    return r.json()  // 调用方自定 shape · 透传给 onSuccess
  }}
  onSuccess={(auth) => {
    localStorage.setItem('jwt', auth.jwt)
    nav('/chat')
  }}
  onError={(msg) => toast.error(msg)}
/>
```

## React Native

```tsx
import { LoginFlow } from '@aily-ui/auth-login'

<LoginFlow
  title="小喜"
  sendCode={...}
  verifyCode={...}
  onSuccess={...}
/>
```

Metro bundler 自动按 `.native.tsx` 后缀解析 · 同 `import` 路径两端通用。

## 单独使用 PhoneInputStep / OtpInputStep

```tsx
import { PhoneInputStep, OtpInputStep, PHONE_RE } from '@aily-ui/auth-login'

// 自己拼 wizard / 自己管 step state
```

## API

| Prop | Type | Default | 说明 |
|---|---|---|---|
| title | string | — | 大标题 · 例 "小喜" |
| subtitle | string | — | 副标题 · 例 "找你的人" |
| sendCode | `(phone) => Promise<{ok?, debug_code?}>` | — | 发验证码 · 调用方实现 |
| verifyCode | `(phone, code) => Promise<unknown>` | — | 验证码登录 · 返回值透传 onSuccess |
| onSuccess | `(auth) => void` | — | 登录成功回调 · 拿 verifyCode 原始返回 |
| onError | `(msg) => void` | window.alert | error 通知 · 调用方接 toast |
| onDebugCode | `(code) => void` | window.alert | debug 模式 · sendCode 返 debug_code 时调用 |
| resendSeconds | number | 60 | 重发倒计时秒数 |
| codeLength | number | 6 | 验证码长度 |
| className | string | — | 外层 className · 包到 ak-login-flow 根 |

## 行为

- **2 步 wizard** · phone → code · 自动切 step
- **手机号校验** · `^1[3-9]\d{9}$` · 不合法 disable 发送
- **倒计时** · 发送成功后 60s 倒计时禁用重发按钮
- **debug 模式** · sendCode 返 `debug_code` 时调 onDebugCode 让自测 (本地 dev / staging)
- **换手机号** · code step 一键回 phone step + clear code
- **数字过滤** · phone 跟 code input 自动过滤非数字字符
- **a11y** · 全 data-testid · maxLength + inputMode='numeric' + autoFocus

## 设计原则

- **接口适配通过 props 注入**：组件不写死 endpoint · 调用方自实现 fetch
- **一份 props**：Web 跟 RN 共享 `LoginFlow.types.ts`
- **两端实现**：`LoginFlow.tsx` (Web · `<input>` + `<button>`) + `LoginFlow.native.tsx` (RN · `KeyboardAvoidingView` + `TextInput` + `Pressable`)
- **token 100% 接 @aily-ui/tokens**：改一处 token 自动 update
- **复用 @aily-ui/button**：发送 / 登录按钮直接用现有 Button 组件

## 视觉

- 全屏深底 · 居中 · top padding 5rem · max-width 24rem
- title 36px / 600 · subtitle 14px / fg-secondary
- input: bg-elevated · border + focus:accent · radius md · 44px 高
- send / verify button: 通过 `<Button fullWidth>` (akong 主按钮风格)
- 换手机号 / 重发: 14px / fg-secondary · hover fg

## 测试

```bash
npm test
npm run typecheck
```

≥ 12 cases · 覆盖：phone 校验 / code 长度 / sendCode / verifyCode / debug_code / 换手机号 / 共享 spec。
