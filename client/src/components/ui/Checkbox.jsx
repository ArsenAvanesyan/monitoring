// Простой компонент чекбокса
const Checkbox = ({ checked, onChange, className = '', color = 'primary', rounded = 'md', width, height, indeterminate, ...props }) => {
  const colorClasses = {
    primary: 'checkbox-primary',
    info: 'checkbox-info',
    success: 'checkbox-success',
    warning: 'checkbox-warning',
    error: 'checkbox-error',
    accent: 'checkbox-accent',
  };

  const roundedClasses = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <input
      type="checkbox"
      className={`checkbox ${colorClasses[color] || colorClasses.primary} ${roundedClasses[rounded] || roundedClasses.md} ${className}`}
      checked={checked}
      onChange={onChange}
      ref={(el) => {
        if (el && indeterminate !== undefined) {
          el.indeterminate = indeterminate;
        }
      }}
      style={{ width, height }}
      {...props}
    />
  );
};

export default Checkbox;

