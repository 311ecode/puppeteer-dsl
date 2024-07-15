import { Browser, Page } from 'puppeteer';
import debug from 'debug';
import { puppeteerDSL } from './puppeteerDSL';

export const logMain = debug('PuppeteerDSL:main');
export const logAction = debug('PuppeteerDSL:action');
export const logConfig = debug('PuppeteerDSL:config');
export const logScreenshot = debug('PuppeteerDSL:screenshot');

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
  [key: string]: PuppeteerDSL | ((...args: any[]) => PuppeteerDSL) | (()=> Promise<any>);
  
  xs: PuppeteerDSL;
  s: PuppeteerDSL;
  m: PuppeteerDSL;
  l: PuppeteerDSL;
  xl: PuppeteerDSL;

  (): Promise<any>;
}
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export let sizeViewports: { [key: string]: { width: number; height: number } } = {
  xs: { width: 320, height: 568 },
  s: { width: 576, height: 768 },
  m: { width: 768, height: 1024 },
  l: { width: 992, height: 1200 },
  xl: { width: 1200, height: 1600 },
};

export const registeredCommands = new Set([
  'goto', 'waitForSelector', 'click', 'type', 'getContent', 'wait',
  'screenshot', 'screenshotPath', 'evaluate',
  'browser', 'page', 'visible', 'closeAfterUse', 'openAfterUse',
  'select', 'hover', 'interceptRequest', 'interceptResponse', 'sizes', 'addSize', 'noFail',
  'parallelScreenExecution'
]);

export const oneParameterSelectorFunctions = ['waitForSelector', 'click', 'hover', 'type'];

export default puppeteerDSL;