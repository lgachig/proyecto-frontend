"use client";

/**
 * Input Component - Reusable input with consistent styling
 * @param {string} label - Input label
 * @param {string} type - Input type
 * @param {string} value - Input value
 * @param {Function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} readOnly - Read-only state
 * @param {string} className - Additional classes
 */
export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  readOnly = false,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-3">
      {label && (
        <label className="text-lg font-black text-gray-400 uppercase italic ml-4 block">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`
          w-full p-8 bg-gray-50 rounded-[30px] text-2xl font-black
          border-2 border-transparent focus:border-parking-primary outline-none
          ${readOnly ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
  );
}

