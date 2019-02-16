import { Component, Input, ElementRef, ViewChild } from '@angular/core'
import { Chart } from 'chart.js'
import { Observable } from 'rxjs';

@Component({
  selector: 'brew-chart',
  templateUrl: './brew-chart.component.html',
  styleUrls: ['./brew-chart.component.scss']
})
export class BrewChartComponent {

  @ViewChild('canvas')
  public chartRef: ElementRef

  @Input('chartId') chartId: string
  @Input('iconPath') iconPath: string
  @Input('title') title: string
  @Input('unit') unit?: string = ""
  @Input('dataService') dataService
  @Input('brewName') brewName: Observable<string>
  @Input('height') height: number
  @Input('lastValueDecimals') lastValueDecimals?: number = 2

  public lastValue: string
  private chart: Chart

  constructor(private elementRef: ElementRef) {
  }

  ngOnChanges(changes) {
    if (changes["brewName"] && this.brewName) {
      this.brewName.subscribe(brewName => {
        this.dataService.fetchAllByUnitName(brewName).subscribe(data => {
          if(this.chart != null) {
            this.chart.destroy()
          }
          this.chart = this.drawChartChart(this.chartId, data.timestamps, data.values)
          this.lastValue = this.round(data.values[data.values.length - 1], this.lastValueDecimals) + this.unit;
        })
      });
    }
  }

  round(value: number, decimals: number): number {
    var multiplier = Math.pow(10, decimals || 0);
    return Math.round(value * multiplier) / multiplier;
  }

  drawChartChart(id: string, timestamps: number[], values: number[]): Chart {
    var chartColor = '#ffce56'
    var fontColor = "#848484"
    var ctx = this.chartRef.nativeElement.getContext('2d');
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [
          {
            data: values,
            borderColor: chartColor,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverBackgroundColor: chartColor,
            pointHoverBorderColor: chartColor,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            type: 'time',
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
              fontColor: fontColor,
            },
            time: {
              displayFormats: {
                'millisecond': 'MMM DD',
                'second': 'MMM DD',
                'minute': 'MMM DD',
                'hour': 'MMM DD',
                'day': 'MMM DD',
                'week': 'MMM DD',
                'month': 'MMM DD',
                'quarter': 'MMM DD',
                'year': 'MMM DD',
              },
              tooltipFormat: 'YYYY/MM/DD HH:mm'
            }
          }],
          yAxes: [{
            display: true,
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
              fontColor: fontColor,
            },
          }],
        }
      }
    });
  }
}
