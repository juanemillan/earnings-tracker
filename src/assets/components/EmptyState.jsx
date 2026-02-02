import React, { useRef } from 'react';
import { Upload, Download, TrendingUp, Sparkles } from 'lucide-react';

export function EmptyState({ 
  onFilesSelected, 
  uploadStatus,
  githubUrl,
  author 
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Main Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Decorative background */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background: 'radial-gradient(800px 600px at 50% -10%, rgba(99,102,241,0.15), transparent 70%), radial-gradient(600px 400px at 80% 100%, rgba(139,92,246,0.12), transparent 60%)',
          }}
        />

        {/* Content */}
        <div className="relative p-6 sm:p-8">
          {/* Header with badge */}
          <div className="text-center mb-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 backdrop-blur mb-3">
              <Sparkles size={14} className="text-indigo-600" />
              Welcome to Earnings Tracker
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 animate-fade-in animate-delay-100">
              Start Tracking Your Earnings
            </h1>
            <p className="text-base text-slate-600 max-w-2xl mx-auto animate-fade-in animate-delay-200">
              Upload your Outlier earnings CSV and get instant insights on your hours, earnings, and performance trends.
            </p>
          </div>

          {/* Upload Area - Prominent */}
          <div className="mb-8 animate-fade-in animate-delay-300">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload-empty"
            />
            <label 
              htmlFor="csv-upload-empty"
              className="group block cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl border-3 border-dashed border-indigo-300 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-8 transition-all duration-300 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:shadow-xl">
                <div className="flex flex-col items-center gap-3">
                  {/* Animated upload icon */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                    <div className="relative rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-10 h-10 text-white animate-bounce-subtle" />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg font-semibold text-slate-900 mb-1">
                      Drop your CSV file here or click to browse
                    </p>
                    <p className="text-sm text-slate-600">
                      Accepts .csv files from your Outlier Earnings tab
                    </p>
                  </div>
                </div>
              </div>
            </label>

            {/* Status message */}
            {uploadStatus && (
              <div className="mt-3 text-center animate-fade-in">
                <p className="text-sm text-slate-600">{uploadStatus}</p>
              </div>
            )}
          </div>

          {/* Steps - Visual */}
          <div className="mb-6 animate-fade-in animate-delay-400">
            <h3 className="text-center text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">
              How it works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
                <div className="relative rounded-2xl border border-slate-200 bg-white p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-bold mb-3 shadow-lg">
                    1
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1.5 text-sm">Download CSV</h4>
                  <p className="text-xs text-slate-600">
                    Go to your Outlier <span className="font-medium text-indigo-600">Earnings</span> tab and download your report
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
                <div className="relative rounded-2xl border border-slate-200 bg-white p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white text-lg font-bold mb-3 shadow-lg">
                    2
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1.5 text-sm">Upload File</h4>
                  <p className="text-xs text-slate-600">
                    Drop your CSV in the box above - we'll process it instantly
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
                <div className="relative rounded-2xl border border-slate-200 bg-white p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-lg font-bold mb-3 shadow-lg">
                    3
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1.5 text-sm">Analyze & Track</h4>
                  <p className="text-xs text-slate-600">
                    View detailed analytics, set goals, and track your progress
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-slate-200 animate-fade-in animate-delay-500">
            <span className="text-sm text-slate-500">
              Made with ❤️ by <span className="font-medium text-slate-700">{author}</span>
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-1/3 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
    </div>
  );
}
