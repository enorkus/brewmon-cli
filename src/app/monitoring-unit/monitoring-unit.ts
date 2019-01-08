export class MonitoringUnit {
    name: string
    on: boolean
    updateIntervalMins: number


    constructor(name: string, on: boolean, updateIntervalMins: number) {
        this.name = name
        this.on = on
        this.updateIntervalMins = updateIntervalMins
    }
}
