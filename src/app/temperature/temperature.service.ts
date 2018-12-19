import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'

@Injectable()
export class TemperatureService {

    private temperatureDataByUnitNameURI = '/data/temperature?unitName='

    constructor(private http: HttpClient) { }

    fetchAllByUnitName(unitName: string): Observable<any> {
        return this.http.get(this.temperatureDataByUnitNameURI + unitName)
    }
}