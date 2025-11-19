import React from 'react';
import { Badge } from '@/components/ui';
import {
  Command, ChevronRight, Database, Type, AlertCircle
} from 'lucide-react';
import { getAccessRightInfo } from '@/utils/iolinkConstants';
import { getUnitInfo } from '@/utils/iolinkUnits';

/**
 * Comprehensive Menu Item Display Component - Shows ALL menu items
 * Handles buttons, menu references, record items, and variables
 */
export const MenuItemDisplay = ({
  item,
  parameterValues,
  InteractiveParameterControl
}) => {
  // Handle Button Items
  if (item.button_value) {
    return (
      <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-foreground">Action Button</span>
            {item.variable_id && (
              <Badge className="bg-brand-green/20 text-foreground-secondary border-brand-green/50 font-mono text-xs">
                {item.variable_id}
              </Badge>
            )}
          </div>
          <Badge className="bg-warning/20 text-warning border-warning/50">
            Value: {item.button_value}
          </Badge>
        </div>
        {item.access_right_restriction && (() => {
          const accessInfo = getAccessRightInfo(item.access_right_restriction);
          return (
            <div className="mt-2 text-xs text-muted-foreground">
              Access: <Badge
                className={`ml-1 bg-${accessInfo?.color || 'slate'}-500/20 text-${accessInfo?.color || 'slate'}-300 border-${accessInfo?.color || 'slate'}-500/50 text-xs`}
                title={accessInfo?.description || item.access_right_restriction}
              >
                {accessInfo?.icon} {accessInfo?.label || item.access_right_restriction}
              </Badge>
            </div>
          );
        })()}
      </div>
    );
  }

  // Handle Menu References (Submenus)
  if (item.menu_ref) {
    return (
      <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-foreground">Submenu Link</span>
          </div>
          <Badge className="bg-secondary/20 text-foreground-secondary border-secondary/50 font-mono">
            {item.menu_ref}
          </Badge>
        </div>
        {item.variable_id && (
          <div className="mt-2 text-xs text-muted-foreground">
            Variable: <Badge className="ml-1 bg-brand-green/20 text-foreground-secondary font-mono text-xs">{item.variable_id}</Badge>
          </div>
        )}
      </div>
    );
  }

  // Handle RecordItem References
  if (item.record_item_ref) {
    return (
      <div className="p-3 rounded-lg bg-brand-green/10 border border-brand-green/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-green" />
            <span className="text-sm font-medium text-foreground">Record Item</span>
          </div>
          <Badge className="bg-brand-green/20 text-foreground-secondary border-brand-green/50 font-mono">
            {item.record_item_ref}
          </Badge>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          {item.subindex !== null && (
            <div className="text-muted-foreground">
              Subindex: <Badge className="ml-1 bg-muted text-foreground text-xs">{item.subindex}</Badge>
            </div>
          )}
          {item.access_right_restriction && (() => {
            const accessInfo = getAccessRightInfo(item.access_right_restriction);
            return (
              <div className="text-muted-foreground">
                Access: <Badge
                  className={`ml-1 bg-${accessInfo?.color || 'slate'}-500/20 text-${accessInfo?.color || 'slate'}-300 border-${accessInfo?.color || 'slate'}-500/50 text-xs`}
                  title={accessInfo?.description || item.access_right_restriction}
                >
                  {accessInfo?.icon} {accessInfo?.label || item.access_right_restriction}
                </Badge>
              </div>
            );
          })()}
          {item.display_format && (
            <div className="text-muted-foreground">
              Format: <Badge className="ml-1 bg-muted text-foreground text-xs">{item.display_format}</Badge>
            </div>
          )}
          {item.unit_code && (() => {
            const unitInfo = getUnitInfo(item.unit_code);
            return (
              <div className="text-muted-foreground">
                Unit: <Badge className="ml-1 bg-muted text-foreground text-xs" title={unitInfo.name}>
                  {unitInfo.symbol || item.unit_code}
                </Badge>
                {unitInfo.symbol && (
                  <span className="ml-1 text-xs text-muted-foreground">({unitInfo.name})</span>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  // Handle Variable Items (with or without parameter details)
  if (item.variable_id) {
    const param = item.parameter;
    const variableId = item.variable_id;
    const value = parameterValues[variableId] || (param?.default_value) || '';
    const isReadOnly = item.access_right_restriction === 'ro';

    // If we have full parameter details, show interactive control
    if (param) {
      return <InteractiveParameterControl item={item} />;
    }

    // Otherwise, show variable info card (parameter lookup failed)
    return (
      <div className="p-3 rounded-lg bg-secondary/50 border border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-muted-foreground" />
            <Badge className="bg-brand-green/20 text-foreground-secondary border-brand-green/50 font-mono text-xs">
              {variableId}
            </Badge>
          </div>
          {isReadOnly && (
            <Badge className="text-xs bg-info/20 text-info border-info/50">Read Only</Badge>
          )}
        </div>
        <div className="space-y-1 text-xs">
          {item.access_right_restriction && (() => {
            const accessInfo = getAccessRightInfo(item.access_right_restriction);
            return (
              <div className="text-muted-foreground">
                Access: <Badge
                  className={`ml-1 bg-${accessInfo?.color || 'slate'}-500/20 text-${accessInfo?.color || 'slate'}-300 border-${accessInfo?.color || 'slate'}-500/50 text-xs`}
                  title={accessInfo?.description || item.access_right_restriction}
                >
                  {accessInfo?.icon} {accessInfo?.label || item.access_right_restriction}
                </Badge>
              </div>
            );
          })()}
          {item.display_format && (
            <div className="text-muted-foreground">
              Format: <Badge className="ml-1 bg-muted text-foreground text-xs">{item.display_format}</Badge>
            </div>
          )}
          {item.unit_code && (() => {
            const unitInfo = getUnitInfo(item.unit_code);
            return (
              <div className="text-muted-foreground">
                Unit: <Badge className="ml-1 bg-muted text-foreground text-xs" title={unitInfo.name}>
                  {unitInfo.symbol || item.unit_code}
                </Badge>
                {unitInfo.symbol && (
                  <span className="ml-1 text-xs text-muted-foreground">({unitInfo.name})</span>
                )}
              </div>
            );
          })()}
          <div className="text-muted-foreground text-xs mt-2">
            ⚠ Parameter details not found in database
          </div>
        </div>
      </div>
    );
  }

  // Fallback for unknown item types
  return (
    <div className="p-3 rounded-lg bg-secondary/30 border border-border">
      <div className="text-xs text-muted-foreground">Unknown item type</div>
      <pre className="text-xs text-muted-foreground mt-1">{JSON.stringify(item, null, 2)}</pre>
    </div>
  );
};
