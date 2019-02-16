import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import {MonitoringUnit} from '../monitoring-unit/monitoring-unit';

@Component({
  selector: 'brew-details',
  templateUrl: './brew-details.component.html',
  styleUrls: ['./brew-details.component.scss']
})
export class BrewDetailsComponent {

  @Input('brew') brew: MonitoringUnit

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

  constructor() { }

  ngOnChanges(changes) {
    if (changes["brew"] && this.brew) {
      console.log('CHANGED')
      this.resetLoaders()
      this.setDetailsValues(this.brew)
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
