import React, { useState } from 'react';
import { X, Info } from 'lucide-react';

interface NotificationBannerProps {
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  dismissible?: boolean;
  onDismiss?: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message,
  type = 'info',
  dismissible = true,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const typeStyles = {
    info: 'bg-blue-600/20 border-blue-600/30 text-blue-200',
    warning: 'bg-yellow-600/20 border-yellow-600/30 text-yellow-200',
    success: 'bg-green-600/20 border-green-600/30 text-green-200',
    error: 'bg-red-600/20 border-red-600/30 text-red-200'
  };

  return (
    <div className={`border rounded-lg p-4 flex items-center justify-between ${typeStyles[type]}`}>
      <div className="flex items-center">
        <Info size={20} className="mr-3 flex-shrink-0" />
        <span className="text-sm">{message}</span>
      </div>
      
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="ml-4 p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default NotificationBanner;