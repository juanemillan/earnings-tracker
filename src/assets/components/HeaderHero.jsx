// src/components/HeaderHero.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Upload, Download, Info, X, Github } from 'lucide-react';

export function HeaderHero({ title, subtitle, githubUrl, author, hasData, timeGoalHours, onChangeTimeGoal, avgRate
}) {
  const [showModal, setShowModal] = useState(false);

  // Calculate earnings goal preview
  const earningsGoalPreview = avgRate && timeGoalHours ? avgRate * timeGoalHours : 0;

  // Compact mode when data is loaded
  if (hasData) {
    return (
      <>
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-tr from-indigo-50 via-violet-50 to-cyan-50 shadow-lg h-full flex flex-col">
          {/* glow / vignette */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(1200px 400px at 20% -20%, rgba(79,70,229,0.20), transparent 60%), radial-gradient(800px 300px at 95% 10%, rgba(139,92,246,0.18), transparent 55%)',
            }}
          />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

          <div className="relative p-6 sm:p-7 flex-1 flex flex-col">
            {/* Compact header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-m font-normal text-slate-600 backdrop-blur">
                  <Sparkles size={14} className="text-indigo-600" />
                  Outlier Earnings Tracker 
                </div>
              </div>
              
              <div className="flex items-center gap-2">                
                <button
                  onClick={() => setShowModal(true)}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 transition-colors"
                >
                  <Info size={16} />
                  <span className="hidden sm:inline">How it works</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 flex flex-wrap items-center gap-3 justify-end">
              <span className="text-sm text-slate-500">Made with ❤️ by {author}</span>
            </div>
          </div>
        </section>

        {/* Modal - rendered at document root via Portal */}
        {showModal && createPortal(
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <div 
              className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-semibold text-white">How to Use Earnings Tracker</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal content */}
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-slate-600">{subtitle}</p>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Getting Started</h3>
                  
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
                        1
                      </span>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Download CSV</h4>
                        <p className="text-sm text-slate-600">
                          Go to your Outlier <em>Earnings</em> tab and download your earnings report as a CSV file.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
                        2
                      </span>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Upload File</h4>
                        <p className="text-sm text-slate-600">
                          Use the upload box on this page to import your CSV. The tracker automatically detects and skips duplicate entries.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
                        3
                      </span>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Set Your Goals</h4>
                        <p className="text-sm text-slate-600">
                          Adjust your hourly and earnings targets in the Analytics section to track your progress against your goals.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setShowModal(false)}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  // Full mode when no data
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-tr from-indigo-50 via-violet-50 to-cyan-50 shadow-lg h-full flex flex-col">
      {/* glow / vignette */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(1200px 400px at 20% -20%, rgba(79,70,229,0.20), transparent 60%), radial-gradient(800px 300px at 95% 10%, rgba(139,92,246,0.18), transparent 55%)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      <div className="relative px-6 py-8 sm:px-10 sm:py-10 flex-1 flex flex-col items-start">
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
        <div className="mt-auto pt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-500">Made with ❤️ by {author}</span>
        </div>
      </div>
    </section>
  );
}
