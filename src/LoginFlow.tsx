import { useMemo, useState } from 'react'
import type { LoginFlowProps, Provider, OAuthProvider } from './types'
import { PhoneSmsTab } from './tabs/PhoneSmsTab'
import { EmailPasswordTab } from './tabs/EmailPasswordTab'
import { UsernamePasswordTab } from './tabs/UsernamePasswordTab'
import { GoogleButton } from './oauth/GoogleButton'
import { WechatButton } from './oauth/WechatButton'
import { QQButton } from './oauth/QQButton'
import { ProviderDivider } from './shared/ProviderDivider'
import './LoginFlow.css'

/** 真分类 provider · password-based 真 tab · oauth 真 button row */
type ActiveTab = 'phone-sms' | 'email-password' | 'username-password'

const TAB_LABELS: Record<ActiveTab, string> = {
  'phone-sms': '手机号',
  'email-password': '邮箱',
  'username-password': '用户名',
}

const PASSWORD_TABS: ActiveTab[] = ['phone-sms', 'email-password', 'username-password']

/** akong AuthLogin · LoginFlow · Web · 真支持 6 provider
 *
 * default providers=['phone-sms'] · 真 backwards-compat (旧 caller 真不破)
 *
 * password-based 3 个 (phone-sms / email-password / username-password) 真 tab 真切
 * oauth-* 3 个 真"其他登录方式" 真 button row
 *
 * 接口适配通过 props 注入 · 组件不写死 endpoint。
 */
export function LoginFlow(props: LoginFlowProps) {
  const {
    title,
    subtitle,
    providers = ['phone-sms'],
    onSendCode,
    onVerifyCode,
    onEmailLogin,
    onEmailRegister,
    onEmailReset,
    onUsernameLogin,
    onUsernameRegister,
    onUsernameReset,
    onOAuthLogin,
    onSuccess,
    onError,
    onDebugCode,
    redirectAfterLogin,
    resendSeconds = 60,
    codeLength = 6,
    className,
  } = props

  // 真按 providers list 过滤 password-based tabs · 真按声明顺序保持
  const passwordTabs = useMemo(
    () => providers.filter((p): p is ActiveTab => PASSWORD_TABS.includes(p as ActiveTab)),
    [providers],
  )

  // OAuth 真子 list (真按声明顺序)
  const oauthProviders = useMemo(() => {
    const list: OAuthProvider[] = []
    for (const p of providers) {
      if (p === 'oauth-google') list.push('google')
      else if (p === 'oauth-wechat') list.push('wechat')
      else if (p === 'oauth-qq') list.push('qq')
    }
    return list
  }, [providers])

  const [activeTab, setActiveTab] = useState<ActiveTab>(passwordTabs[0] ?? 'phone-sms')

  const reportError = (msg: string) => {
    if (onError) onError(msg)
    else if (typeof window !== 'undefined') window.alert(msg)
  }

  const reportDebugCode = (c: string) => {
    if (onDebugCode) onDebugCode(c)
    else if (typeof window !== 'undefined') {
      window.alert(`debug 模式 · 验证码: ${c}\n(prod 切真 SMS 后此 alert 不弹)`)
    }
  }

  // 真 redirect after login · onSuccess wrapper
  const handleSuccess = (auth: unknown) => {
    onSuccess(auth)
    if (redirectAfterLogin && typeof window !== 'undefined') {
      // 真调用方真处理 token 存储后真跳转
      // (真 setTimeout 0 真让 onSuccess 同步 setState 完成 · 真避免 React batch 漏)
      setTimeout(() => {
        window.location.href = redirectAfterLogin
      }, 0)
    }
  }

  // 真 noop · 真 oauth-* 真 click 时真触发 (真调用方真 redirect 到 OAuth url)
  const handleOAuth = (p: OAuthProvider) => {
    if (onOAuthLogin) onOAuthLogin(p)
    else reportError(`未配置 OAuth 登录回调 (${p})`)
  }

  return (
    <div
      className={['ak-login-flow', className].filter(Boolean).join(' ')}
      data-testid="login-page"
    >
      <div className="ak-login-flow__header">
        <h1 className="ak-login-flow__title" data-testid="login-logo">
          {title}
        </h1>
        {subtitle && (
          <p className="ak-login-flow__subtitle" data-testid="login-subtitle">
            {subtitle}
          </p>
        )}
      </div>

      {/* password-based tabs */}
      {passwordTabs.length > 1 && (
        <div className="ak-login-flow__tabs" data-testid="login-tabs" role="tablist">
          {passwordTabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={activeTab === t}
              className={[
                'ak-login-flow__tab',
                activeTab === t && 'ak-login-flow__tab--active',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setActiveTab(t)}
              data-testid={`login-tab-${t}`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      )}

      {/* active tab body */}
      {activeTab === 'phone-sms' && passwordTabs.includes('phone-sms') && onSendCode && onVerifyCode && (
        <PhoneSmsTab
          onSendCode={onSendCode}
          onVerifyCode={onVerifyCode}
          onSuccess={handleSuccess}
          onError={reportError}
          onDebugCode={reportDebugCode}
          resendSeconds={resendSeconds}
          codeLength={codeLength}
        />
      )}

      {activeTab === 'email-password' &&
        passwordTabs.includes('email-password') &&
        onEmailLogin && (
          <EmailPasswordTab
            onLogin={onEmailLogin}
            onRegister={onEmailRegister}
            onReset={onEmailReset}
            onSendCode={onSendCode}
            onSuccess={handleSuccess}
            onError={reportError}
            onDebugCode={reportDebugCode}
            resendSeconds={resendSeconds}
            codeLength={codeLength}
          />
        )}

      {activeTab === 'username-password' &&
        passwordTabs.includes('username-password') &&
        onUsernameLogin && (
          <UsernamePasswordTab
            onLogin={onUsernameLogin}
            onRegister={onUsernameRegister}
            onReset={onUsernameReset}
            onSendCode={onSendCode}
            onSuccess={handleSuccess}
            onError={reportError}
            onDebugCode={reportDebugCode}
            resendSeconds={resendSeconds}
            codeLength={codeLength}
          />
        )}

      {/* OAuth row */}
      {oauthProviders.length > 0 && (
        <>
          {passwordTabs.length > 0 && <ProviderDivider />}
          <div className="ak-login-flow__oauth-row" data-testid="login-oauth-row">
            {oauthProviders.includes('google') && (
              <GoogleButton onClick={() => handleOAuth('google')} />
            )}
            {oauthProviders.includes('wechat') && (
              <WechatButton onClick={() => handleOAuth('wechat')} />
            )}
            {oauthProviders.includes('qq') && (
              <QQButton onClick={() => handleOAuth('qq')} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

// re-export sub components
export { PhoneSmsTab, EmailPasswordTab, UsernamePasswordTab }
export { GoogleButton, WechatButton, QQButton }
export { PasswordInput } from './shared/PasswordInput'
export { SmsCodeInput } from './shared/SmsCodeInput'
export { ProviderDivider } from './shared/ProviderDivider'

export default LoginFlow

// re-export 旧 step components (真 backwards-compat · 真旧 caller 自拼 wizard 真不破)
export { PhoneInputStep } from './PhoneInputStep'
export { OtpInputStep } from './OtpInputStep'

export type { Provider, OAuthProvider } from './types'
