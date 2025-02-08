import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { formatNumber } from '../../utils/numberFormatter';
import { formatDate } from '../../utils/dateFormatter';
import mockData from '../../data/mockData.json';

function GoogleSheet() {
  const [data, setData] = useState(mockData.transactions);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedCell, setSelectedCell] = useState(null);
  const [showFilters, setShowFilters] = useState({});
  const [summaryType, setSummaryType] = useState({});
  const [openSummaryDropdown, setOpenSummaryDropdown] = useState(null);

  const columns = [
    { id: 'BatchNo', header: 'Batch No', type: 'number', showSummary: true, defaultSummary: 'count' },
    { id: 'Date', header: 'Date', type: 'date' },
    { id: 'Descr', header: 'Description', type: 'text' },
    { id: 'AC_Sub', header: 'Account Sub', type: 'text' },
    { id: 'ACNO', header: 'Account No', type: 'text' },
    { id: 'Status', header: 'Status', type: 'text' },
    { id: 'Debit', header: 'Debit', type: 'number', showSummary: true, defaultSummary: 'sum' },
    { id: 'Credit', header: 'Credit', type: 'number', showSummary: true, defaultSummary: 'sum' }
  ];

  const summaryOptions = [
    { id: 'sum', label: 'Sum' },
    { id: 'avg', label: 'Average' },
    { id: 'count', label: 'Count' }
  ];

  useEffect(() => {
    // Set default summary type for columns with showSummary
    const defaultSummary = {};
    columns.forEach(column => {
      if (column.showSummary) {
        defaultSummary[column.id] = column.defaultSummary || 'sum';
      }
    });
    setSummaryType(defaultSummary);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openSummaryDropdown && !event.target.closest('.summary-dropdown-container')) {
        setOpenSummaryDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openSummaryDropdown]);

  const formatCellValue = (value, type) => {
    if (!value) return '';
    switch (type) {
      case 'number':
        return formatNumber(value);
      case 'date':
        return formatDate(value);
      default:
        return value;
    }
  };

  const calculateSummary = (columnId, type = 'sum') => {
    const values = filteredAndSortedData.map(row => Number(row[columnId]) || 0);
    
    switch (type) {
      case 'sum':
        return values.reduce((sum, val) => sum + val, 0);
      case 'avg':
        return values.length ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
      case 'count':
        return values.length;
      default:
        return 0;
    }
  };

  const getSummaryLabel = (column, type) => {
    const summaryType = type.charAt(0).toUpperCase() + type.slice(1);
    return `${summaryType} of ${column.header}`;
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilter = (columnId, value) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  const toggleFilterMenu = (columnId) => {
    setShowFilters(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const handleSummaryTypeChange = (columnId, type) => {
    setSummaryType(prev => ({
      ...prev,
      [columnId]: type
    }));
    setOpenSummaryDropdown(null);
  };

  const toggleSummaryDropdown = (columnId) => {
    setOpenSummaryDropdown(openSummaryDropdown === columnId ? null : columnId);
  };

  const applyNumericFilter = (value, filterValue, column) => {
    if (!filterValue) return true;
    
    const numValue = Number(value);
    const operator = filterValue.charAt(0);
    const filterNum = Number(filterValue.slice(1));

    if (operator === '>' && !isNaN(filterNum)) {
      return numValue > filterNum;
    } else if (operator === '<' && !isNaN(filterNum)) {
      return numValue < filterNum;
    } else if (operator === '=' && !isNaN(filterNum)) {
      return numValue === filterNum;
    } else if (!isNaN(Number(filterValue))) {
      return String(value).includes(filterValue);
    }

    return true;
  };

  const filteredAndSortedData = React.useMemo(() => {
    let result = [...data];

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        const column = columns.find(col => col.id === key);
        
        if (column.type === 'number') {
          result = result.filter(item => applyNumericFilter(item[key], filters[key], column));
        } else {
          result = result.filter(item => 
            String(item[key]).toLowerCase().includes(filters[key].toLowerCase())
          );
        }
      }
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, filters, sortConfig, columns]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="flex items-center p-2 border-b bg-white">
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Settings2 className="h-5 w-5 text-gray-600" />
        </button>
        <div className="ml-4 text-sm text-gray-600">
          {filteredAndSortedData.length} rows
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse bg-white">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="relative border border-gray-200 bg-gray-50 p-2 text-left font-medium text-gray-600"
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="cursor-pointer"
                      onClick={() => handleSort(column.id)}
                    >
                      {column.header}
                      {sortConfig.key === column.id && (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="inline h-4 w-4 ml-1" /> : 
                          <ChevronDown className="inline h-4 w-4 ml-1" />
                      )}
                    </span>
                    <button
                      onClick={() => toggleFilterMenu(column.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Filter className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  
                  {/* Filter dropdown */}
                  {showFilters[column.id] && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder={column.type === 'number' ? 
                            "Use >, <, or = (e.g., >200)" : 
                            "Filter..."}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                          onChange={(e) => handleFilter(column.id, e.target.value)}
                          value={filters[column.id] || ''}
                        />
                        {column.type === 'number' && (
                          <div className="mt-1 text-xs text-gray-500">
                            {"Examples: >200, <500, =100"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column.id}`}
                    className={`border border-gray-200 p-2 ${
                      selectedCell?.row === rowIndex && selectedCell?.col === column.id
                        ? 'outline outline-2 outline-blue-500'
                        : ''
                    } ${column.type === 'number' ? 'text-right' : ''}`}
                    onClick={() => setSelectedCell({ row: rowIndex, col: column.id })}
                  >
                    {formatCellValue(row[column.id], column.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="p-2 border-t bg-white text-sm text-gray-600">
        {Object.keys(filters).length > 0 && (
          <div className="flex items-center space-x-2">
            <span>Filters active</span>
            <button
              onClick={() => setFilters({})}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Summary Footer - Always visible */}
      <div className="sticky bottom-0 bg-gray-100 border-t border-gray-200 shadow-md">
        <table className="w-full">
          <tbody>
            <tr className="font-medium">
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={`p-2 border-r border-gray-200 ${
                    column.type === 'number' ? 'text-right' : ''
                  }`}
                >
                  {column.showSummary && (
                    <div className="flex flex-col summary-dropdown-container">
                      <div className="relative">
                        <button
                          onClick={() => toggleSummaryDropdown(column.id)}
                          className="flex items-center justify-between w-full text-xs text-gray-500 mb-1 hover:text-gray-700"
                        >
                          <span>{getSummaryLabel(column, summaryType[column.id] || column.defaultSummary || 'sum')}</span>
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </button>
                        {/* Summary type dropdown */}
                        {openSummaryDropdown === column.id && (
                          <div className="absolute bottom-full left-0 mb-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-30">
                            {summaryOptions.map(option => (
                              <button
                                key={option.id}
                                className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100"
                                onClick={() => handleSummaryTypeChange(column.id, option.id)}
                              >
                                {getSummaryLabel(column, option.id)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-gray-900">
                        {formatNumber(calculateSummary(column.id, summaryType[column.id] || column.defaultSummary || 'sum'))}
                      </span>
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GoogleSheet;

export { GoogleSheet }