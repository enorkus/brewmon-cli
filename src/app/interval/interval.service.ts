import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'

@Injectable()
export class IntervalService {

    private intervalDataByUnitNameURI = '/data/interval?unitName='

    constructor(private http: HttpClient) { }

    fetchLatestByUnitName(unitName: string): Observable<any> {
        return this.http.get(this.intervalDataByUnitNameURI + unitName)
    }
}