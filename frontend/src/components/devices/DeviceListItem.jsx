import React, { useState } from 'react';
import { Card, CardContent, Badge } from '@/components/ui';
import { Package, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

// Format version string - strip leading 'v' or 'V' if present
const formatVersion = (version) => {
  if (!version) return '';
  const str = version.toString();
  return str.replace(/^[vV]/, '');
};

const DeviceListItem = ({ device, onClick, selected, onToggleSelect, API_BASE }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Card
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      }}
      role="button"
      tabIndex={0}
      className={`bg-card border-border hover:border-brand-green/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-brand-green/10 ${selected ? 'ring-2 ring-brand-green' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex items-center pt-1">
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggleSelect}
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5 rounded border-border bg-muted checked:bg-brand-green"
            />
          </div>
          <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 p-2 overflow-hidden">
            {!imgError ? (
              <img
                src={`${API_BASE}/api/iodd/${device.id}/thumbnail`}
                alt={device.product_name}
                className="w-full h-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <Package className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-lg font-semibold text-foreground truncate">{device.product_name}</h3>
            <Badge className="bg-brand-green/20 text-brand-green border-brand-green/50 ml-2">
              v{formatVersion(device.iodd_version)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{device.manufacturer}</p>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span className="flex items-center">
              <span className="font-mono mr-1">ID:</span> {device.device_id}
            </span>
            <span className="flex items-center">
              <span className="font-mono mr-1">Vendor:</span> {device.vendor_id}
            </span>
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(device.import_date), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceListItem;
