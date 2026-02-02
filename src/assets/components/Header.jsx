import React from 'react';
import { Sparkles, Upload, BarChart3, Calendar, TrendingUp, Activity, Github } from 'lucide-react';

const Header = ({ viewMode, onViewModeChange, githubUrl }) => {
  const navLinks = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'metrics', label: 'Metrics', icon: Activity },
    { id: 'charts', label: 'Charts', icon: BarChart3 },
    { id: 'cycles', label: 'Cycles', icon: TrendingUp },
    { id: 'breakdown', label: 'Breakdown', icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between max-w-full">
        {/* Left side - Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Earnings Tracker
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Outlier Analytics Platform (Non-official)
            </p>
          </div>
        </div>

        {/* Center - Navigation Links (only in original view) */}
        {viewMode === 'original' && (
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-all duration-200 group"
                >
                  <Icon size={16} className="group-hover:scale-110 transition-transform" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>
        )}



        {/* Right side - View Toggle (hidden on mobile) */}
        <div className='flex flex-row justify-center items-center gap-4'>
            <div>
                <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                    title="View on GitHub"
                >
                    <Github size={16}/>
                    <p className='sr-only'>View on GitHub</p>
                </a>
            </div>
            <div className="hidden md:inline-flex rounded-lg bg-white/90 shadow-lg border border-white/40 p-1 backdrop-blur-sm relative">
              {/* Animated background slider */}
              <div 
                className="absolute top-1 bottom-1 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 shadow-md transition-all duration-1000 ease-out"
                style={{
                  left: viewMode === 'original' ? '4px' : '50%',
                  width: 'calc(50% - 4px)',
                }}
              />
              
              <button
                onClick={() => onViewModeChange('original')}
                className={`relative z-10 px-5 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                  viewMode === 'original'
                    ? 'text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => onViewModeChange('new')}
                className={`relative z-10 px-5 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                  viewMode === 'new'
                    ? 'text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                New UI
              </button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
