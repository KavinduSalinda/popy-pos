export interface ReportFilters {
  fromDate?: string;
  toDate?: string;
  branchId?: string;
}

export interface ReportRow {
  [key: string]: string | number;
}

export interface ReportColumn {
  field: string;
  header: string;
  type?: 'currency' | 'number' | 'date' | 'text';
}

export interface ReportResult {
  columns: ReportColumn[];
  rows: ReportRow[];
  summary?: Record<string, number>;
}
