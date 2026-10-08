// ============================================================================
// ISML COLLEGE LMS — REUSABLE DATA TABLE COMPONENT
// Production-grade Search, Filter, Sort, Pagination & Mobile-first Card Adaptability
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T | ((row: T) => string);
  filters?: FilterOption[];
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  isLoading?: boolean;
  pageSize?: number;
  mobileCardRender?: (row: T) => React.ReactNode;
  headerActions?: React.ReactNode;
}

export default function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchKey,
  filters = [],
  rowKey,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.',
  isLoading = false,
  pageSize = 8,
  mobileCardRender,
  headerActions,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter handler
  const handleFilterChange = (filterKey: string, val: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterKey]: val,
    }));
    setCurrentPage(1);
  };

  // Sort handler
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Process data (Search -> Filter -> Sort)
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => {
        if (typeof searchKey === 'function') {
          return searchKey(item).toLowerCase().includes(q);
        }
        if (searchKey) {
          const val = item[searchKey];
          return val ? String(val).toLowerCase().includes(q) : false;
        }
        // Fallback: search across all string fields
        return Object.values(item as Record<string, unknown>).some((val) =>
          typeof val === 'string' || typeof val === 'number'
            ? String(val).toLowerCase().includes(q)
            : false
        );
      });
    }

    // Filters
    Object.entries(activeFilters).forEach(([fKey, fVal]) => {
      if (fVal && fVal !== 'ALL') {
        result = result.filter((item) => {
          const rec = item as Record<string, unknown>;
          return String(rec[fKey]) === fVal;
        });
      }
    });

    // Sorting
    if (sortKey) {
      result.sort((a, b) => {
        const valA = (a as Record<string, unknown>)[sortKey];
        const valB = (b as Record<string, unknown>)[sortKey];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        const compare =
          typeof valA === 'string'
            ? (valA as string).localeCompare(String(valB))
            : (valA as number) > (valB as number)
            ? 1
            : -1;

        return sortDirection === 'asc' ? compare : -compare;
      });
    }

    return result;
  }, [data, searchQuery, searchKey, activeFilters, sortKey, sortDirection]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="space-y-3 font-sans">
      {/* ─── Top Control Toolbar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
        {/* Search & Dynamic Filter Selects */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC] transition-all"
            />
          </div>

          {/* Filters */}
          {filters.map((filter) => (
            <div key={filter.key} className="relative shrink-0">
              <select
                value={activeFilters[filter.key] || 'ALL'}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer"
              >
                <option value="ALL">{filter.label}: All</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Optional Action Button Container */}
        {headerActions && <div className="shrink-0 flex items-center gap-2">{headerActions}</div>}
      </div>

      {/* ─── Table Content (Desktop & Tablet) ─── */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200">
              <tr>
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={`px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap ${
                        col.className || ''
                      } ${
                        col.sortable ? 'cursor-pointer select-none hover:text-[#0052CC] hover:bg-slate-100/70 transition-colors' : ''
                      }`}
                    >
                      <div className={`flex items-center gap-1.5 ${col.className?.includes('text-right') ? 'justify-end' : ''}`}>
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="text-slate-400">
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-[#0052CC]" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-[#0052CC]" />
                              )
                            ) : (
                              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100/90 bg-white">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((_, cIdx) => (
                      <td key={cIdx} className="px-4 py-4">
                        <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <tr
                    key={rowKey(row)}
                    className="hover:bg-blue-50/30 transition-colors duration-150 group"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 text-xs text-slate-700 align-middle ${col.className || ''}`}
                      >
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-12 text-center">
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Mobile View: Touch-Friendly Card List ─── */}
      <div className="block md:hidden space-y-2.5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
              <div className="h-3 bg-slate-100 rounded-md w-3/4"></div>
            </div>
          ))
        ) : paginatedData.length > 0 ? (
          paginatedData.map((row) => (
            <div
              key={rowKey(row)}
              className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2"
            >
              {mobileCardRender ? (
                mobileCardRender(row)
              ) : (
                <div className="space-y-1.5">
                  {columns.map((col) => (
                    <div key={col.key} className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">{col.header}:</span>
                      <span className="font-semibold text-slate-800">
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key] ?? '—')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        )}
      </div>

      {/* ─── Pagination Footer ─── */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-500">
          <p>
            Showing{' '}
            <span className="font-bold text-slate-700">
              {(currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-slate-700">
              {Math.min(currentPage * pageSize, filteredData.length)}
            </span>{' '}
            of <span className="font-bold text-slate-700">{filteredData.length}</span> entries
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
