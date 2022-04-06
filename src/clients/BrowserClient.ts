import type {Browser,Page} from 'puppeteer-core';
import Puppeteer from 'puppeteer-core'
import {ConfigHelper} from "../helper/ConfigHelper";

export class BrowserClient {
    protected browser: Browser
    protected configHelper = new ConfigHelper()

    public async initBrowser() {
        this.browser = await Puppeteer.launch({
            executablePath: this.configHelper.getExecutablePath(),
            defaultViewport: null,
            args: ['--no-sandbox', '--incognito', '--use-gl'],
            headless: true
        })
    }

    public async addPage() {
        return await this.browser.newPage()
    }

    public async closeBrowser() {
        await this.browser.close()
    }
}