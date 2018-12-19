export class RSSI {
    timestamps: number[]
    values: number[]

    constructor(timestamps: number[], values: number[]) {
        this.timestamps = timestamps
        this.values = values
    }
}
