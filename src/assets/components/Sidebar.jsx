import React from 'react';
import { LayoutDashboard, BarChart3, Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { UploadCard } from './UploadCard';

const Sidebar = ({ isCollapsed, onToggle, activeSection, onSectionChange, viewMode, hasData, onExport, onFilesSelected, uploadStatus }) => {
  const menuItems = [
    { id: 'upload', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'charts', label: 'Charts', icon: BarChart3 },
    { id: 'cycles', label: '4-Week Cycles', icon: TrendingUp },
    { id: 'breakdown', label: 'Breakdown', icon: Calendar },
  ];

  return (
    <div 
      className={`bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="font-semibold text-slate-900 text-sm">Sections</h2>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight size={18} className="text-slate-600" />
          ) : (
            <ChevronLeft size={18} className="text-slate-600" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isCollapsed ? 'justify-center' : ''
              } ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className='flex flex-col'>
        {hasData && (
            <UploadCard
            onExport={onExport}
            onFilesSelected={onFilesSelected}
            status={uploadStatus}
            viewMode={viewMode}
            hasData={hasData}
            isCollapsed={isCollapsed}
            />
        )}
      </div>

      {/* Footer */}
      <div className={`w-full border-t border-slate-200 ${isCollapsed ? 'p-4' : 'p-4'} transition-all`}>
        <div className="flex items-center justify-center">
          <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
          {!isCollapsed && <span className="ml-2 text-xs text-slate-500 truncate">New UI - Experimental</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
