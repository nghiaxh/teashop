import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T, index: number) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'Không có dữ liệu',
}: DataTableProps<T>) {
  return (
    <div className="bg-content1 rounded-2xl border border-divider overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-divider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`text-left px-4 py-3 text-xs font-medium text-foreground/50 uppercase tracking-wider ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-foreground/40 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={keyExtractor(item, idx)}
                  className="border-b border-divider/50 last:border-b-0 hover:bg-content2/50 transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-sm ${col.className ?? ''}`}>
                      {col.render(item, idx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
