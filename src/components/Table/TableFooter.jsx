import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { calculateSummary } from '../../utils/summaryCalculator';
import { formatNumber } from '../../utils/numberFormatter';

export function TableFooter({ columns, data }) {
  const [selectedSummaries, setSelectedSummaries] = useState({});

  useEffect(() => {
    const defaults = {};
    columns.forEach(column => {
      if (column.defaultSummary) {
        defaults[column.id] = column.defaultSummary;
      }
    });
    setSelectedSummaries(defaults);
  }, [columns]);

  const formatValue = (value, column) => {
    if (column.isNumeric) {
      return formatNumber(value);
    }
    return value;
  };

  const handleSummaryChange = (columnId, type) => {
    setSelectedSummaries(prev => ({
      ...prev,
      [columnId]: type
    }));
  };

  const renderSummaryCell = (column) => {
    if (!column.isSummary) return null;

    const currentSummary = selectedSummaries[column.id];
    const isSingleSummary = column.isSummary.length === 1;

    if (isSingleSummary) {
      const summaryType = column.isSummary[0];
      return (
        <span>
          {formatValue(calculateSummary(data, column.id, summaryType), column)}
        </span>
      );
    }

    return (
      <div className="relative group">
        <div className="flex items-center space-x-2">
          <span>
            {currentSummary ? 
              formatValue(calculateSummary(data, column.id, currentSummary), column) : 
              'Select'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </div>
        <div className="absolute bottom-full left-0  hidden group-hover:block bg-white shadow-lg rounded-md border border-gray-200">
          {column.isSummary.map((type) => (
            <button
              key={type}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100 capitalize"
              onClick={() => handleSummaryChange(column.id, type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <tfoot className="bg-gray-50">
      <tr>
        {columns.map((column) => (
          <td key={column.id} className="px-6 py-3 text-sm font-medium text-gray-900">
            {renderSummaryCell(column)}
          </td>
        ))}
      </tr>
    </tfoot>
  );
}