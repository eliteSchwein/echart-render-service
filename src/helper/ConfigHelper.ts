import {readFileSync} from "fs";

export class ConfigHelper {
    protected config = {}

    public constructor() {
        this.config = readFileSync('../config.json').toJSON()
    }

    public getPort() {
        return this.config['port']
    }

    public getUploadLimit() {
        return this.config['upload_limit'] * 1000
    }
}