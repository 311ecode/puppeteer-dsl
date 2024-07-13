"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oneParameterSelectorFunctions = exports.registeredCommands = exports.sizeViewports = exports.delay = exports.logScreenshot = exports.logConfig = exports.logAction = exports.logMain = void 0;
const debug_1 = __importDefault(require("debug"));
const puppeteerDSL_1 = require("./puppeteerDSL");
exports.logMain = (0, debug_1.default)('PuppeteerDSL:main');
exports.logAction = (0, debug_1.default)('PuppeteerDSL:action');
exports.logConfig = (0, debug_1.default)('PuppeteerDSL:config');
exports.logScreenshot = (0, debug_1.default)('PuppeteerDSL:screenshot');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.delay = delay;
exports.sizeViewports = {
    xs: { width: 320, height: 568 },
    s: { width: 576, height: 768 },
    m: { width: 768, height: 1024 },
    l: { width: 992, height: 1200 },
    xl: { width: 1200, height: 1600 },
};
exports.registeredCommands = new Set([
    'goto', 'waitForSelector', 'click', 'type', 'getContent', 'wait',
    'screenshot', 'screenshotPath', 'evaluate',
    'browser', 'page', 'visible', 'closeAfterUse', 'openAfterUse',
    'select', 'hover', 'interceptRequest', 'interceptResponse', 'sizes', 'addSize', 'noFail',
    'parallelScreenExecution'
]);
exports.oneParameterSelectorFunctions = ['waitForSelector', 'click', 'hover', 'type'];
exports.default = puppeteerDSL_1.puppeteerDSL;
