import { Loader2, Sparkles } from 'lucide-react';

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/40 backdrop-blur-md">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/60 bg-white/90 p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-300">
        <div className="relative">
          <Loader2 size={48} className="animate-spin text-indigo-600" />
          <Sparkles size={20} className="absolute -right-2 -top-2 animate-pulse text-purple-600" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800">Processing your data...</h3>
          <p className="mt-1 text-sm text-slate-600">This will only take a moment</p>
        </div>
      </div>
    </div>
  );
}

export default LoadingOverlay;
