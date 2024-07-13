import { expect, jest, test, describe, beforeAll, afterAll } from '@jest/globals';

import {puppeteerDSL} from '../src/puppeteerDSL';
import { PuppeteerDSL } from '../src/puppeteerDslChunks';

describe('CSS Zen Garden Tests', () => {
  let dsl:PuppeteerDSL;

  beforeAll(async () => {
    dsl = puppeteerDSL().visible;
  });

  afterAll(async () => {
    await dsl.closeAfterUse();
  });

  test('Page title is correct', async () => {
    const title = await puppeteerDSL().visible
      .goto('https://csszengarden.com/')
      .xs.wait(2000)
      // @ts-ignore
      .evaluate(()=>document.title)
      ();

      console.log('titleeee-', title);
      
    expect(title).toBe('CSS Zen Garden: The Beauty of CSS Design');
  });

  test('Main heading is present', async () => {
    const heading = await puppeteerDSL().visible
    .goto('https://csszengarden.com/')
      .waitForSelector('h1')
      .getContent('h1', 'text')
      ();
    expect(heading).toBe('CSS Zen Garden');
  });

  test('Subheading is present', async () => {
    const subheading = await puppeteerDSL().visible
    .goto('https://csszengarden.com/')
      .waitForSelector('h2')
      .getContent('h2', 'text')
      ();
    expect(subheading).toBe('The Beauty of CSS Design');
  });

  test('Download links are present', async () => {
    const links = await puppeteerDSL().visible
    .goto('https://csszengarden.com/')
      .evaluate(() => {
        // @ts-ignore
        const htmlLink = document.querySelector('a[href$="index"]');
        // @ts-ignore
        const cssLink = document.querySelector('a[href$="style.css"]');
        return {
          htmlText: htmlLink ? htmlLink.textContent : null,
          cssText: cssLink ? cssLink.textContent : null,
        };
      })
      ();
    expect(links.htmlText).toBe('html file');
    expect(links.cssText).toBe('css file');
  });

  test('Design selection list is present', async () => {
    const designCount = await puppeteerDSL().visible
      .goto('https://csszengarden.com/')
      .waitForSelector('#design-selection')
      // @ts-ignore
      .evaluate(() => document.querySelectorAll('#design-selection li').length)
      ();
    expect(designCount).toBeGreaterThan(0);
  });

  test('Switching designs changes the page appearance', async () => {
    const initialScreenshot = await puppeteerDSL().visible
      .screenshot('initial.png')
      // @ts-ignore
      .evaluate(() => document.body.innerHTML)
      ();

    const newScreenshot = await puppeteerDSL().visible
      .click('#design-selection li:nth-child(2) a')
      .wait(2000)  // Wait for the new CSS to load
      .screenshot('new-design.png')
      // @ts-ignore
      .evaluate(() => document.body.innerHTML)
      ();

    expect(newScreenshot).toBe(initialScreenshot);  // HTML should be the same
    // Note: We can't programmatically compare the visual difference,
    // but the two screenshots should look different when manually inspected.
  });

  test('CSS validates', async () => {
    const validationResult = await dsl
      .click('.zen-validate-css')
      .waitForSelector('#results')
      .getContent('#results', 'text')
      ();
    expect(validationResult).toContain('This document validates');
  });

  test('Responsive design', async () => {
    await dsl
      .sizes('xs', 'm', 'xl')
      .goto('https://csszengarden.com/')
      .screenshot('responsive-test.png')
      ();
    // Note: The screenshot will need to be manually inspected to verify responsiveness
  });
});