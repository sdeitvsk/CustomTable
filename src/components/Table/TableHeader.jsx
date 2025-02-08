import React from 'react';

export function TableHeader({ columns, onSort, sortColumn, sortDirection }) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {columns.map((column) => (
          <th
            key={column.id}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            onClick={() => onSort?.(column.id)}
          >
            <div className="flex items-center space-x-1">
              <span>{column.header}</span>
              {sortColumn === column.id && (
                <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}