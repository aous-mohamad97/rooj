import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database, RefreshCw } from 'lucide-react';

interface TableData {
  tableName: string;
  data: any[];
  count: number;
}

export function DataViewer() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const tableNames = ['pages', 'products', 'site_settings'];
      const tableDataPromises = tableNames.map(async (tableName) => {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' });

        if (error) {
          throw new Error(`Error loading ${tableName}: ${error.message}`);
        }

        return {
          tableName,
          data: data || [],
          count: count || 0,
        };
      });

      const results = await Promise.all(tableDataPromises);
      setTables(results);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    return String(value);
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="animate-spin mx-auto mb-4 text-[#5f031a]" size={32} />
        <div className="text-[#5f031a]">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button
          onClick={loadAllData}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-[#5f031a] flex items-center space-x-2">
          <Database size={24} />
          <span>Database Viewer</span>
        </h2>
        <button
          onClick={loadAllData}
          className="flex items-center space-x-2 bg-[#5f031a] text-[#FCF6E1] px-4 py-2 rounded-lg hover:bg-[#8d1a2f] transition-colors"
        >
          <RefreshCw size={18} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        {tables.map((table) => (
          <div
            key={table.tableName}
            className="bg-[#FCF6E1] rounded-lg border border-[#5f031a]/20 overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedTable(expandedTable === table.tableName ? null : table.tableName)
              }
              className="w-full flex items-center justify-between p-4 hover:bg-[#5f031a]/5 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-[#5f031a] text-[#FCF6E1] px-3 py-1 rounded font-mono text-sm">
                  {table.tableName}
                </div>
                <span className="text-sm text-gray-600">
                  {table.count} {table.count === 1 ? 'record' : 'records'}
                </span>
              </div>
              <span className="text-[#5f031a] font-medium">
                {expandedTable === table.tableName ? '▼' : '▶'}
              </span>
            </button>

            {expandedTable === table.tableName && (
              <div className="border-t border-[#5f031a]/20 p-4 bg-white">
                {table.data.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No data in this table</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(table.data[0] || {}).map((key) => (
                            <th
                              key={key}
                              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {table.data.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            {Object.entries(row).map(([key, value]) => (
                              <td
                                key={key}
                                className="px-4 py-3 text-sm text-gray-700 max-w-xs"
                              >
                                <div className="truncate" title={formatValue(value)}>
                                  {key.includes('date') || key.includes('created_at') || key.includes('updated_at') ? (
                                    <span className="text-blue-600">{formatDate(formatValue(value))}</span>
                                  ) : typeof value === 'object' ? (
                                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-w-md">
                                      {formatValue(value)}
                                    </pre>
                                  ) : (
                                    <span>{formatValue(value)}</span>
                                  )}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Click on any table name to expand and view its data. 
          Use the refresh button to reload all data from Supabase.
        </p>
      </div>
    </div>
  );
}

