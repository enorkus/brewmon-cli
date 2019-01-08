import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

@Injectable()
export class MonitoringUnitService {

    private monitoringUnitsURI = '/data/units'

    constructor(private http: HttpClient) { }

    fetchAll(): Observable<any> {
        return this.http.get(this.monitoringUnitsURI)
    }
}