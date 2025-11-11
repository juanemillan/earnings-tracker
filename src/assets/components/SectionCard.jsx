import React from 'react';

export default function SectionCard({ title, subtitle, right, children, className = '' }) {
  return (
    <section className={`relative rounded-t-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-3 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" />
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-2 sm:py-2">
          <div className='py-2 sm:py-0'>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
          </div>
          {right}
        </div>
        {children}
      </div>
    </section>
  );
}
