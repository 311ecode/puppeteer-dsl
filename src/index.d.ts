// src/index.d.ts

export { puppeteerDSL } from './puppeteerDSL';
export {
  PuppeteerDSL,
  PuppeteerDSLMethods,
  Size,
  ContentType,
  logMain,
  logAction,
  logConfig,
  logScreenshot,
  delay,
  sizeViewports,
  registeredCommands,
  oneParameterSelectorFunctions
} from './puppeteerDslChunks';

// Re-export the interface from puppeteerDSL.ts as well
export { PuppeteerDSLMethods as PuppeteerDSLMethodsExtended } from './puppeteerDSL';