export const calculateSummary = (data, columnId, type) => {
  if (!data.length) return 0;
  
  const values = data.map(row => Number(row[columnId]) || 0);
  
  switch (type) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'count':
      return data.length;
    case 'max':
      return Math.max(...values);
    case 'min':
      return Math.min(...values);
    default:
      return 0;
  }
};