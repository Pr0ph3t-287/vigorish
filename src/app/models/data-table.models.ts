export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  formatter?: (value: any, row: T) => string;
  width?: string;
}

export interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  apiEndpoint: string;
  itemsPerPage?: number;
  searchPlaceholder?: string;
  showCreate?: boolean;
  createButtonText?: string;
  rowClickable?: boolean;
  showActions?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export interface PaginationInfo {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
