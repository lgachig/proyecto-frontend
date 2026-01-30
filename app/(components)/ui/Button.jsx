"use client";

/**
 * Button Component - Reusable button with consistent styling
 * @param {React.ReactNode} children - Button content
 * @param {Function} onClick - Click handler
 * @param {string} variant - Button variant: 'primary' | 'secondary' | 'outline'
 * @param {string} size - Button size: 'sm' | 'md' | 'lg'
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Additional classes
 */
export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  ...props 
}) {
  const baseStyles = "font-inter font-black uppercase transition-all transform active:scale-95 rounded-full";
  
  const variants = {
    primary: "bg-black text-white hover:bg-parking-primary-action shadow-xl",
    secondary: "bg-parking-primary-action text-white hover:opacity-90 shadow-xl",
    outline: "bg-transparent border-2 border-parking-primary text-parking-primary hover:bg-parking-primary hover:text-white"
  };
  
  const sizes = {
    sm: "px-10 py-4 text-xl",
    md: "px-16 py-6 text-2xl",
    lg: "w-full py-10 text-3xl"
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
}

