// src/components/HeaderHero.jsx
import React from 'react';
import { Sparkles, Upload, Download } from 'lucide-react';

export function HeaderHero({ title, subtitle, githubUrl, author
}) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-tr from-indigo-50 via-violet-50 to-cyan-50 shadow-lg">
      {/* glow / vignette */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(1200px 400px at 20% -20%, rgba(79,70,229,0.20), transparent 60%), radial-gradient(800px 300px at 95% 10%, rgba(139,92,246,0.18), transparent 55%)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      <div className="relative px-6 py-8 sm:px-10 sm:py-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur">
          <Sparkles size={14} className="text-indigo-600" />
          Outlier Earnings Tracker
        </div>

        <h1 className="text-3xl sm:text-[34px] font-semibold leading-tight text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-slate-600">{subtitle}</p>

        {/* steps */}
        <div className="mt-6 grid gap-3 text-[13px] sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white/80 p-3 backdrop-blur">
            <div className="mb-1 flex items-center gap-2 font-medium text-slate-800">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                1
              </span>
              Download CSV
            </div>
            <p className="text-slate-600">
              From your Outlier <em>Earnings</em> tab.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/80 p-3 backdrop-blur">
            <div className="mb-1 flex items-center gap-2 font-medium text-slate-800">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                2
              </span>
              Upload file
            </div>
            <p className="text-slate-600">
              Use the box below <Upload size={14} className="ml-1 inline text-slate-500" />.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/80 p-3 backdrop-blur">
            <div className="mb-1 flex items-center gap-2 font-medium text-slate-800">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                3
              </span>
              Set your goal
            </div>
            <p className="text-slate-600">Adjust hours & earnings targets in Dashboard.</p>
          </div>
        </div>

        {/* actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Download size={16} className="mr-2" />
            View on GitHub
          </a>
          <span className="text-sm text-slate-500">Made with ❤️ by {author}</span>
        </div>
      </div>
    </section>
  );
}
