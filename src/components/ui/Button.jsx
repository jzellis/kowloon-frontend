// Button — base button component.
// Enforces sharp corners, theme tokens, and consistent sizing.
// Props: variant (primary | secondary | accent | ghost), size (sm | md | lg),
//        disabled, onClick, type, children

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  children,
  className = '',
}) {
  const variants = {
    primary:   'bg-primary text-primary-content hover:opacity-90',
    secondary: 'bg-secondary text-secondary-content hover:opacity-90',
    accent:    'bg-accent text-accent-content hover:opacity-90',
    ghost:     'bg-transparent text-base-content hover:bg-base-200',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]} ${sizes[size]}
        font-ui uppercase tracking-widest transition-opacity
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  )
}
