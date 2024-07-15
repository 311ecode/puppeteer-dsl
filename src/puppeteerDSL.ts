import dslFramework, { DslState } from 'dsl-framework';
import puppeteer, { Browser, Page, TimeoutError } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { PuppeteerDSL, logMain, Size, logAction, logConfig, oneParameterSelectorFunctions, sizeViewports, ContentType, delay, logScreenshot, registeredCommands } from './puppeteerDslChunks';

// type WhoKnowsWhatItIs =  ((...any[])=>PuppeteerDSL) | (()=>Promise<unknown>)

export interface PuppeteerDSLMethods {
  goto: (url: string) => PuppeteerDSL;
  waitForSelector: (selector: string) => PuppeteerDSL;
  click: PuppeteerDSL & ((selector?: string) => PuppeteerDSL)| (()=>Promise<unknown>);
  type: (selector: string, text: string) => PuppeteerDSL;
  getContent: (selector: string, type: ContentType) => PuppeteerDSL;
  wait: (ms: number) => PuppeteerDSL;
  screenshot: PuppeteerDSL & ((filename?: string) => PuppeteerDSL);
  screenshotPath: (path: string) => PuppeteerDSL;
  evaluate: (fn: (...args: any[]) => any, ...args: any[]) => PuppeteerDSL;
  browser: (browser: Browser) => PuppeteerDSL;
  page: (page: Page) => PuppeteerDSL;
  visible: PuppeteerDSL | (()=>PuppeteerDSL) | (()=>Promise<unknown>);
  closeAfterUse: PuppeteerDSL;
  openAfterUse: PuppeteerDSL | (()=>PuppeteerDSL) | (()=>Promise<unknown>);
  select: (selector: string, ...values: string[]) => PuppeteerDSL;
  hover: PuppeteerDSL | ((selector?: string) => PuppeteerDSL)| (()=>Promise<unknown>);
  interceptRequest: (callback: (request: Request) => void) => PuppeteerDSL;
  interceptResponse: (callback: (response: Response) => void) => PuppeteerDSL;
  sizes: (...sizes: Size[]) => PuppeteerDSL;
  addSize: (name: string, width: number, height: number) => PuppeteerDSL;
  noFail: PuppeteerDSL;
  parallelScreenExecution: PuppeteerDSL;
}

const waitForNetworkIdle = async (page: Page, timeout = 500) => {
  logAction('Waiting for network idle');
  await page.waitForNavigation({
    waitUntil: 'networkidle0',
    timeout
  }).catch(() => {
    logAction('Network idle timeout');
  });
};

const waitForPageLoad = async (page: Page) => {
  logAction('Waiting for page load');
  // await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
};

const performAction = (d:DslState, currentUrl:string, updateLastSelector: any, getLastSelector: any, screenshotPath: string) => async (action: string, args: any[], size: Size, currentIndex: number, page: Page) => {
  if (sizeViewports[size]) {
    logAction('Setting viewport for size: %s', size);
    await page.setViewport(sizeViewports[size]);
  } else {
    logAction('Unknown size: %s. Using default viewport.', size);
  }

  logAction('Performing action: %s with args: %o', action, args);

  const executeAction = async () => {
    switch (action) {
      case 'goto':
        const url = args[0] as string;
        currentUrl = url;
        logAction('Navigating to: %s', url);
        await page.goto(url);
        await waitForPageLoad(page);
        await waitForNetworkIdle(page);
        break;
      case 'waitForSelector':
        logAction('Waiting for selector: %s', args[0]);
        await page.waitForSelector(args[0] as string);
        updateLastSelector(args[0] as string);
        break;
      case 'click':
        const clickSelector = args.length > 0 ? args[0] as string : getLastSelector(currentIndex);
        if (clickSelector) {
          logAction('Clicking selector: %s', clickSelector);
          await page.click(clickSelector);
          updateLastSelector(clickSelector);
        } else {
          throw new Error('No selector found for click action');
        }
        break;
      case 'type':
        if (args.length === 1) {
          const typeSelector = getLastSelector(currentIndex);
          if (typeSelector) {
            logAction('Typing into selector: %s', typeSelector);
            await page.type(typeSelector, args[0] as string);
          } else {
            throw new Error('No selector found for type action');
          }
        } else {
          logAction('Typing into selector: %s', args[0]);
          await page.type(args[0] as string, args[1] as string);
          updateLastSelector(args[0] as string);
        }
        break;
      case 'getContent':
        logAction('Getting content from selector: %s', args[0]);
        const element = await page.$(args[0] as string);
        if (element) {
          switch (args[1] as ContentType) {
            case 'text':
              return await element.evaluate(el => el.textContent);
            case 'html':
              return await element.evaluate(el => el.innerHTML);
            case 'outerHTML':
              return await element.evaluate(el => el.outerHTML);
          }
        }
        break;
      case 'wait':
        logAction('Waiting for %d ms', args[0]);
        await delay(args[0] as number);
        break;
      case 'screenshot':
        await waitForNetworkIdle(page);
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const userFilename = args.length > 0 ? args[0] as string : 'screenshot';
        const filename = `${timestamp}_${size}_${userFilename}.png`;
        const screenshotFilePath = path.join(screenshotPath, filename);
        logScreenshot('Taking screenshot: %s', screenshotFilePath);
        await page.screenshot({ path: screenshotFilePath, fullPage: true });
        logScreenshot('Screenshot saved: %s', screenshotFilePath);
        return screenshotFilePath;
      case 'evaluate':
        logAction('Evaluating function in page context');
        return await page.evaluate(args[0] as (...evalArgs: any[]) => any, ...args.slice(1));
      case 'select':
        logAction('Selecting options for selector: %s', args[0]);
        await page.select(args[0] as string, ...(args.slice(1) as string[]));
        break;
      case 'hover':
        const hoverSelector = args.length > 0 ? args[0] as string : getLastSelector(currentIndex);
        if (hoverSelector) {
          logAction('Hovering over selector: %s', hoverSelector);
          await page.hover(hoverSelector);
          updateLastSelector(hoverSelector);
        } else {
          throw new Error('No selector found for hover action');
        }
        break;
      case 'addSize':
        const [name, width, height] = args as [string, number, number];
        logConfig('Adding custom size: %s (%dx%d)', name, width, height);
        sizeViewports[name] = { width, height };
        break;
      case 'sizes':
        logAction('Setting sizes: %o', args);
        return args;
    }
  };

  // @ts-ignore
  const isNoFail = d.data.returnArrayChunks[currentIndex + 1]?.[0] === 'noFail';

  try {
    const result = await executeAction();
    await waitForNetworkIdle(page);
    return result;
  } catch (error) {
    if (isNoFail) {
      logAction(`Error occurred but noFail is active for this action. Error:`, error);
      if (error instanceof TimeoutError) {
        logAction('Timeout occurred, continuing with next action');
      }
      return null;
    } else {
      throw error;
    }
  }
};

export const puppeteerDSL = (): PuppeteerDSL => {
  logMain('Initializing PuppeteerDSL');
  // @ts-ignore
  return dslFramework()(async (e, d) => {
    let browser: Browser | null = null;
    let page: Page | null = null;
    let shouldCloseBrowser = false;
    let shouldClosePage = false;
    let isVisible = false;
    let screenshotPath = '/tmp/puppeteerDsl';
    let currentUrl = '';
    let selectedSizes: Size[] = ['m'];
    let selectorHistory: { [url: string]: string; } = {};
    let isParallelScreenExecution = false;

    const config = {
      browser: d.command.get('browser')?.[0]?.[1] as unknown as Browser | undefined,
      page: d.command.get('page')?.[0]?.[1] as unknown as Page | undefined,
      visible: d.command.has('visible'),
      screenshotPath: d.command.get('screenshotPath')?.[0]?.[1] as unknown as string | undefined,
      sizes: d.command.get('sizes')?.[0]?.slice(1) as unknown as Size[] | undefined,
      parallelScreenExecution: d.command.has('parallelScreenExecution'),
      openAferUse: d.command.has('openAfterUse'),
    };

    logConfig('Configuration:', config);

    if (config.visible) isVisible = true;
    if (config.screenshotPath) screenshotPath = config.screenshotPath;
    if (config.sizes) selectedSizes = config.sizes;
    if (config.parallelScreenExecution) isParallelScreenExecution = true;

    logConfig('Final configuration: isVisible=%s, screenshotPath=%s, selectedSizes=%o, isParallelScreenExecution=%s',
      isVisible, screenshotPath, selectedSizes, isParallelScreenExecution);

    fs.mkdirSync(screenshotPath, { recursive: true });

    const createBrowserAndPage = async () => {
      const newBrowser = await puppeteer.launch({ headless: !isVisible });
      const newPage = await newBrowser.newPage();
      return { browser: newBrowser, page: newPage };
    };

    if (config.browser) {
      logMain('Using provided browser');
      browser = config.browser;
      shouldCloseBrowser = false;
    } else if (config.page) {
      logMain('Using provided page');
      page = config.page;
      shouldClosePage = !config.openAferUse;
    } else {
      logMain('Launching new browser');
      ({ browser, page } = await createBrowserAndPage());
      shouldCloseBrowser = true;
      shouldClosePage = true;
    }

    const updateLastSelector = (selector: string): void => {
      selectorHistory[currentUrl] = selector;
    };

    const getLastSelector = (currentIndex: number): string | null => {
      if (selectorHistory[currentUrl]) {
        return selectorHistory[currentUrl];
      }
      return findLastSelector(currentIndex);
    };

    const findLastSelector = (currentIndex: number): string | null => {
      for (let i = currentIndex - 1; i >= 0; i--) {
        const [action, ...args] = d.data.returnArrayChunks[i];
        if (oneParameterSelectorFunctions.includes(action) && args.length > 0) {
          return args[0] as string;
        }
        if (action === 'goto') {
          break;
        }
      }
      return null;
    };

    const commands = d.data.returnArrayChunks;
    logMain('Processing %d commands', commands.length);

    const results = [];
    for (let i = 0; i < commands.length; i++) {
      const [action, ...args] = commands[i];
      if (registeredCommands.has(action) && action !== 'noFail') {
        if (action === 'screenshot' || action === 'sizes') {
          // These actions should be performed for each size
          for (const size of selectedSizes) {
            const result = await performAction(d, currentUrl, updateLastSelector, getLastSelector, screenshotPath)(action, args, size, i, page!);
            results.push(result);
          }
        } else {
          // Other actions should be performed only once
          const result = await performAction(d, currentUrl, updateLastSelector, getLastSelector, screenshotPath)(action, args, selectedSizes[0], i, page!);
          results.push(result);
        }
      }
    }

    if (shouldClosePage ) {
      if (page) {
        logMain('Closing page');
        await page.close();
      }
    }
    if (shouldCloseBrowser ) {
      if (browser) {
        logMain('Closing browser');
        await browser.close();
      }
    }

    // Return only the last non-undefined result
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i] !== undefined) {
        return await results[i];
      }
    }
    return undefined;
  });
};