"use client";

/**
 * PageHeader Component - Reusable page header with consistent styling
 * @param {string} title - Main title
 * @param {string} subtitle - Subtitle/description
 * @param {React.ReactNode} children - Additional content (e.g., buttons, filters)
 */
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
      <div>
        <h1 className="text-[80px] font-black text-black uppercase tracking-tighter leading-none mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-2xl text-gray-500 font-bold uppercase italic">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}

