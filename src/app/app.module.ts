import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {NgxWebstorageModule} from 'ngx-webstorage';
import { BrewChartComponent } from './brew-chart/brew-chart.component';
import { BrewDetailsComponent } from './brew-details/brew-details.component';

@NgModule({
  declarations: [
    AppComponent,
    BrewChartComponent,
    BrewDetailsComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    NgxWebstorageModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
