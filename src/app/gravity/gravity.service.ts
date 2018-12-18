import { Injectable } from '@angular/core'
import { Headers, RequestOptions } from '@angular/http'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'

@Injectable()
export class GravityService {

    private gravityDataByUnitNameURI = '/data/gravity?unitName='

    constructor(private http: HttpClient) { }

    fetchAllByUnitName(unitName: string): Observable<any> {
        return this.http.get(this.gravityDataByUnitNameURI + unitName)
    }
}