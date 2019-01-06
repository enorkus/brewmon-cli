import { Component, OnInit } from '@angular/core'
import { Battery } from './battery/battery'
import { BatteryService } from './battery/battery.service'
import { MonitoringUnit } from './monitoring-unit/monitoring-unit'
import { MonitoringUnitService } from './monitoring-unit/monitoring-unit.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Angle } from './angle/angle'
import { AngleService } from './angle/angle.service'
import { Temperature } from './temperature/temperature'
import { TemperatureService } from './temperature/temperature.service'
import { Gravity } from './gravity/gravity'
import { GravityService } from './gravity/gravity.service'
import { Interval } from './interval/interval'
import { IntervalService } from './interval/interval.service'
import { RSSI } from './rssi/rssi'
import { RSSIService } from './rssi/rssi.service'
import { Chart } from 'chart.js'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [BatteryService, MonitoringUnitService, AngleService, TemperatureService, GravityService, IntervalService, RSSIService],
})
export class AppComponent implements OnInit {

  public allUnits: MonitoringUnit[]
  public batteryData: Battery
  public angleData: Angle
  public temperatureData: Temperature
  public gravityData: Gravity
  public interval: Interval
  public rssiData: RSSI

  public brewName: string
  public alcoholByVolume: number
  public daysInFermentation: number
  public updateIntervalMins: number
  public lastUpdatedMins: number
  public wifiSignalStrengthStatus: string
  public isUnitOn: boolean

  public lastTemperature: number
  public lastGravity: number
  public lastBattery: number
  public lastRSSI: number
  public lastAngle: number

  public alcoholByVolumeLoading: boolean
  public daysInFermentationLoading: boolean
  public updateIntervalMinsLoading: boolean
  public lastUpdatedMinsLoading: boolean
  public wifiSignalStrengthStatusLoading: boolean

  private temperatureChart: Chart
  private gravityChart: Chart
  private batteryChart: Chart
  private RSSIChart: Chart
  private angleChart: Chart

  public height: number
  public mainContainerClassName: string = 'main'
  public chooseBrewModalClassName: string = 'chooseBrewModalHidden'

  constructor(private monitoringUnitService: MonitoringUnitService, private batteryService: BatteryService, private angleService: AngleService,
    private temperatureService: TemperatureService, private gravityService: GravityService, private intervalService: IntervalService,
    private rssiService: RSSIService) { }

  ngOnInit() {
    this.fetchAllMonitoringUnits()
      .subscribe(allUnits => {
        this.allUnits = allUnits as MonitoringUnit[]
        this.brewName = allUnits[0].name
      },
        error => console.log('Error'),
        () => {
          this.populateAllChartsAndDataFields(this.brewName)
        }
      )
  }

  fetchAllMonitoringUnits(): Observable<any> {
    return this.monitoringUnitService.fetchAll()
  }

  populateAllChartsAndDataFields(brewName: string) {
    this.resetLoaders()
    this.brewName = brewName
    this.loadBatteryData(this.brewName)
    this.loadAngleData(this.brewName)
    this.loadTemperatureData(this.brewName)
    this.loadGravityData(this.brewName)
    this.loadIntervalData(this.brewName)
    this.loadRSSIData(this.brewName)
    this.height = document.getElementById("temperatureChartContainer").clientHeight + document.getElementById("generalInfoContainer").clientHeight
  }

  resetLoaders() {
    this.alcoholByVolumeLoading = true
    this.daysInFermentationLoading = true
    this.updateIntervalMinsLoading = true
    this.lastUpdatedMinsLoading = true
    this.wifiSignalStrengthStatusLoading = true
  }

  loadBatteryData(unitName: string) {
    this.batteryService.fetchAllByUnitName(unitName).subscribe(batteryData => {
      this.batteryData = batteryData as Battery
      this.lastBattery = this.round(batteryData.values[batteryData.values.length - 1], 2)
      this.lastUpdatedMins = this.round((Date.now() - batteryData.timestamps[batteryData.timestamps.length - 1]) / (60 * 1000), 0)
      this.batteryChart = this.drawChartChart("batteryChart", batteryData.timestamps, batteryData.values)
      this.lastUpdatedMinsLoading = false
    })
  }

  loadAngleData(unitName: string) {
    this.angleService.fetchAllByUnitName(unitName).subscribe(angleData => {
      this.angleData = angleData as Angle
      this.lastAngle = this.round(angleData.values[angleData.values.length - 1], 2)
      this.angleChart = this.drawChartChart("angleChart", angleData.timestamps, angleData.values)
    })
  }

  loadTemperatureData(unitName: string) {
    this.temperatureService.fetchAllByUnitName(unitName).subscribe(temperatureData => {
      this.temperatureData = temperatureData as Temperature
      this.lastTemperature = this.round(temperatureData.values[temperatureData.values.length - 1], 2)
      this.temperatureChart = this.drawChartChart("temperatureChart", temperatureData.timestamps, temperatureData.values)
    })
  }

  loadGravityData(unitName: string) {
    this.gravityService.fetchAllByUnitName(unitName).subscribe(gravityData => {
      this.gravityData = gravityData as Gravity

      this.alcoholByVolume = this.calculateAlcoholByVolume(gravityData.values[0], gravityData.values[gravityData.values.length - 1])
      this.alcoholByVolumeLoading = false

      this.daysInFermentation = this.calculateDaysInFermentation(gravityData.timestamps[0], gravityData.timestamps[gravityData.timestamps.length - 1])
      this.daysInFermentationLoading = false

      this.lastGravity = this.round(gravityData.values[gravityData.values.length - 1], 4)
      this.gravityChart = this.drawChartChart("gravityChart", gravityData.timestamps, gravityData.values)
    })
  }

  loadIntervalData(unitName: string) {
    this.intervalService.fetchLatestByUnitName(unitName).subscribe(interval => {
      this.updateIntervalMins = this.round(interval.value / 60, 1)
      this.updateIntervalMinsLoading = false

      this.isUnitOn = this.updateIntervalMins - this.lastUpdatedMins > 0
    })
  }

  loadRSSIData(unitName: string) {
    this.rssiService.fetchAllByUnitName(unitName).subscribe(rssiData => {
      this.rssiData = rssiData as RSSI
      this.wifiSignalStrengthStatus = this.resolveWifiSignalStrengthStatus(rssiData.values[0])
      this.wifiSignalStrengthStatusLoading = false

      this.lastRSSI = rssiData.values[rssiData.values.length - 1]
      this.RSSIChart = this.drawChartChart("rssiChart", rssiData.timestamps, rssiData.values)
    })
  }

  onMenuOpenClick() {
    this.mainContainerClassName = 'mainBlurred'
    this.chooseBrewModalClassName = 'chooseBrewModalVisible'
  }

  onMenuCloseClick() {
    this.mainContainerClassName = 'main'
    this.chooseBrewModalClassName = 'chooseBrewModalHidden'
  }

  onChooseBrewClick(brewName: string) {
    this.resetLoaders()
    this.destroyCharts()
    this.onMenuCloseClick()
    this.populateAllChartsAndDataFields(brewName)
  }

  destroyCharts() {
    this.temperatureChart.destroy()
    this.gravityChart.destroy()
    this.batteryChart.destroy()
    this.RSSIChart.destroy()
    this.angleChart.destroy()
  }

  getDisplayValue(name: string) {
    return name.replace(/_/g, " ")
  }

  resolveWifiSignalStrengthStatus(lastRSSIValue: number): string {
    if (lastRSSIValue < 70) {
      return 'Excellent'
    } else if (lastRSSIValue < 80) {
      return "Good"
    } else if (lastRSSIValue < 90) {
      return 'Poor'
    }
    return 'Unusable'
  }

  calculateAlcoholByVolume(originalGravity: number, finalGravity: number): number {
    var alcoholByVolume = (originalGravity - finalGravity) * 131.25
    return this.round(alcoholByVolume, 2)
  }

  calculateDaysInFermentation(startTimestamp: number, lastTimestamp: number): number {
    return this.round((lastTimestamp - startTimestamp) / (24 * 60 * 60 * 1000), 0)
  }

  round(value: number, decimals: number): number {
    var multiplier = Math.pow(10, decimals || 0);
    return Math.round(value * multiplier) / multiplier;
  }

  drawChartChart(id: string, timestamps: number[], values: number[]): Chart {
    var chartColor = '#ffce56'
    var fontColor = "#848484"
    return new Chart(id, {
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
