import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ReportService } from '../../services/report.service';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-report-stats',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseChartDirective],
  templateUrl: './report-stats.component.html',
  styleUrls: ['./report-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ provideCharts(withDefaultRegisterables()) ]
})
export class ReportStatsComponent implements OnInit {
  filterForm: FormGroup;
  loading = false;
  error: string | null = null;
  stats: any = null;
  cache = new Map<string, any>();
  // barrios removed: reports are not filtered by barrio anymore

  // Chart placeholders (use any to avoid chart.js dependency until installed)
  pieChartData: any = null;
  pieChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
      tooltip: { enabled: true }
    }
  };

  barChartData: any = null;
  barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: {}, y: { beginAtZero: true } },
    plugins: { legend: { display: false }, tooltip: { enabled: true } }
  };

  lineChartData: any = null;
  lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: {}, y: { beginAtZero: true } },
    plugins: { legend: { position: 'top' }, tooltip: { enabled: true } }
  };

  constructor(private fb: FormBuilder, private reportService: ReportService, private cdr: ChangeDetectorRef) {
    this.filterForm = this.fb.group({
      startDate: [null],
      endDate: [null],
      status: ['']
    });
  }

  ngOnInit() {
    // Load global statistics on component init (no filters)
    this.loadAllStatistics();

    // Also keep reactive filter behavior for filtered stats if user changes dates
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      tap(() => { this.loading = true; this.error = null; }),
      switchMap(filters => {
        const key = JSON.stringify(filters);
        if (this.cache.has(key)) {
          this.stats = this.cache.get(key);
          console.log('[ReportStats] cache hit', this.stats);
          this.mapStatsToCharts(this.stats);
          this.loading = false;
          this.cdr.markForCheck();
          return of(null);
        }
        console.log('[ReportStats] calling getStats with', filters);
        return this.reportService.getStats(filters).pipe(
          tap(data => {
            console.log('[ReportStats] getStats response', data);
            this.stats = data;
            this.cache.set(key, data);
            this.mapStatsToCharts(data);
            this.loading = false;
            this.cdr.markForCheck();
          }),
          catchError(err => {
            console.error('[ReportStats] getStats error', err);
            this.error = 'Error al cargar estadísticas';
            this.loading = false;
            this.cdr.markForCheck();
            return of(null);
          })
        );
      })
    ).subscribe();
    this.filterForm.patchValue({ startDate: this.getDefaultStart(), endDate: this.getDefaultEnd() }, { emitEvent: true });
  }

  private loadAllStatistics() {
    this.loading = true;
    this.reportService.getStatistics().pipe(
      catchError((err) => {
        this.error = 'No se pudieron cargar las estadísticas generales';
        this.loading = false;
        console.error('[ReportStats] getStatistics error', err);
        return of(null);
      })
    ).subscribe(data => {
      if (data) {
        // Map the flat statistics response to the shapes used by mapStatsToCharts
        // Expected payload example:
        // { total, pending, inReview, resolved, rejected, criticalPoints, calendarNonCompliance }
        const normalized = {
          total: data.total,
          byStatus: {
            PENDIENTE: data.pending ?? 0,
            EN_REVISION: data.inReview ?? 0,
            RESUELTO: data.resolved ?? 0,
            RECHAZADO: data.rejected ?? 0
          },
          criticalPoints: data.criticalPoints,
          calendarNonCompliance: data.calendarNonCompliance
        };
        this.stats = { ...data, ...normalized };
        console.log('[ReportStats] getStatistics response', this.stats);
        this.mapStatsToCharts(this.stats);
      }
      this.loading = false;
      this.cdr.markForCheck();
    });
  }


  private mapStatsToCharts(data: any) {
    if (!data) {
      this.pieChartData = null;
      this.barChartData = null;
      this.lineChartData = null;
      return;
    }

    // Pie: reportes por estado
    const byStatus = data.byStatus || data.statusCounts || {};
    const pieLabels = Object.keys(byStatus);
    const pieValues = pieLabels.map(k => byStatus[k] || 0);
    this.pieChartData = { labels: pieLabels, datasets: [{ data: pieValues, backgroundColor: ['#059669', '#f59e0b', '#ef4444', '#3b82f6'] }] };

    // Bar: reportes por barrio
    const byBarrio = data.byBarrio || data.barrioCounts || [];
    const barLabels = Array.isArray(byBarrio) ? byBarrio.map((b: any) => b.name || b.barrio) : Object.keys(byBarrio);
    const barValues = Array.isArray(byBarrio) ? byBarrio.map((b: any) => b.count || b.total || 0) : barLabels.map((k: any) => byBarrio[k] || 0);
    this.barChartData = { labels: barLabels, datasets: [{ label: 'Reportes', data: barValues, backgroundColor: '#059669' }] };

    // Line: tendencia en el tiempo
    const trend = data.trend || data.timeSeries || [];
    const lineLabels = Array.isArray(trend) ? trend.map((t: any) => t.label || t.date) : [];
    const lineValues = Array.isArray(trend) ? trend.map((t: any) => t.count || t.value || 0) : [];
    this.lineChartData = { labels: lineLabels, datasets: [{ label: 'Tendencia', data: lineValues, borderColor: '#3b82f6', fill: false }] };

    // KPIs
    this.stats.total = data.total ?? (pieValues.reduce((s, v) => s + v, 0));
    const resolvedCount = (byStatus.RESUELTO ?? byStatus.Resuelto ?? byStatus.resuelto ?? 0) as number;
    const totalCount = Math.max(this.stats.total || 0, 1);
    this.stats.percentResolved = data.percentResolved ?? Number(((resolvedCount / totalCount) * 100).toFixed(1));
    this.stats.percentPending = data.percentPending ?? Number((100 - (this.stats.percentResolved || 0)).toFixed(1));
    this.stats.avgResolutionTime = data.avgResolutionTime ?? data.avgHoursToResolve ?? null;
  }

  refresh() {
    // invalidar cache y volver a disparar
    this.cache.clear();
    this.filterForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }

  exportCSV() {
    if (!this.stats) return;
    // Exportar por ejemplo la tabla por barrio
    const rows: string[] = [];
    rows.push('Barrio,Count');
    const byBarrio = this.stats.byBarrio || this.stats.barrioCounts || [];
    if (Array.isArray(byBarrio)) {
      byBarrio.forEach((b: any) => rows.push(`${(b.name || b.barrio) ?? ''},${b.count ?? b.total ?? 0}`));
    } else {
      Object.keys(byBarrio).forEach(k => rows.push(`${k},${byBarrio[k]}`));
    }
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-stats-${this.filterForm.value.startDate || 'all'}-to-${this.filterForm.value.endDate || 'all'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getDefaultStart() {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().substring(0, 10);
  }
  getDefaultEnd() {
    return new Date().toISOString().substring(0, 10);
  }
}
