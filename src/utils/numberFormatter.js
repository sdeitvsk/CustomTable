export const formatNumber = (value, options = {}) => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  });
};