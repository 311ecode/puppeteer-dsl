import { Browser, Page } from 'puppeteer';
import { PuppeteerDSL, Size, ContentType } from './puppeteerDslChunks';
export interface PuppeteerDSLMethods {
    goto: (url: string) => PuppeteerDSL;
    waitForSelector: (selector: string) => PuppeteerDSL;
    click: PuppeteerDSL & ((selector?: string) => PuppeteerDSL);
    type: (selector: string, text: string) => PuppeteerDSL;
    getContent: (selector: string, type: ContentType) => PuppeteerDSL;
    wait: (ms: number) => PuppeteerDSL;
    screenshot: PuppeteerDSL & ((filename?: string) => PuppeteerDSL);
    screenshotPath: (path: string) => PuppeteerDSL;
    evaluate: (fn: (...args: any[]) => any, ...args: any[]) => PuppeteerDSL;
    browser: (browser: Browser) => PuppeteerDSL;
    page: (page: Page) => PuppeteerDSL;
    visible: PuppeteerDSL;
    closeAfterUse: PuppeteerDSL;
    openAfterUse: PuppeteerDSL;
    select: (selector: string, ...values: string[]) => PuppeteerDSL;
    hover: PuppeteerDSL & ((selector?: string) => PuppeteerDSL);
    interceptRequest: (callback: (request: Request) => void) => PuppeteerDSL;
    interceptResponse: (callback: (response: Response) => void) => PuppeteerDSL;
    sizes: (...sizes: Size[]) => PuppeteerDSL;
    addSize: (name: string, width: number, height: number) => PuppeteerDSL;
    noFail: PuppeteerDSL;
    parallelScreenExecution: PuppeteerDSL;
}
export declare const puppeteerDSL: () => PuppeteerDSL;
