import React, { useState, useEffect } from 'react';
import { Bug, MessageSquarePlus } from 'lucide-react';
import EnhancedTicketModal from './EnhancedTicketModal';

/**
 * Global floating action button for creating tickets from any page
 * Automatically captures context from the current page
 */
const GlobalTicketButton = ({ API_BASE = '', activeView = '', selectedDevice = null }) => {
  const [showModal, setShowModal] = useState(false);
  const [context, setContext] = useState({});

  // Extract context from current page whenever view/device changes
  useEffect(() => {
    const extractContext = () => {
      let pageContext = {
        page: 'Unknown',
        section: '',
        url: window.location.href,
        timestamp: new Date().toISOString()
      };

      // Detect page from activeView
      switch (activeView) {
        case 'overview':
        case 'home':
          pageContext.page = 'Home';
          break;

        case 'devices':
          pageContext.page = 'IODD Devices';
          pageContext.deviceType = 'IODD';
          break;

        case 'eds':
        case 'eds-list':
          pageContext.page = 'EDS Devices';
          pageContext.deviceType = 'EDS';
          break;

        case 'eds-details':
          pageContext.page = 'EDS Device Details';
          pageContext.deviceType = 'EDS';
          if (selectedDevice) {
            pageContext.deviceId = selectedDevice.id;
            pageContext.deviceName = selectedDevice.product_name || selectedDevice.name;
            pageContext.vendorName = selectedDevice.vendor_name;
            pageContext.productCode = selectedDevice.product_code;
          }
          break;

        case 'device-details':
          pageContext.page = 'IODD Device Details';
          pageContext.deviceType = 'IODD';
          if (selectedDevice) {
            pageContext.deviceId = selectedDevice.id;
            pageContext.deviceName = selectedDevice.product_name || selectedDevice.name;
            pageContext.vendorName = selectedDevice.vendor_name;
            pageContext.productCode = selectedDevice.product_code;
          }
          break;

        case 'pqa':
          pageContext.page = 'PQA Console';
          pageContext.section = 'Parameter Query Analysis';
          break;

        case 'admin':
          pageContext.page = 'Admin Console';
          break;

        case 'tickets':
          pageContext.page = 'Tickets';
          break;

        case 'docs':
          pageContext.page = 'Documentation';
          break;

        case 'search':
          pageContext.page = 'Search';
          break;

        case 'comparison':
          pageContext.page = 'Device Comparison';
          break;

        case 'analytics':
          pageContext.page = 'Analytics Dashboard';
          break;

        case 'mqtt':
          pageContext.page = 'MQTT Manager';
          pageContext.section = 'Services';
          break;

        case 'influx':
          pageContext.page = 'InfluxDB Manager';
          pageContext.section = 'Services';
          break;

        case 'nodered':
          pageContext.page = 'Node-RED Manager';
          pageContext.section = 'Services';
          break;

        case 'grafana':
          pageContext.page = 'Grafana Manager';
          pageContext.section = 'Services';
          break;

        default:
          pageContext.page = activeView || 'Unknown Page';
      }

      return pageContext;
    };

    setContext(extractContext());
  }, [activeView, selectedDevice]);

  const handleOpenModal = () => {
    // Refresh context right before opening
    const freshContext = {
      ...context,
      timestamp: new Date().toISOString()
    };
    setContext(freshContext);
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-full px-6 py-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 z-40 group"
        title="Report an issue or provide feedback"
        aria-label="Report Issue"
      >
        <Bug className="w-5 h-5" />
        <span className="font-medium">Report Issue</span>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      </button>

      <EnhancedTicketModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        context={context}
        API_BASE={API_BASE}
      />
    </>
  );
};

export default GlobalTicketButton;
