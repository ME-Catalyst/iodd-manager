import React, { useState } from 'react';
import { Card, CardContent, Badge } from '@/components/ui';
import { Package } from 'lucide-react';
import { format } from 'date-fns';

// Format version string - strip leading 'v' or 'V' if present
const formatVersion = (version) => {
  if (!version) return '';
  const str = version.toString();
  return str.replace(/^[vV]/, '');
};

const DeviceGridCard = ({ device, onClick, selected, onToggleSelect, API_BASE }) => {
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
        <div className="flex justify-end mb-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 rounded border-border bg-muted checked:bg-brand-green"
          />
        </div>
        <div className="w-full h-32 rounded-lg bg-secondary flex items-center justify-center mb-4 p-4 overflow-hidden">
          {!imgError ? (
            <img
              src={`${API_BASE}/api/iodd/${device.id}/thumbnail`}
              alt={device.product_name}
              className="w-full h-full object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <Package className="w-16 h-16 text-muted-foreground" />
          )}
        </div>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-semibold text-foreground truncate flex-1">{device.product_name}</h3>
        <Badge className="bg-brand-green/20 text-brand-green border-brand-green/50 text-xs ml-2">
          v{formatVersion(device.iodd_version)}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{device.manufacturer}</p>
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Device ID: <span className="font-mono">{device.device_id}</span></div>
        <div>{format(new Date(device.import_date), 'MMM d, yyyy')}</div>
      </div>
    </CardContent>
  </Card>
  );
};

export default DeviceGridCard;
