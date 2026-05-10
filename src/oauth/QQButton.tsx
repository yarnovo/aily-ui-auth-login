export interface QQButtonProps {
  onClick: () => void
  disabled?: boolean
}

/** QQ OAuth 按钮 · 真 redirect 到 QQ OAuth url (调用方处理) */
export function QQButton(props: QQButtonProps) {
  const { onClick, disabled = false } = props
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="ak-login-flow__oauth-btn ak-login-flow__oauth-btn--qq"
      data-testid="login-oauth-qq-btn"
      aria-label="QQ 登录"
    >
      <svg
        className="ak-login-flow__oauth-icon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
      >
        <path
          fill="#1296DB"
          d="M12 2C8.5 2 5.7 4.6 5.5 8c-.1.5-.1 1-.1 1.5 0 1.6.5 3.1 1.4 4.3-.3.4-.7.9-1 1.4-.6.9-.9 1.6-.7 1.9.2.3 1 .2 1.7-.1.5-.2 1-.5 1.5-.8.3.2.7.4 1 .5-.6.6-1.1 1.4-1.1 2 0 .9 1.4 1.7 3.7 1.7s3.7-.8 3.7-1.7c0-.6-.5-1.4-1.1-2 .4-.1.7-.3 1-.5.5.3 1 .6 1.5.8.7.3 1.5.4 1.7.1.2-.3-.1-1-.7-1.9-.3-.5-.7-1-1-1.4.9-1.2 1.4-2.7 1.4-4.3 0-.5 0-1-.1-1.5C18.3 4.6 15.5 2 12 2z"
        />
      </svg>
      <span>QQ</span>
    </button>
  )
}

export default QQButton
