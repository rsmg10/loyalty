import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-gray-200 bg-white">
      {children}
    </tbody>
  );
}

export function TableRow({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr
      className={onClick ? 'hover:bg-gray-50 cursor-pointer transition-colors' : ''}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-6 py-4 text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  );
}
