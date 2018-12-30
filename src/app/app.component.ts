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

  public height: number;

  constructor(private monitoringUnitService: MonitoringUnitService, private batteryService: BatteryService, private angleService: AngleService,
    private temperatureService: TemperatureService, private gravityService: GravityService, private intervalService: IntervalService,
    private rssiService: RSSIService) { }

  ngOnInit() {
    this.fetchAllMonitoringUnits()
      .pipe(map(allUnits => {
        this.allUnits = allUnits as MonitoringUnit[]
        this.brewName = allUnits[0].name
        this.fetchAllBatteryDataByUnitName(this.brewName)
        this.fetchAllAngleDataByUnitName(this.brewName)
        this.fetchAllTemperatureDataByUnitName(this.brewName)
        this.fetchAllGravityDataByUnitName(this.brewName)
        this.fetchLatestIntervalByUnitName(this.brewName)
        this.fetchAllRSSIDataByUnitName(this.brewName)

        this.height = document.getElementById("temperatureChartContainer").clientHeight + document.getElementById("generalInfoContainer").clientHeight
      }))
      .subscribe()
  }

  fetchAllMonitoringUnits(): Observable<any> {
    return this.monitoringUnitService.fetchAll()
  }

  fetchAllBatteryDataByUnitName(unitName: string) {
    this.batteryService.fetchAllByUnitName(unitName).subscribe(batteryData => {
      this.batteryData = batteryData as Battery
      this.drawChartChart("batteryChart", batteryData.timestamps, batteryData.values)
    })
  }

  fetchAllAngleDataByUnitName(unitName: string) {
    this.angleService.fetchAllByUnitName(unitName).subscribe(angleData => {
      this.angleData = angleData as Angle
      this.drawChartChart("angleChart", angleData.timestamps, angleData.values)
    })
  }

  fetchAllTemperatureDataByUnitName(unitName: string) {
    this.temperatureService.fetchAllByUnitName(unitName).subscribe(temperatureData => {
      this.temperatureData = temperatureData as Temperature
      this.drawChartChart("temperatureChart", temperatureData.timestamps, temperatureData.values)
    })
  }

  fetchAllGravityDataByUnitName(unitName: string) {
    this.gravityService.fetchAllByUnitName(unitName).subscribe(gravityData => {
      this.gravityData = gravityData as Gravity
      this.alcoholByVolume = this.calculateAlcoholByVolume(gravityData.values[gravityData.values.length - 1], gravityData.values[0])
      this.daysInFermentation = this.calculateDaysInFermentation(gravityData.timestamps[gravityData.timestamps.length - 1], gravityData.timestamps[0])
      this.drawChartChart("gravityChart", gravityData.timestamps, gravityData.values)
    })
  }

  fetchLatestIntervalByUnitName(unitName: string) {
    this.intervalService.fetchLatestByUnitName(unitName).subscribe(interval => {
      this.updateIntervalMins = this.round(interval.value / 60, 1)
      this.lastUpdatedMins = this.round((Date.now() - interval.timestamp) / (60 * 1000), 0)
      this.isUnitOn = this.lastUpdatedMins - this.updateIntervalMins > 0
    })
  }

  fetchAllRSSIDataByUnitName(unitName: string) {
    this.rssiService.fetchAllByUnitName(unitName).subscribe(rssiData => {
      this.rssiData = rssiData as RSSI
      this.wifiSignalStrengthStatus = this.resolveWifiSignalStrengthStatus(rssiData.values[0])
      this.drawChartChart("rssiChart", rssiData.timestamps, rssiData.values)
    })
  }

  resolveWifiSignalStrengthStatus(lastRSSIValue: number): string {
    if(lastRSSIValue < 70) {
      return 'Very Good'
    } else if(lastRSSIValue < 80) {
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
    return new Chart(id, {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [
          {
            data: values,
            borderColor: "#ffce56",
            borderWidth: 2,
            pointBorderWidth: 1,
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
              fontColor: "#848484",
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
              fontColor: "#848484",
            },
          }],
        }
      }
    });
  }

}
