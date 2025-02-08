import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TableHeader } from './TableHeader';
import { TableFooter } from './TableFooter';
import { TableFilter } from './TableFilter';
import { ColumnTypes, columnTypeDefinitions } from '../../utils/columnTypes';

export function Table({ data, columns }) {
  const [displayCount, setDisplayCount] = useState(40);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const containerRef = useRef(null);

  const handleSort = (columnId) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (columnId, value) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value.toLowerCase()
    }));
    setDisplayCount(40); // Reset display count when filter changes
  };

  const renderCell = (row, column) => {
    if (column.type === ColumnTypes.CUSTOM && column.render) {
      return <column.render row={row} />;
    }

    const value = column.getValue ? column.getValue(row) : row[column.id];
    const typeDefinition = columnTypeDefinitions[column.type];
    return typeDefinition ? typeDefinition.format(value) : value;
  };

  const filteredData = useMemo(() => {
    return data.filter(row => {
      return Object.entries(filters).every(([columnId, filterValue]) => {
        if (!filterValue) return true;
        const column = columns.find(col => col.id === columnId);
        const value = column.getValue ? column.getValue(row) : row[columnId];
        return String(value).toLowerCase().includes(filterValue);
      });
    });
  }, [data, filters, columns]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const column = columns.find(col => col.id === sortColumn);
      const aValue = column.getValue ? column.getValue(a) : a[sortColumn];
      const bValue = column.getValue ? column.getValue(b) : b[sortColumn];

      const typeDefinition = columnTypeDefinitions[column.type];
      if (typeDefinition) {
        const result = typeDefinition.sort(aValue, bValue);
        return sortDirection === 'asc' ? result : -result;
      }

      return sortDirection === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  const displayedData = useMemo(() => {
    return sortedData.slice(0, displayCount);
  }, [sortedData, displayCount]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      if (scrollPercentage > 0.75 && displayCount < sortedData.length) {
        setDisplayCount(prev => Math.min(prev + 20, sortedData.length));
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [displayCount, sortedData.length]);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col h-[calc(100vh-200px)]">
      <TableFilter columns={columns.filter(col => col.filter)} onFilterChange={handleFilterChange} />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
          <table className="min-w-full table-fixed">
            <colgroup>
              {columns.map((col) => (
                <col key={col.id} style={{ width: col.width || 'auto' }} />
              ))}
            </colgroup>
            <TableHeader
              columns={columns}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
            />
          </table>
        </div>

        {/* Scrollable body */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto"
        >
          <table className="min-w-full table-fixed">
            <colgroup>
              {columns.map((col) => (
                <col key={col.id} style={{ width: col.width || 'auto' }} />
              ))}
            </colgroup>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        column.type === ColumnTypes.NUMBER ? 'text-right' : ''
                      }`}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-gray-50 border-t border-gray-200">
          <table className="min-w-full table-fixed">
            <colgroup>
              {columns.map((col) => (
                <col key={col.id} style={{ width: col.width || 'auto' }} />
              ))}
            </colgroup>
            <TableFooter columns={columns} data={sortedData} />
          </table>
        </div>
      </div>
      {displayCount < sortedData.length && (
        <div className="p-4 text-center text-gray-500 text-sm border-t">
          Showing {displayCount} of {sortedData.length} entries
        </div>
      )}
    </div>
  );
}