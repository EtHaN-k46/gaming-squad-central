import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-muted rounded-full animate-spin border-t-destructive"></div>
        {/* Inner glow */}
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse">
          <div className="absolute inset-2 bg-destructive/20 rounded-full blur-sm"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
