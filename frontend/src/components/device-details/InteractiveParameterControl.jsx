import React from 'react';
import {
  Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui';
import { AlertCircle } from 'lucide-react';

/**
 * Interactive Parameter Control Component
 * Renders different input types based on parameter data type and constraints
 */
export const InteractiveParameterControl = ({
  item,
  parameterValues,
  validationErrors,
  updateParameterValue,
  setSelectedParameter
}) => {
  const param = item.parameter;
  const variableId = item.variable_id;
  const value = parameterValues[variableId] || param?.default_value || '';
  const error = validationErrors[variableId];
  const isReadOnly = item.access_right_restriction === 'ro';

  if (!param) return null;

  const handleChange = (newValue) => {
    updateParameterValue(variableId, newValue, param);
  };

  // Enumeration - Dropdown
  if (param.enumeration_values && Object.keys(param.enumeration_values).length > 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm text-foreground cursor-pointer text-left"
            onClick={() => setSelectedParameter(item)}
          >
            {param.name}
            {item.unit_code && <span className="ml-1 text-xs text-muted-foreground">({item.unit_code})</span>}
          </button>
          {isReadOnly && <Badge className="text-xs bg-info/20 text-info">Read Only</Badge>}
        </div>
        <Select
          value={value}
          onValueChange={handleChange}
          disabled={isReadOnly}
        >
          <SelectTrigger className={`bg-secondary border-border text-foreground ${error ? 'border-error' : ''}`}>
            <SelectValue placeholder="Select value..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(param.enumeration_values).map(([enumValue, enumName]) => (
              <SelectItem key={enumValue} value={enumValue}>
                {enumName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-xs text-error flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  // Boolean - Toggle
  if (param.data_type && param.data_type.toLowerCase().includes('bool')) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
        <button
          type="button"
          className="text-sm text-foreground cursor-pointer flex-1 text-left"
          onClick={() => setSelectedParameter(item)}
        >
          {param.name}
          {isReadOnly && <Badge className="ml-2 text-xs bg-info/20 text-info">Read Only</Badge>}
        </button>
        <input
          id={`param-bool-${variableId}`}
          aria-label={param.name}
          type="checkbox"
          checked={value === '1' || value === 'true' || value === true}
          onChange={(e) => handleChange(e.target.checked ? '1' : '0')}
          disabled={isReadOnly}
          className="w-5 h-5 rounded border-border text-secondary focus:ring-secondary"
        />
      </div>
    );
  }

  // Numeric with range - Slider + Input
  if (param.min_value !== null && param.max_value !== null) {
    const numValue = parseFloat(value) || 0;
    const minVal = parseFloat(param.min_value) || 0;
    const maxVal = parseFloat(param.max_value) || 100;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm text-foreground cursor-pointer text-left"
            onClick={() => setSelectedParameter(item)}
          >
            {param.name}
            {item.unit_code && <span className="ml-1 text-xs text-muted-foreground">({item.unit_code})</span>}
          </button>
          <div className="flex items-center gap-2">
            <Input
              id={`param-num-${variableId}`}
              aria-label={param.name}
              type="number"
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isReadOnly}
              min={minVal}
              max={maxVal}
              className={`w-20 h-8 bg-secondary border-border text-foreground text-sm ${error ? 'border-error' : ''}`}
            />
            {isReadOnly && <Badge className="text-xs bg-info/20 text-info">RO</Badge>}
          </div>
        </div>
        <input
          type="range"
          min={minVal}
          max={maxVal}
          value={numValue}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isReadOnly}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{param.min_value}</span>
          <span>{param.max_value}</span>
        </div>
        {error && (
          <p className="text-xs text-error flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  // Default - Text Input
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-sm text-foreground cursor-pointer text-left"
          onClick={() => setSelectedParameter(item)}
        >
          {param.name}
          {item.unit_code && <span className="ml-1 text-xs text-muted-foreground">({item.unit_code})</span>}
        </button>
        {isReadOnly && <Badge className="text-xs bg-info/20 text-info">Read Only</Badge>}
      </div>
      <Input
        id={`param-text-${variableId}`}
        aria-label={param.name}
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isReadOnly}
        placeholder={`Enter ${param.name.toLowerCase()}...`}
        className={`bg-secondary border-border text-foreground ${error ? 'border-error' : ''}`}
      />
      {error && (
        <p className="text-xs text-error flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};
