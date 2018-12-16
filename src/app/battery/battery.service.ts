import { Injectable } from '@angular/core';
import { Headers, RequestOptions } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class BatteryService {
    private apiURL = '/data/battery?unitName=spindel-1'

    constructor(private http: HttpClient) { }

    findAll(): Observable<any> {
        return this.http.get(this.apiURL);
    }
}