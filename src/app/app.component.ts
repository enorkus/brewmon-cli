import { Component, OnInit } from '@angular/core';
import { Battery } from "./battery/battery";
import { BatteryService } from "./battery/battery.service";
import { MonitoringUnit } from "./monitoring-unit/monitoring-unit"
import { MonitoringUnitService } from "./monitoring-unit/monitoring-unit.service"
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [BatteryService, MonitoringUnitService]
})
export class AppComponent implements OnInit {

  private allUnits: MonitoringUnit[];
  private batteryData: Battery[];
  constructor(private monitoringUnitService: MonitoringUnitService, private batteryService: BatteryService) { }

  ngOnInit() {
    this.fetchAllMonitoringUnits()
      .pipe(map(allUnits => {
        this.allUnits = allUnits as MonitoringUnit[]
        this.fetchAllBatteryDataByUnitName(allUnits[0].name);
      }))
      .subscribe();

  }

  fetchAllMonitoringUnits(): Observable<any> {
    return this.monitoringUnitService.fetchAll();
  }

  fetchAllBatteryDataByUnitName(unitName: string) {
    this.batteryService.fetchAllByUnitName(unitName).subscribe(batteryData => { this.batteryData = batteryData as Battery[] })
  }
}
