import {readFileSync} from "fs";

export class ConfigHelper {
    protected config = {}

    public constructor() {
        this.config = JSON.parse(readFileSync(`${__dirname}/../config.json`).toString())
    }

    public getAddress() {
        return this.config['address']
    }

    public getPort() {
        return this.config['port']
    }

    public getUploadLimit() {
        return this.config['upload_limit']
    }

    public getTimeout() {
        return this.config['timeout'] * 1000
    }

    public getScreenshotDelay() {
        return this.config['screenshot_delay']
    }

    public getExecutablePath() {
        return this.config['executable_path']
    }
}