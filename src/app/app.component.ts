import { Component, OnInit } from '@angular/core';
import { Battery } from "./battery/battery";
import { BatteryService } from "./battery/battery.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [BatteryService]
})
export class AppComponent implements OnInit {
  title = 'brewmon-cli';

  private batteryData: Battery[];
  constructor(private batteryService: BatteryService) { }

  ngOnInit() {
    this.getAllBatteryData();
  }

  getAllBatteryData() {
    this.batteryService.findAll().subscribe(batteryData => { this.batteryData = batteryData as Battery[] })
  }
}
