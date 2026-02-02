import React from 'react';

const TwoColumnLayout = ({ leftContent, rightContent }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[3fr_4fr] gap-6 h-full overflow-hidden">
      {/* Left Column */}
      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {leftContent}
      </div>
      
      {/* Right Column */}
      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {rightContent}
      </div>
    </div>
  );
};

export default TwoColumnLayout;
