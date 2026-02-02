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
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
      {/* Main Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Decorative background */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background: 'radial-gradient(800px 600px at 50% -10%, rgba(99,102,241,0.15), transparent 70%), radial-gradient(600px 400px at 80% 100%, rgba(139,92,246,0.12), transparent 60%)',
          }}
        />

        {/* Content */}
        <div className="relative p-3 sm:p-4 md:p-6 lg:p-8 h-sm:p-4 h-md:p-6 h-lg:p-8">
          {/* Header with badge */}
          <div className="text-center mb-2 sm:mb-3 md:mb-4 h-sm:mb-3 h-md:mb-4 h-lg:mb-6 animate-fade-in">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-indigo-700 backdrop-blur mb-1.5 sm:mb-2 h-sm:mb-2 h-md:mb-3">
              <Sparkles size={12} className="text-indigo-600 h-sm:w-3.5 h-sm:h-3.5 h-md:w-4 h-md:h-4" />
              Welcome to Earnings Tracker
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl h-sm:text-2xl h-md:text-3xl h-lg:text-4xl font-bold text-slate-900 mb-1 sm:mb-2 h-sm:mb-2 h-md:mb-3 animate-fade-in animate-delay-100">
              Start Tracking Your Earnings
            </h1>
            <p className="text-xs sm:text-sm md:text-base h-sm:text-sm h-md:text-base text-slate-600 max-w-2xl mx-auto animate-fade-in animate-delay-200 leading-tight sm:leading-normal">
              Upload your Outlier earnings CSV and get instant insights on your hours, earnings, and performance trends.
            </p>
          </div>

          {/* Upload Area - Prominent */}
          <div className="mb-2 sm:mb-3 md:mb-4 lg:mb-6 h-sm:mb-4 h-md:mb-5 h-lg:mb-8 animate-fade-in animate-delay-300">
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
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-dashed border-indigo-300 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-3 sm:p-4 md:p-5 lg:p-6 h-sm:p-4 h-md:p-5 h-lg:p-6 transition-all duration-300 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:shadow-xl">
                <div className="flex flex-col items-center gap-1.5 sm:gap-2 h-sm:gap-2 h-md:gap-2.5">
                  {/* Animated upload icon */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                    <div className="relative rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2 sm:p-3 h-sm:p-3 h-md:p-3.5 h-lg:p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 h-sm:w-8 h-sm:h-8 h-md:w-9 h-md:h-9 h-lg:w-10 h-lg:h-10 text-white animate-bounce-subtle" />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm sm:text-base md:text-lg h-sm:text-base h-md:text-lg font-semibold text-slate-900 mb-0.5">
                      Drop your CSV file here or click to browse
                    </p>
                    <p className="text-[10px] sm:text-xs md:text-sm h-sm:text-xs h-md:text-sm text-slate-600">
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
          <div className="mb-2 sm:mb-3 md:mb-4 h-sm:mb-3 h-md:mb-4 h-lg:mb-6 animate-fade-in animate-delay-400">
            <h3 className="text-center text-[10px] sm:text-xs h-sm:text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 sm:mb-3 h-sm:mb-2 h-md:mb-3">
              How it works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 h-sm:gap-3 h-md:gap-3.5 h-lg:gap-4">
              {/* Step 1 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
                <div className="relative rounded-lg sm:rounded-xl border border-slate-200 bg-white p-2 sm:p-3 h-sm:p-3 h-md:p-3.5 h-lg:p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 h-sm:w-10 h-sm:h-10 h-md:w-11 h-md:h-11 h-lg:w-12 h-lg:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm sm:text-base md:text-lg h-sm:text-base h-md:text-lg font-bold mb-1 sm:mb-2 h-sm:mb-2 h-md:mb-2.5 shadow-lg">
                    1
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-0.5 sm:mb-1 h-sm:mb-1 text-xs sm:text-sm h-sm:text-sm">Download CSV</h4>
                  <p className="text-[10px] sm:text-xs h-sm:text-xs text-slate-600 leading-tight">
                    Go to your Outlier <span className="font-medium text-indigo-600">Earnings</span> tab and download your report
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
                <div className="relative rounded-lg sm:rounded-xl border border-slate-200 bg-white p-2 sm:p-3 h-sm:p-3 h-md:p-3.5 h-lg:p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 h-sm:w-10 h-sm:h-10 h-md:w-11 h-md:h-11 h-lg:w-12 h-lg:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white text-sm sm:text-base md:text-lg h-sm:text-base h-md:text-lg font-bold mb-1 sm:mb-2 h-sm:mb-2 h-md:mb-2.5 shadow-lg">
                    2
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-0.5 sm:mb-1 h-sm:mb-1 text-xs sm:text-sm h-sm:text-sm">Upload File</h4>
                  <p className="text-[10px] sm:text-xs h-sm:text-xs text-slate-600 leading-tight">
                    Drop your CSV in the box above - we'll process it instantly
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
                <div className="relative rounded-lg sm:rounded-xl border border-slate-200 bg-white p-2 sm:p-3 h-sm:p-3 h-md:p-3.5 h-lg:p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 h-sm:w-10 h-sm:h-10 h-md:w-11 h-md:h-11 h-lg:w-12 h-lg:h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-sm sm:text-base md:text-lg h-sm:text-base h-md:text-lg font-bold mb-1 sm:mb-2 h-sm:mb-2 h-md:mb-2.5 shadow-lg">
                    3
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-0.5 sm:mb-1 h-sm:mb-1 text-xs sm:text-sm h-sm:text-sm">Analyze & Track</h4>
                  <p className="text-[10px] sm:text-xs h-sm:text-xs text-slate-600 leading-tight">
                    View detailed analytics, set goals, and track your progress
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 sm:pt-3 md:pt-4 h-sm:pt-3 h-md:pt-4 h-lg:pt-6 border-t border-slate-200 animate-fade-in animate-delay-500">
            <span className="text-[10px] sm:text-xs h-sm:text-xs h-md:text-sm text-slate-500">
              Made with ❤️ by <span className="font-medium text-slate-700">{author}</span>
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob hidden sm:block" />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 hidden sm:block" />
        <div className="absolute top-40 left-1/3 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 hidden sm:block" />
      </div>
    </div>
  );
}
