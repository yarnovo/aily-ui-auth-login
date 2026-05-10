export interface GoogleButtonProps {
  onClick: () => void
  disabled?: boolean
}

/** Google OAuth 按钮 · 真 redirect 到 Google OAuth url (调用方处理) */
export function GoogleButton(props: GoogleButtonProps) {
  const { onClick, disabled = false } = props
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="ak-login-flow__oauth-btn"
      data-testid="login-oauth-google-btn"
      aria-label="Google 登录"
    >
      <svg
        className="ak-login-flow__oauth-icon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0012 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.99 10.99 0 001 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        />
      </svg>
      <span>Google</span>
    </button>
  )
}

export default GoogleButton
