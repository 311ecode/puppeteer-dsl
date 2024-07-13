import { Browser, Page } from 'puppeteer';
import debug from 'debug';
import { puppeteerDSL } from './puppeteerDSL';
export declare const logMain: debug.Debugger;
export declare const logAction: debug.Debugger;
export declare const logConfig: debug.Debugger;
export declare const logScreenshot: debug.Debugger;
export type Size = 'xs' | 's' | 'm' | 'l' | 'xl' | string;
export type ContentType = 'text' | 'html' | 'outerHTML';
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
export interface PuppeteerDSL extends PuppeteerDSLMethods {
    [key: string]: PuppeteerDSL | ((...args: any[]) => PuppeteerDSL);
    xs: PuppeteerDSL & PuppeteerDSLMethods;
    s: PuppeteerDSL & PuppeteerDSLMethods;
    m: PuppeteerDSL & PuppeteerDSLMethods;
    l: PuppeteerDSL & PuppeteerDSLMethods;
    xl: PuppeteerDSL & PuppeteerDSLMethods;
    (): Promise<any>;
}
export declare const delay: (ms: number) => Promise<unknown>;
export declare let sizeViewports: {
    [key: string]: {
        width: number;
        height: number;
    };
};
export declare const registeredCommands: Set<string>;
export declare const oneParameterSelectorFunctions: string[];
export default puppeteerDSL;
