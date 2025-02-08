import React from 'react';
import { Search } from 'lucide-react';

export function TableFilter({ columns, onFilterChange }) {
  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex flex-wrap gap-4">
        {columns.filter(col => col.filter).map((column) => (
          <div key={column.id} className="flex-1 min-w-[200px]">
            <label htmlFor={column.id} className="block text-sm font-medium text-gray-700">
              {column.header}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id={column.id}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder={`Filter by ${column.header.toLowerCase()}`}
                onChange={(e) => onFilterChange(column.id, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}