import * as express from 'express'
import * as bodyParser from "body-parser";
import {ConfigHelper} from "../helper/ConfigHelper";
import * as App from "../Application";
import {BrowserClient} from "./BrowserClient";
import {readdirSync, readFileSync} from "fs";

export class ExpressClient {
    protected configHelper = new ConfigHelper()
    protected browserClient: BrowserClient
    protected app: express

    public initExpress() {
        const port = this.configHelper.getPort()
        const address = this.configHelper.getAddress()
        const limit = this.configHelper.getUploadLimit()
        const requiredData = {
            'resolution': {
                'width': 0,
                'height': 0
            },
            'chart_options': {}
        }

        this.browserClient = App.getBrowserClient()

        this.app = express()

        this.app.use(bodyParser.json({limit}))
        this.app.use(bodyParser.urlencoded({extended: true, limit}))

        this.app.get('/', (req, res) => {
            const examples = readdirSync(`${__dirname}/../src/meta/examples`)
            let template = readFileSync(`${__dirname}/../src/meta/exampleTemplate.html`, 'utf8').toString()

            const exampleName = examples[Math.floor(Math.random() * examples.length)]
            const example = readFileSync(`${__dirname}/../src/meta/examples/${exampleName}`).toString()

            template = template
                .replace(/(\${echartOptions})/g, example)

            res.send(template)
        })

        this.app.post('/', async (req, res) => {
            const headers = req.headers
            const contentTypeHeader = headers['content-type']
            if(typeof contentTypeHeader === 'undefined' ||
                contentTypeHeader !== 'application/json') {
                res.status(400).send('{"error": "Missing Header application/json"}')
                return
            }

            const body = req.body

            if(typeof body !== 'object') {
                res.status(400).send('{"error": "data is not a json object"}')
                return
            }

            if(typeof body.resolution === 'undefined' || typeof body.chart_options === 'undefined') {
                res.status(400).send('{"error": "json object invalid"}')
                return
            }

            const page = await this.browserClient.addPage()
            const resolution = body.resolution
            const chartOptions = body.chart_options

            chartOptions['animation'] = false

            await page.setViewport({width: resolution.width, height: resolution.height})

            try {
                let template = readFileSync(`${__dirname}/../src/meta/chartTemplate.html`, 'utf8').toString()

                template = template
                    .replace(/(\${echartOptions})/g, JSON.stringify(chartOptions))

                await page.setContent(template)

                await this.sleep(this.configHelper.getScreenshotDelay())

                const screenShot = await page.screenshot()

                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Content-Length': screenShot.length
                });
                res.end(screenShot)

                await page.close()
            } catch (e){
                console.log(e)

                await page.close()

                res.status(400).send('{"error": "unknown error"}')
            }
        })

        this.app.listen(port, address, () => {
            console.log(`Listening on ${address}:${port}`)
        })
    }

    private async sleep(delay) {
        return await new Promise((r) => setTimeout(r, delay))
    }
}