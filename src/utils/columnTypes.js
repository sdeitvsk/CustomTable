export const ColumnTypes = {
  // Built-in column types
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  
  // Custom column type identifier
  CUSTOM: 'custom'
};

// Column type definitions with default behaviors
export const columnTypeDefinitions = {
  [ColumnTypes.TEXT]: {
    format: (value) => value,
    sort: (a, b) => String(a).localeCompare(String(b))
  },
  [ColumnTypes.NUMBER]: {
    format: (value) => value.toLocaleString(),
    sort: (a, b) => Number(a) - Number(b)
  },
  [ColumnTypes.DATE]: {
    format: (value) => new Date(value).toLocaleDateString(),
    sort: (a, b) => new Date(a) - new Date(b)
  }
};