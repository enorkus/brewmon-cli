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

  public height: number
  public mainContainerClassName: string = 'main'
  public chooseBrewModalClassName: string = 'choose-brew-modal-hidden'
  public static readonly SELECTED_BREW_KEY: string = "selectedBrew"

  constructor(private monitoringUnitService: MonitoringUnitService, public batteryService: BatteryService, public angleService: AngleService,
    public temperatureService: TemperatureService, public gravityService: GravityService, public rssiService: RSSIService, private storage: LocalStorageService) { }

  ngOnInit() {

    var selectedBrew = this.storage.retrieve(AppComponent.SELECTED_BREW_KEY)

    this.fetchAllMonitoringUnits()
      .subscribe(allUnits => {
        this.allUnits = allUnits.sort((a, b) => a.lastUpdatedMillis < b.lastUpdatedMillis ? 1 : a.lastUpdatedMillis == b.lastUpdatedMillis ? 0 : -1)
        if (selectedBrew) {
          this.brew = allUnits.find(unit => unit.name === selectedBrew)
        } else {
          this.brew = allUnits[0]
        }
        this.brewName = of(this.brew.name)
      },
        error => console.log('Error'),
        () => {
          this.setBrew(this.brew)
        }
      )
  }

  fetchAllMonitoringUnits(): Observable<any> {
    return this.monitoringUnitService.fetchAll()
  }

  setBrew(brew: MonitoringUnit) {
    this.storage.store(AppComponent.SELECTED_BREW_KEY, brew.name)
    this.brew = brew

    var bodyWidth = document.getElementsByTagName("body")[0].clientWidth
    if (bodyWidth > 1135) {
      this.height = document.getElementById("temperatureChart").clientHeight + document.getElementById("generalInfoContainer").clientHeight
    }
  }

  onMenuOpenClick() {
    setTimeout(() => {
      this.mainContainerClassName = 'main-blurred'
    }, 100)
    setTimeout(() => {
      this.chooseBrewModalClassName = 'choose-brew-modal-visible'
    }, 300)
  }

  onMenuCloseClick() {
    setTimeout(() => {
      this.chooseBrewModalClassName = 'choose-brew-modal-hidden'
      this.mainContainerClassName = 'main'
    }, 100)
  }

  onChooseBrewClick(brew: MonitoringUnit) {
    this.brewName = of(brew.name)
    this.onMenuCloseClick()
    this.setBrew(brew)
  }

  getDisplayValue(brew: MonitoringUnit) {
    return brew.name.replace(/_/g, " ")
  }
}
