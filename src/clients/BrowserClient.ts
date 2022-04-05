import type {Browser,Page} from 'puppeteer';
import Puppeteer from 'puppeteer'

export class BrowserClient {
    protected browser: Browser
    protected page: Page

    public async initBrowser() {
        this.browser = await Puppeteer.launch({defaultViewport: null})
        this.page = await this.browser.newPage()
    }

    public async setResolution(width: number, height: number) {
        await this.page.setViewport({
            width,
            height
        })
    }
    
    public async setContent(htmlCode: string) {
        await this.page.setContent(htmlCode)
    }
    
    public async screenshotPage(delay: number) {
        await this.sleep(delay)
        
        return this.page.screenshot()
    }

    public async closeBrowser() {
        await this.browser.close()
    }
    
    private async sleep(delay) {
        return await new Promise((r) => setTimeout(r, delay))
    }
}