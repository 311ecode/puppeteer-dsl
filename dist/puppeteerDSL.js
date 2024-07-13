"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.puppeteerDSL = void 0;
const dsl_framework_1 = __importDefault(require("dsl-framework"));
const puppeteer_1 = __importStar(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const puppeteerDslChunks_1 = require("./puppeteerDslChunks");
const waitForNetworkIdle = async (page, timeout = 500) => {
    (0, puppeteerDslChunks_1.logAction)('Waiting for network idle');
    await page.waitForNavigation({
        waitUntil: 'networkidle0',
        timeout
    }).catch(() => {
        (0, puppeteerDslChunks_1.logAction)('Network idle timeout');
    });
};
const waitForPageLoad = async (page) => {
    (0, puppeteerDslChunks_1.logAction)('Waiting for page load');
    // await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
};
const performAction = (d, currentUrl, updateLastSelector, getLastSelector, screenshotPath) => async (action, args, size, currentIndex, page) => {
    var _a;
    if (puppeteerDslChunks_1.sizeViewports[size]) {
        (0, puppeteerDslChunks_1.logAction)('Setting viewport for size: %s', size);
        await page.setViewport(puppeteerDslChunks_1.sizeViewports[size]);
    }
    else {
        (0, puppeteerDslChunks_1.logAction)('Unknown size: %s. Using default viewport.', size);
    }
    (0, puppeteerDslChunks_1.logAction)('Performing action: %s with args: %o', action, args);
    const executeAction = async () => {
        switch (action) {
            case 'goto':
                const url = args[0];
                currentUrl = url;
                (0, puppeteerDslChunks_1.logAction)('Navigating to: %s', url);
                await page.goto(url);
                await waitForPageLoad(page);
                await waitForNetworkIdle(page);
                break;
            case 'waitForSelector':
                (0, puppeteerDslChunks_1.logAction)('Waiting for selector: %s', args[0]);
                await page.waitForSelector(args[0]);
                updateLastSelector(args[0]);
                break;
            case 'click':
                const clickSelector = args.length > 0 ? args[0] : getLastSelector(currentIndex);
                if (clickSelector) {
                    (0, puppeteerDslChunks_1.logAction)('Clicking selector: %s', clickSelector);
                    await page.click(clickSelector);
                    updateLastSelector(clickSelector);
                }
                else {
                    throw new Error('No selector found for click action');
                }
                break;
            case 'type':
                if (args.length === 1) {
                    const typeSelector = getLastSelector(currentIndex);
                    if (typeSelector) {
                        (0, puppeteerDslChunks_1.logAction)('Typing into selector: %s', typeSelector);
                        await page.type(typeSelector, args[0]);
                    }
                    else {
                        throw new Error('No selector found for type action');
                    }
                }
                else {
                    (0, puppeteerDslChunks_1.logAction)('Typing into selector: %s', args[0]);
                    await page.type(args[0], args[1]);
                    updateLastSelector(args[0]);
                }
                break;
            case 'getContent':
                (0, puppeteerDslChunks_1.logAction)('Getting content from selector: %s', args[0]);
                const element = await page.$(args[0]);
                if (element) {
                    switch (args[1]) {
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
                (0, puppeteerDslChunks_1.logAction)('Waiting for %d ms', args[0]);
                await (0, puppeteerDslChunks_1.delay)(args[0]);
                break;
            case 'screenshot':
                await waitForNetworkIdle(page);
                const timestamp = new Date().toISOString().replace(/:/g, '-');
                const userFilename = args.length > 0 ? args[0] : 'screenshot';
                const filename = `${timestamp}_${size}_${userFilename}.png`;
                const screenshotFilePath = path_1.default.join(screenshotPath, filename);
                (0, puppeteerDslChunks_1.logScreenshot)('Taking screenshot: %s', screenshotFilePath);
                await page.screenshot({ path: screenshotFilePath, fullPage: true });
                (0, puppeteerDslChunks_1.logScreenshot)('Screenshot saved: %s', screenshotFilePath);
                return screenshotFilePath;
            case 'evaluate':
                (0, puppeteerDslChunks_1.logAction)('Evaluating function in page context');
                return await page.evaluate(args[0], ...args.slice(1));
            case 'select':
                (0, puppeteerDslChunks_1.logAction)('Selecting options for selector: %s', args[0]);
                await page.select(args[0], ...args.slice(1));
                break;
            case 'hover':
                const hoverSelector = args.length > 0 ? args[0] : getLastSelector(currentIndex);
                if (hoverSelector) {
                    (0, puppeteerDslChunks_1.logAction)('Hovering over selector: %s', hoverSelector);
                    await page.hover(hoverSelector);
                    updateLastSelector(hoverSelector);
                }
                else {
                    throw new Error('No selector found for hover action');
                }
                break;
            case 'addSize':
                const [name, width, height] = args;
                (0, puppeteerDslChunks_1.logConfig)('Adding custom size: %s (%dx%d)', name, width, height);
                puppeteerDslChunks_1.sizeViewports[name] = { width, height };
                break;
            case 'sizes':
                (0, puppeteerDslChunks_1.logAction)('Setting sizes: %o', args);
                return args;
        }
    };
    // @ts-ignore
    const isNoFail = ((_a = d.data.returnArrayChunks[currentIndex + 1]) === null || _a === void 0 ? void 0 : _a[0]) === 'noFail';
    try {
        const result = await executeAction();
        await waitForNetworkIdle(page);
        return result;
    }
    catch (error) {
        if (isNoFail) {
            (0, puppeteerDslChunks_1.logAction)(`Error occurred but noFail is active for this action. Error:`, error);
            if (error instanceof puppeteer_1.TimeoutError) {
                (0, puppeteerDslChunks_1.logAction)('Timeout occurred, continuing with next action');
            }
            return null;
        }
        else {
            throw error;
        }
    }
};
const puppeteerDSL = () => {
    (0, puppeteerDslChunks_1.logMain)('Initializing PuppeteerDSL');
    // @ts-ignore
    return (0, dsl_framework_1.default)()(async (e, d) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let browser = null;
        let page = null;
        let shouldCloseBrowser = false;
        let shouldClosePage = false;
        let isVisible = false;
        let screenshotPath = '/tmp/puppeteerDsl';
        let currentUrl = '';
        let selectedSizes = ['m'];
        let selectorHistory = {};
        let isParallelScreenExecution = false;
        const config = {
            browser: (_b = (_a = d.command.get('browser')) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b[1],
            page: (_d = (_c = d.command.get('page')) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d[1],
            visible: d.command.has('visible'),
            screenshotPath: (_f = (_e = d.command.get('screenshotPath')) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f[1],
            sizes: (_h = (_g = d.command.get('sizes')) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.slice(1),
            parallelScreenExecution: d.command.has('parallelScreenExecution'),
        };
        (0, puppeteerDslChunks_1.logConfig)('Configuration:', config);
        if (config.visible)
            isVisible = true;
        if (config.screenshotPath)
            screenshotPath = config.screenshotPath;
        if (config.sizes)
            selectedSizes = config.sizes;
        if (config.parallelScreenExecution)
            isParallelScreenExecution = true;
        (0, puppeteerDslChunks_1.logConfig)('Final configuration: isVisible=%s, screenshotPath=%s, selectedSizes=%o, isParallelScreenExecution=%s', isVisible, screenshotPath, selectedSizes, isParallelScreenExecution);
        fs_1.default.mkdirSync(screenshotPath, { recursive: true });
        const createBrowserAndPage = async () => {
            const newBrowser = await puppeteer_1.default.launch({ headless: !isVisible });
            const newPage = await newBrowser.newPage();
            return { browser: newBrowser, page: newPage };
        };
        if (config.browser) {
            (0, puppeteerDslChunks_1.logMain)('Using provided browser');
            browser = config.browser;
            shouldCloseBrowser = false;
        }
        else if (config.page) {
            (0, puppeteerDslChunks_1.logMain)('Using provided page');
            page = config.page;
            shouldClosePage = true;
        }
        else {
            (0, puppeteerDslChunks_1.logMain)('Launching new browser');
            ({ browser, page } = await createBrowserAndPage());
            shouldCloseBrowser = true;
            shouldClosePage = true;
        }
        const updateLastSelector = (selector) => {
            selectorHistory[currentUrl] = selector;
        };
        const getLastSelector = (currentIndex) => {
            if (selectorHistory[currentUrl]) {
                return selectorHistory[currentUrl];
            }
            return findLastSelector(currentIndex);
        };
        const findLastSelector = (currentIndex) => {
            for (let i = currentIndex - 1; i >= 0; i--) {
                const [action, ...args] = d.data.returnArrayChunks[i];
                if (puppeteerDslChunks_1.oneParameterSelectorFunctions.includes(action) && args.length > 0) {
                    return args[0];
                }
                if (action === 'goto') {
                    break;
                }
            }
            return null;
        };
        const commands = d.data.returnArrayChunks;
        (0, puppeteerDslChunks_1.logMain)('Processing %d commands', commands.length);
        const results = [];
        for (let i = 0; i < commands.length; i++) {
            const [action, ...args] = commands[i];
            if (puppeteerDslChunks_1.registeredCommands.has(action) && action !== 'noFail') {
                if (action === 'screenshot' || action === 'sizes') {
                    // These actions should be performed for each size
                    for (const size of selectedSizes) {
                        const result = await performAction(d, currentUrl, updateLastSelector, getLastSelector, screenshotPath)(action, args, size, i, page);
                        results.push(result);
                    }
                }
                else {
                    // Other actions should be performed only once
                    const result = await performAction(d, currentUrl, updateLastSelector, getLastSelector, screenshotPath)(action, args, selectedSizes[0], i, page);
                    results.push(result);
                }
            }
        }
        if (shouldClosePage) {
            if (page) {
                (0, puppeteerDslChunks_1.logMain)('Closing page');
                await page.close();
            }
        }
        if (shouldCloseBrowser) {
            if (browser) {
                (0, puppeteerDslChunks_1.logMain)('Closing browser');
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
exports.puppeteerDSL = puppeteerDSL;
