import React, { useState } from 'react';
import { Table } from './components/Table/Table';
import { GoogleSheet } from './components/GoogleSheet/GoogleSheet';
import { ColumnTypes } from './utils/columnTypes';
import { formatNumber } from './utils/numberFormatter';
import { AlertTriangle, CheckCircle, XCircle, FileDown } from 'lucide-react';
import { exportToExcel } from './utils/excelExport';
import mockData from './data/mockData.json';

// Custom Status Component
const StatusCell = ({ row }) => {
  const status = row.Status?.toLowerCase();
  const statusConfig = {
    active: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    pending: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    inactive: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' }
  };

  const config = statusConfig[status] || statusConfig.inactive;
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-2 ${config.color}`}>
      <Icon className="h-4 w-4" />
      <span className={`px-2 py-1 rounded-full text-sm ${config.bg} ${config.color}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    </div>
  );
};

// Custom Balance Component
const CustomBalance = ({ row }) => {
  const debit = Number(row.Debit) || 0;
  const credit = Number(row.Credit) || 0;
  const balance = credit - debit;
  const isPositive = balance >= 0;

  return (
    <div className={`flex items-center justify-end ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      <span className="font-medium">{formatNumber(Math.abs(balance))}</span>
      <span className="ml-2">{isPositive ? 'CR' : 'DR'}</span>
    </div>
  );
};

// Custom Action Buttons Component
const ActionButtons = ({ row }) => {
  const handleView = () => console.log('View:', row);
  const handleEdit = () => console.log('Edit:', row);
  const handleDelete = () => console.log('Delete:', row);

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleView}
        className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800"
      >
        View
      </button>
      <button
        onClick={handleEdit}
        className="px-2 py-1 text-xs font-medium text-green-600 hover:text-green-800"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800"
      >
        Delete
      </button>
    </div>
  );
};

function App() {
  const [activeView, setActiveView] = useState('table'); // 'table' or 'sheet'
  const title = "Transaction Records Report";

  const columns = [
    { 
      id: 'BatchNo', 
      header: 'Batch No', 
      type: ColumnTypes.NUMBER,
      isSummary: ['sum', 'count'],
      defaultSummary: 'sum'
    },
    { 
      id: 'Date', 
      header: 'Date',
      type: ColumnTypes.DATE
    },
    { 
      id: 'Descr', 
      header: 'Description', 
      type: ColumnTypes.TEXT,
      filter: true,
      isSummary: ['count'] 
    },
    { 
      id: 'AC_Sub', 
      header: 'Account Sub', 
      type: ColumnTypes.TEXT,
      filter: true,
      isSummary: ['count'] 
    },
    { 
      id: 'ACNO', 
      header: 'Account No', 
      type: ColumnTypes.TEXT,
      filter: true 
    },
    { 
      id: 'Status',
      header: 'Status',
      type: ColumnTypes.CUSTOM,
      render: StatusCell,
      filter: true
    },
    { 
      id: 'Debit', 
      header: 'Debit', 
      type: ColumnTypes.NUMBER,
      isSummary: ['sum', 'avg', 'max', 'min'],
      defaultSummary: 'sum'
    },
    { 
      id: 'Credit', 
      header: 'Credit', 
      type: ColumnTypes.NUMBER,
      isSummary: ['sum', 'avg', 'max', 'min'],
      defaultSummary: 'sum'
    },
    {
      id: 'balance',
      header: 'Balance',
      type: ColumnTypes.CUSTOM,
      render: CustomBalance,
      isSummary: ['sum'],
      defaultSummary: 'sum',
      getValue: (row) => Number(row.Credit) - Number(row.Debit)
    },
    {
      id: 'actions',
      header: 'Actions',
      type: ColumnTypes.CUSTOM,
      render: ActionButtons
    }
  ];

  const handleExport = () => {
    exportToExcel(mockData.transactions, columns, title);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* View Toggle */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-4">
            <button
              onClick={() => setActiveView('table')}
              className={`px-4 py-2 rounded-md ${
                activeView === 'table'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setActiveView('sheet')}
              className={`px-4 py-2 rounded-md ${
                activeView === 'sheet'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sheet View
            </button>
          </div>
        </div>
      </div>

      {activeView === 'table' ? (
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export to Excel
              </button>
            </div>
            <Table data={mockData.transactions} columns={columns} />
          </div>
        </div>
      ) : (
        <GoogleSheet />
      )}
    </div>
  );
}

export default App;