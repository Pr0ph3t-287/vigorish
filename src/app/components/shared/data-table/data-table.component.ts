import { Component, Input, Output, EventEmitter, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableConfig, SortConfig, PaginationInfo } from '../../../models/data-table.models';
import { DataTableService } from '../../../services/data-table.service';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
})
export class DataTableComponent<T extends { id?: number }> implements OnInit {
  @Input({ required: true }) config!: TableConfig<T>;
  @Output() rowClick = new EventEmitter<T>();
  @Output() createClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<T>();
  @Output() deleteClick = new EventEmitter<T>();

  data = signal<T[]>([]);
  searchTerm = signal('');
  sortConfig = signal<SortConfig>({ column: '', direction: 'asc' });
  isLoading = signal(true);
  error = signal<string | null>(null);

  pagination = signal<PaginationInfo>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });

  constructor(private dataTableService: DataTableService) {}

  ngOnInit(): void {
    this.pagination.update((p) => ({ ...p, itemsPerPage: this.config.itemsPerPage || 10 }));
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dataTableService.getAll<T>(this.config.apiEndpoint).subscribe({
      next: (data) => {
        this.data.set(data);
        this.updatePagination();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load data. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading data:', err);
      },
    });
  }

  filteredData = computed(() => {
    let result = this.data();
    const search = this.searchTerm().toLowerCase().trim();

    // Apply search filter
    if (search) {
      result = result.filter((item) => {
        return this.config.columns.some((col) => {
          if (col.searchable === false) return false;
          const value = this.getNestedValue(item, col.key);
          return value?.toString().toLowerCase().includes(search);
        });
      });
    }

    // Apply sorting
    const sort = this.sortConfig();
    if (sort.column) {
      result = [...result].sort((a, b) => {
        const aVal = this.getNestedValue(a, sort.column);
        const bVal = this.getNestedValue(b, sort.column);

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison = aVal < bVal ? -1 : 1;
        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  });

  paginatedData = computed(() => {
    const filtered = this.filteredData();
    const { currentPage, itemsPerPage } = this.pagination();
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  });

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  getCellValue(row: T, column: any): string {
    const value = this.getNestedValue(row, column.key);
    return column.formatter ? column.formatter(value, row) : value?.toString() || '';
  }

  onSort(column: string): void {
    const current = this.sortConfig();
    if (current.column === column) {
      this.sortConfig.set({
        column,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      this.sortConfig.set({ column, direction: 'asc' });
    }
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pagination.update((p) => ({ ...p, currentPage: 1 }));
    this.updatePagination();
  }

  onPageChange(page: number): void {
    this.pagination.update((p) => ({ ...p, currentPage: page }));
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.pagination.update((p) => ({
      ...p,
      itemsPerPage,
      currentPage: 1,
    }));
    this.updatePagination();
  }

  private updatePagination(): void {
    const totalItems = this.filteredData().length;
    const totalPages = Math.ceil(totalItems / this.pagination().itemsPerPage);
    this.pagination.update((p) => ({ ...p, totalItems, totalPages }));
  }

  onRowClick(row: T): void {
    if (this.config.rowClickable !== false) {
      this.rowClick.emit(row);
    }
  }

  onCreateClick(): void {
    this.createClick.emit();
  }

  onEditClick(row: T, event: Event): void {
    event.stopPropagation();
    this.editClick.emit(row);
  }

  onDeleteClick(row: T, event: Event): void {
    event.stopPropagation();
    this.deleteClick.emit(row);
  }

  getSortIcon(column: string): string {
    const sort = this.sortConfig();
    if (sort.column !== column) return 'bi-arrow-down-up';
    return sort.direction === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  }

  getPageNumbers(): number[] {
    const { currentPage, totalPages } = this.pagination();
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1); // ellipsis
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }

    return pages;
  }

  getPage(): number {
    return Math.min(
      this.pagination().currentPage * this.pagination().itemsPerPage,
      this.pagination().totalItems,
    );
  }
}
