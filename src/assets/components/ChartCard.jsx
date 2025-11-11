// src/components/ChartCard.jsx
import React from 'react';

export default function ChartCard({ title, subtitle, right, children }) {
  return (
    <section className="relative rounded-b-2xl border border-slate-200 bg-white shadow-lg">
      <div className="sm:p-5">
        <div className="mb-3 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
          </div>
          {right /* optional actions / legend chip */}
        </div>
        <div className="h-[340px] sm:h-[360px] px-0 pb-3 sm:px-2 sm:pb-0">
          {children}
        </div>
      </div>
    </section>
  );
}
