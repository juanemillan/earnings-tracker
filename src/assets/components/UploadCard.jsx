// src/components/UploadCard.jsx
import React, { useRef } from 'react';
import { Upload, Download, Plus } from 'lucide-react';

export function UploadCard({ onExport, onFilesSelected, status }) {
  const fileInputRef = useRef(null);

  const onChange = (e) => onFilesSelected?.(e.target.files);
  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  const onDrop = (e) => {
    e.preventDefault();
    onFilesSelected?.(e.dataTransfer.files);
  };

  return (
    <section className="relative mb-6 rounded-2xl border border-slate-200 bg-white shadow-lg">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 rounded-t-2xl" />

      <div className="p-6 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Upload className="text-indigo-600" size={20} />
            Upload New Data
          </h2>

          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 active:scale-[.99]"
          >
            <Download size={16} />
            Export Weekly Report
          </button>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={onDragOver}
          onDrop={onDrop}
          className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-center transition hover:bg-white"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={onChange}
            className="hidden"
            id="csv-upload"
          />

          <label htmlFor="csv-upload" className="cursor-pointer inline-flex flex-col items-center">
            <Plus className="mb-3 text-slate-400" size={48} />
            <span className="text-base font-medium text-slate-800">Upload CSV File</span>
            <span className="mt-1 text-sm text-slate-500">
              Drag & drop or click to browse — only new entries will be added
            </span>
          </label>
        </div>

        {/* Status */}
        {status && (
          <div className="mt-4">
            <div
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                status.startsWith('✅')
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : status.startsWith('❌')
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-indigo-200 bg-indigo-50 text-indigo-700'
              }`}
            >
              <span className="mt-0.5 select-none">•</span>
              <p className="leading-5">{status}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
