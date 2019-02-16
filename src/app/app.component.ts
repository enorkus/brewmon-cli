import { Component, enableProdMode, OnInit } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { AngleService } from './angle/angle.service';
import { BatteryService } from './battery/battery.service';
import { GravityService } from './gravity/gravity.service';
import { MonitoringUnit } from './monitoring-unit/monitoring-unit';
import { MonitoringUnitService } from './monitoring-unit/monitoring-unit.service';
import { RSSIService } from './rssi/rssi.service';
import { TemperatureService } from './temperature/temperature.service';

if (environment.production) {
  enableProdMode();
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [BatteryService, MonitoringUnitService, AngleService, TemperatureService, GravityService, RSSIService],
})
export class AppComponent implements OnInit {

  public brewName: Observable<string>
  public brew: MonitoringUnit
  public allUnits: MonitoringUnit[]
  
  public alcoholByVolume: string
  public daysInFermentation: string
  public updateIntervalMins: string
  public lastUpdated: string
  public wifiSignalStrengthStatus: string

  public alcoholByVolumeLoading: boolean = true
  public daysInFermentationLoading: boolean = true
  public updateIntervalMinsLoading: boolean = true
  public lastUpdatedLoading: boolean = true
  public wifiSignalStrengthStatusLoading: boolean = true

  public height: number
  public mainContainerClassName: string = 'main'
  public chooseBrewModalClassName: string = 'chooseBrewModalHidden'
  public static readonly SELECTED_BREW_KEY: string = "selectedBrew"

  constructor(private monitoringUnitService: MonitoringUnitService, public batteryService: BatteryService, public angleService: AngleService,
    public temperatureService: TemperatureService, public gravityService: GravityService, public rssiService: RSSIService, private storage: LocalStorageService) { }

  ngOnInit() {

    var selectedBrew = this.storage.retrieve(AppComponent.SELECTED_BREW_KEY)

    this.fetchAllMonitoringUnits()
      .subscribe(allUnits => {
        this.allUnits = allUnits.sort((a,b) => a.lastUpdatedMillis < b.lastUpdatedMillis ? 1 : a.lastUpdatedMillis == b.lastUpdatedMillis? 0 : -1)
        if (selectedBrew) {
          this.brew = allUnits.find(unit => unit.name === selectedBrew)
        } else {
          this.brew = allUnits[0]
        }
        this.brewName = of(this.brew.name)
      },
        error => console.log('Error'),
        () => {
          this.populateAllChartsAndDataFields(this.brew)
        }
      )
  }

  fetchAllMonitoringUnits(): Observable<any> {
    return this.monitoringUnitService.fetchAll()
  }

  populateAllChartsAndDataFields(brew: MonitoringUnit) {
    this.storage.store(AppComponent.SELECTED_BREW_KEY, brew.name)
    this.resetLoaders()
    this.brew = brew
    this.setDetailsValues(this.brew)
    
    var bodyWidth = document.getElementsByTagName("body")[0].clientWidth
    if (bodyWidth > 1135) {
      this.height = document.getElementById("temperatureChart").clientHeight + 20 + document.getElementById("generalInfoContainer").clientHeight
    }
  }

  resetLoaders() {
    this.alcoholByVolumeLoading = true
    this.daysInFermentationLoading = true
    this.updateIntervalMinsLoading = true
    this.lastUpdatedLoading = true
    this.wifiSignalStrengthStatusLoading = true
  }

  setDetailsValues(brew: MonitoringUnit) {
    this.setAlcoholByVolumeDisplayValue(brew.alcoholByVolume)
    this.setUpdateIntervalDisplayValue(brew.updateIntervalMins)
    this.setLastUpdatedDisplayValue(brew.lastUpdatedMillis)
    this.setWifiSignalStrengthStatusDisplayValue(brew.lastRSSI)
    this.setDaysInFermentationDisplayValue(brew.inFermentationDays)
  }

  setAlcoholByVolumeDisplayValue(alcoholByVolume: number) {
      this.alcoholByVolume = this.round(alcoholByVolume, 2) + "%"
      this.alcoholByVolumeLoading = false
  }

  setDaysInFermentationDisplayValue(daysInFermentation: number) {
    this.daysInFermentation = (daysInFermentation > 0 ? daysInFermentation : 1) + " day" + (daysInFermentation > 1 ? "s" : "")
    this.daysInFermentationLoading = false
  }

  setUpdateIntervalDisplayValue(updateIntervalMins: number) {
    this.updateIntervalMins = updateIntervalMins + " min" + (updateIntervalMins > 1 ? "s" : "")
    this.updateIntervalMinsLoading = false
  }

  setLastUpdatedDisplayValue(timestamp: number) {
    var lastUpdatedMins = this.round((Date.now() - timestamp) / (60 * 1000), 0)
    var lastUpdatedHours = this.round(lastUpdatedMins / 60, 0)
    var lastUpdatedDays = this.round(lastUpdatedHours / 24, 0)
    var lastUpdatedMonths = this.round(lastUpdatedDays / 30, 0)
    var lastUpdatedYears = this.round(lastUpdatedMonths / 12, 0)

    if (lastUpdatedMins < 1) {
      this.lastUpdated = "Just now"
      this.lastUpdatedLoading = false
      return
    } else if (lastUpdatedMins < 60) {
      this.lastUpdated = lastUpdatedMins + " min" + (lastUpdatedMins == 1 ? "" : "s")
    } else if (lastUpdatedHours < 24) {
      this.lastUpdated = lastUpdatedHours + " hour" + (lastUpdatedHours == 1 ? "" : "s")
    } else if (lastUpdatedDays < 30) {
      this.lastUpdated = lastUpdatedDays + " day" + (lastUpdatedDays == 1 ? "" : "s")
    } else if (lastUpdatedMonths < 12) {
      this.lastUpdated = lastUpdatedMonths + " month" + (lastUpdatedMonths == 1 ? "" : "s")
    } else {
      this.lastUpdated = lastUpdatedYears + " year" + (lastUpdatedYears == 1 ? "" : "s")
    }
    this.lastUpdated = this.lastUpdated + " ago"
    this.lastUpdatedLoading = false
  }

  setWifiSignalStrengthStatusDisplayValue(RSSI: number) {
    this.wifiSignalStrengthStatus = this.resolveWifiSignalStrengthStatus(RSSI)
    this.wifiSignalStrengthStatusLoading = false
  }

  onMenuOpenClick() {
    setTimeout(() => {
      this.mainContainerClassName = 'mainBlurred'
    }, 100)
    setTimeout(() => {
      this.chooseBrewModalClassName = 'chooseBrewModalVisible'
    }, 300)
  }

  onMenuCloseClick() {
    setTimeout(() => {
      this.chooseBrewModalClassName = 'chooseBrewModalHidden'
      this.mainContainerClassName = 'main'
    }, 100)
  }

  onChooseBrewClick(brew: MonitoringUnit) {
    this.brewName = of(brew.name)
    this.resetLoaders()
    this.onMenuCloseClick()
    this.populateAllChartsAndDataFields(brew)
  }

  getDisplayValue(brew: MonitoringUnit) {
    return brew.name.replace(/_/g, " ")
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

  calculateDaysInFermentation(startTimestamp: number, lastTimestamp: number): number {
    return this.round((lastTimestamp - startTimestamp) / (24 * 60 * 60 * 1000), 0)
  }

  round(value: number, decimals: number): number {
    var multiplier = Math.pow(10, decimals || 0);
    return Math.round(value * multiplier) / multiplier;
  }
}
