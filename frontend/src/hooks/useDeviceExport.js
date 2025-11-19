/**
 * Custom hook for exporting device data to CSV and JSON formats
 */

export const useDeviceExport = (toast) => {
  const exportToCSV = (data, filename) => {
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

  const exportToJSON = (data, filename) => {
    if (!data) return;

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExportParameters = (filteredParameters, device, format) => {
    const filename = `${device.product_name}_parameters_${new Date().toISOString().split('T')[0]}.${format}`;
    if (format === 'csv') {
      exportToCSV(filteredParameters, filename);
    } else {
      exportToJSON(filteredParameters, filename);
    }
    toast({
      title: 'Export successful',
      description: `Parameters exported to ${filename}`,
    });
  };

  const handleExportProcessData = (processData, device, format) => {
    const filename = `${device.product_name}_processdata_${new Date().toISOString().split('T')[0]}.${format}`;
    if (format === 'csv') {
      exportToCSV(processData, filename);
    } else {
      exportToJSON(processData, filename);
    }
    toast({
      title: 'Export successful',
      description: `Process data exported to ${filename}`,
    });
  };

  return {
    exportToCSV,
    exportToJSON,
    handleExportParameters,
    handleExportProcessData,
  };
};
