export interface WechatButtonProps {
  onClick: () => void
  disabled?: boolean
}

/** 微信 OAuth 按钮 · 真扫码登录 (调用方处理 url 跳转) */
export function WechatButton(props: WechatButtonProps) {
  const { onClick, disabled = false } = props
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="ak-login-flow__oauth-btn ak-login-flow__oauth-btn--wechat"
      data-testid="login-oauth-wechat-btn"
      aria-label="微信登录"
    >
      <svg
        className="ak-login-flow__oauth-icon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
      >
        <path
          fill="#07C160"
          d="M8.69 4C4.99 4 2 6.49 2 9.55c0 1.69.93 3.18 2.42 4.21l-.6 1.79 2.13-1.07c.78.18 1.4.27 2.27.27.18 0 .35 0 .51-.02-.11-.34-.17-.7-.17-1.07 0-2.71 2.62-4.91 5.86-4.91h.32C13.43 5.79 11.31 4 8.69 4zm-2.18 1.7c.45 0 .82.36.82.82 0 .45-.36.82-.82.82a.82.82 0 010-1.64zm4.36 0c.45 0 .82.36.82.82 0 .45-.36.82-.82.82a.82.82 0 010-1.64z"
        />
        <path
          fill="#07C160"
          d="M22 14.84c0-2.61-2.62-4.74-5.85-4.74-3.43 0-6.13 2.13-6.13 4.74 0 2.62 2.7 4.74 6.13 4.74.71 0 1.43-.18 2.14-.36l1.96 1.07-.54-1.78c1.43-1.07 2.29-2.41 2.29-3.67zm-7.74-1.34a.7.7 0 110-1.4.7.7 0 010 1.4zm4.01 0a.7.7 0 110-1.4.7.7 0 010 1.4z"
        />
      </svg>
      <span>微信</span>
    </button>
  )
}

export default WechatButton
