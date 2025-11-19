import React from 'react';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription, Badge
} from '@/components/ui';
import { Image as ImageIcon } from 'lucide-react';

/**
 * AssetsTab - Displays device image assets in a grid
 */
export const AssetsTab = ({
  imageAssets,
  device,
  API_BASE,
  setLightboxIndex,
  setLightboxOpen
}) => {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="text-foreground text-xl flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-warning" />
          </div>
          Device Images
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {imageAssets.length} image file{imageAssets.length !== 1 ? 's' : ''} available
        </CardDescription>
      </CardHeader>
      <CardContent>
        {imageAssets.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {imageAssets.map((asset, index) => (
              <div key={asset.id} className="group space-y-3">
                <div
                  onClick={() => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                  className="aspect-square bg-gradient-to-br from-surface to-surface rounded-lg p-4 border border-border hover:border-warning/50 transition-all cursor-pointer relative overflow-hidden"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <img
                    src={`${API_BASE}/api/iodd/${device.id}/assets/${asset.id}`}
                    alt={asset.file_name}
                    className="relative z-10 w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium truncate">{asset.file_name}</p>
                  {asset.image_purpose && (
                    <Badge className="text-xs mt-1 bg-warning/20 text-warning border-warning/50">
                      {asset.image_purpose}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No images found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
