import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  headerClass?: string;
  cellClass?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './data-table.html'
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() pageSize = 10;
  @Input() isLoading = false;
  @Input() error = '';
  @Input() emptyMessage = 'No hay registros';
  @Input() emptyIcon = 'folder';
  @Input() trackByKey = 'id';

  /** Custom cell template: let-row let-col="column" */
  @ContentChild('cellTemplate') cellTemplate!: TemplateRef<any>;
  /** Custom actions column template: let-row */
  @ContentChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

  @Output() rowClick = new EventEmitter<any>();

  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.data.length / this.pageSize) || 1;
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.data.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1); // ellipsis
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push(-1); // ellipsis
      pages.push(total);
    }
    return pages;
  }

  get rangeStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.data.length);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onDataChange(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  trackByFn(_index: number, item: any): any {
    return item[this.trackByKey] ?? _index;
  }

  getCellValue(row: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], row);
  }

  getAlignClass(col: TableColumn): string {
    if (col.align === 'center') return 'text-center';
    if (col.align === 'right') return 'text-right';
    return 'text-left';
  }
}
