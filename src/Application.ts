import {BrowserClient} from "./clients/BrowserClient";
import {ExpressClient} from "./clients/ExpressClient";

const browserClient = new BrowserClient()
const expressClient = new ExpressClient()

async function init() {
    await browserClient.initBrowser()
    expressClient.initExpress()
}

export const getBrowserClient = () => browserClient;

void init()