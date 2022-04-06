import type {Browser,Page} from 'puppeteer';
import Puppeteer from 'puppeteer'
import {ConfigHelper} from "../helper/ConfigHelper";

export class BrowserClient {
    protected browser: Browser
    protected configHelper = new ConfigHelper()

    public async initBrowser() {
        this.browser = await Puppeteer.launch({
            defaultViewport: null,
            args: ['--no-sandbox', '--incognito'],
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