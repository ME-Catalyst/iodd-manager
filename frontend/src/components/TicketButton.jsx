import React from 'react';
import { Bug } from 'lucide-react';

/**
 * Floating action button for creating tickets/bug reports
 * Displays on device detail pages
 */
const TicketButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-foreground rounded-full px-6 py-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 z-50"
      title="Report an issue with this device"
    >
      <Bug className="w-5 h-5" />
      <span className="font-medium">Report Issue</span>
    </button>
  );
};

export default TicketButton;
