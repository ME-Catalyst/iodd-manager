/**
 * Export Utilities
 * Functions for exporting data to CSV and JSON formats
 */

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to download
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

/**
 * Export data to JSON format
 * @param {Object|Array} data - Data to export
 * @param {string} filename - Name of the file to download
 */
export const exportToJSON = (data, filename) => {
  if (!data) return;

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

/**
 * Create a filename with timestamp for exports
 * @param {string} baseName - Base name for the file
 * @param {string} format - File format (csv, json, etc.)
 * @returns {string} Formatted filename with date
 */
export const createExportFilename = (baseName, format) => {
  const date = new Date().toISOString().split('T')[0];
  const safeName = baseName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${safeName}_${date}.${format}`;
};

/**
 * Export device parameters
 * @param {Array} parameters - Array of parameter objects
 * @param {string} deviceName - Name of the device
 * @param {string} format - Export format ('csv' or 'json')
 * @param {Function} toast - Toast notification function
 */
export const exportDeviceParameters = (parameters, deviceName, format, toast) => {
  const filename = createExportFilename(`${deviceName}_parameters`, format);

  if (format === 'csv') {
    exportToCSV(parameters, filename);
  } else {
    exportToJSON(parameters, filename);
  }

  if (toast) {
    toast({
      title: 'Export successful',
      description: `Parameters exported to ${filename}`,
    });
  }
};

/**
 * Export process data
 * @param {Array} processData - Array of process data objects
 * @param {string} deviceName - Name of the device
 * @param {string} format - Export format ('csv' or 'json')
 * @param {Function} toast - Toast notification function
 */
export const exportProcessData = (processData, deviceName, format, toast) => {
  const filename = createExportFilename(`${deviceName}_processdata`, format);

  if (format === 'csv') {
    exportToCSV(processData, filename);
  } else {
    exportToJSON(processData, filename);
  }

  if (toast) {
    toast({
      title: 'Export successful',
      description: `Process data exported to ${filename}`,
    });
  }
};
