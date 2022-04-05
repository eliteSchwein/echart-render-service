import * as express from 'express'
import * as bodyParser from "body-parser";
import {ConfigHelper} from "../helper/ConfigHelper";
import _ from "lodash";
import waitUntil from "async-wait-until";
import * as App from "../Application";
import {BrowserClient} from "./BrowserClient";
import {readFileSync} from "fs";

export class ExpressClient {
    protected configHelper = new ConfigHelper()
    protected requestPipeline = []
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

            const data = [body]
            const validation = _.filter(data, _.matches(requiredData))

            if(validation.length === 0) {
                res.status(400).send('{"error": "json object invalid"}')
                return
            }

            const resolution = data[0]['resolution']
            const chartOptions = data[0]['chart_options']

            chartOptions['animation'] = false

            const requestId = Math.floor(Math.random() * 1_000_000)

            this.requestPipeline.push(requestId)

            try {
                await waitUntil(() => this.requestPipeline[0] === requestId, {timeout: this.configHelper.getTimeout()})

                await this.browserClient.setResolution(resolution.width, resolution.height)

                let template = readFileSync(`${__dirname}/../src/meta/chartTemplate.html`, 'utf8').toString()

                template = template
                    .replace(/(\${echartOptions})/g, JSON.stringify(chartOptions))

                await this.browserClient.setContent(template)

                const screenShot = await this.browserClient.screenshotPage(this.configHelper.getScreenshotDelay())

                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Content-Length': screenShot.length
                });
                res.end(screenShot)

                delete this.requestPipeline[requestId]
            } catch (e){
                console.log(e)
                const index = this.requestPipeline.indexOf(requestId);

                if (index > -1) {
                    this.requestPipeline.splice(index, 1);
                }

                delete this.requestPipeline[requestId]
                res.status(400).send('{"error": "timeout"}')
            }
        })

        this.app.listen(port, address, () => {
            console.log(`Listening on ${address}:${port}`)
        })
    }
}