import * as XLSX from 'xlsx';

export const exportToExcel = (data, columns, title) => {
  // Filter out custom columns and action columns
  const exportableColumns = columns.filter(
    col => col.type !== 'custom' && col.id !== 'actions'
  );

  // Prepare the data for export
  const exportData = data.map(row => {
    const exportRow = {};
    exportableColumns.forEach(col => {
      const value = col.getValue ? col.getValue(row) : row[col.id];
      exportRow[col.header] = value;
    });
    return exportRow;
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Add title to worksheet
  XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: "A1" });
  
  // Merge cells for title
  if(!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: exportableColumns.length - 1 } });

  // Adjust column widths
  const colWidths = exportableColumns.map(col => ({
    wch: Math.max(col.header.length, 15)
  }));
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');

  // Generate Excel file
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};