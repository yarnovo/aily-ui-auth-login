export interface ProviderDividerProps {
  label?: string
}

/** 真"其他登录方式" 分隔线 · 真 password-based tab + oauth row 真之间 */
export function ProviderDivider(props: ProviderDividerProps) {
  const { label = '其他登录方式' } = props
  return (
    <div className="ak-login-flow__divider" data-testid="login-divider">
      <span className="ak-login-flow__divider-label">{label}</span>
    </div>
  )
}

export default ProviderDivider
