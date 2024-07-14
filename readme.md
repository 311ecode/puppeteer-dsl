# 🎭 PuppeteerDSL: Browser Automation for Humans (and their Grandmas)

## 🚨 Alpha Version Alert: Proceed with Curiosity!

**Current Version: 0.0.1**

Hey there, brave explorer! You've stumbled upon PuppeteerDSL in its wild, untamed alpha stage. What does this mean? Well:

- The API might do backflips and change overnight.
- Features could appear, disappear, or turn into something entirely different.
- Bugs? Oh, you bet. Think of them as "surprise features".

But here's the fun part: we need YOU! Your feedback, your wild ideas, your bug reports - they're all gold to us. Help us shape PuppeteerDSL into the browser automation tool of your dreams!

## 🚀 Quick Start: Zero to Hero

```javascript
import puppeteerDSL from './puppeteerDSL';

(async () => {
  const result = await puppeteerDSL()
    .visible
    .goto('https://example.com')
    .waitForSelector('h1')
    .getContent('h1', 'text')
    .screenshot('example.png')
    ();

  console.log(result);
})();

This little script does a whole lot:
1. 🌐 Launches a browser you can actually see (no sneaky headless stuff here)
2. 🏃‍♂️ Zooms over to example.com
3. ⏳ Patiently waits for the h1 to show up (it's polite)
4. 📝 Grabs the text from that h1
5. 📸 Takes a snapshot for posterity
6. 🔒 Closes up shop and hands you the h1 text

## 🎭 Why PuppeteerDSL? Because We Like You

Look, we made PuppeteerDSL for a simple reason: we wanted browser automation to be so easy, your grandmother could read it. Heck, maybe even write it (Go, Grandma!). But don't let the simplicity fool you – under the hood, this thing is as serious as a heart attack.

We're taking Oscar Wilde's advice here: "If you want to tell people the truth, make them laugh, otherwise they'll kill you." So we made it fun, but we're dead serious about its capabilities.

## 🛠 The Toolkit: Configuration and Action Methods

### Configuration Methods: Set the Stage

Throw these in any order you like - it's like toppings on a pizza!

- `.browser(browser: Browser)`: BYOB (Bring Your Own Browser)
- `.page(page: Page)`: For the commitment-phobes
- `.visible`: When you need to see what's going on
- `.closeAfterUse`: For the tidy among us (default)
- `.openAfterUse`: For the "leave the party last" types
- `.screenshotPath(path: string)`: Your digital photo album
- `.sizes(...sizes: Size[])`: Because size does matter (default is just 'm')
- `.parallelScreenExecution`: Multitasking like a pro

### Action Methods: Where the Magic Happens

Chain these bad boys to create a symphony of automation:

- `.goto(url: string)`: Your ticket to the web
- `.waitForSelector(selector: string)`: Patience is a virtue
- `.click(selector?: string)`: Poke the web
- `.type(selector: string, text: string)`: Express yourself
- `.getContent(selector: string, type: ContentType)`: Web harvesting
- `.wait(ms: number)`: Take a breather
- `.screenshot(filename?: string)`: Say cheese!
- `.evaluate(fn: Function, ...args: any[])`: Inception-level stuff
- `.select(selector: string, ...values: string[])`: Choose your own adventure
- `.hover(selector?: string)`: Play hard to get
- `.interceptRequest(callback: (request: Request) => void)`: Be the middleman
- `.interceptResponse(callback: (response: Response) => void)`: Eavesdrop on the web
- `.addSize(name: string, width: number, height: number)`: Tailor-made browsing
- `.noFail`: Keep calm and carry on

## 🌈 Flexibility is Our Middle Name

### BYOB: Bring Your Own Browser

Hey, we get it. Sometimes you want to use your own browser. Maybe it's got special powers, or maybe you just like it better. No worries! PuppeteerDSL is cool with that. Here's how you can use your own browser:

```javascript
const puppeteer = require('puppeteer');
const puppeteerDSL = require('puppeteer-dsl');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await puppeteerDSL()
    .browser(browser)  // Use your own browser
    .goto('https://example.com')
    .screenshot('my-custom-browser.png')
  ();

  await puppeteerDSL()
    .page(browser)  // Use your own browser
    .goto('https://example.com')
    .screenshot('my-custom-browser.png')
  (); // by default we close the page.. but not the browser

    
  await browser.close();
})();
```

### Open or Closed: You Decide

PuppeteerDSL is flexible about what happens after your script runs:

- By default, if PuppeteerDSL creates a browser, it'll close it when your script is done. Tidy!
- If you pass in your own browser, we assume you want to keep it open. We're not going to slam your browser shut without permission!

But hey, you're the boss. You can override these defaults:

```javascript
// Keep the browser open, even if PuppeteerDSL created it
puppeteerDSL()
  .page(myCustomPage)
  .openAfterUse // if the browser is created by PuppeteerDSL, it will be closed anyways
  .goto('https://example.com')
  .screenshot('staying-open.png')
  ();

// Close the browser, even if you provided it
puppeteerDSL()
  .browser(myCustomBrowser)
  .closeAfterUse
  .goto('https://example.com')
  .screenshot('closing-time.png')
  ();
```

Remember, with great power comes great responsibility. If you keep browsers open, make sure to close them eventually, or your computer might start to feel a bit... crowded.

## Size Specifiers: Dress Your Browser

By default, PuppeteerDSL uses the 'm' (medium) resolution. But you can be a size queen if you want! Just prepend these to any action for responsive testing:

`.xs`, `.s`, `.m`, `.l`, `.xl`: It's like choosing your browser's outfit for the day.

Want to test multiple sizes? No problem! Use the `.sizes()` method:

```javascript
puppeteerDSL()
  .sizes('xs', 'm', 'xl')
  .goto('https://example.com')
  .screenshot('responsive-test.png')
  ();
```

This will run the subsequent actions for each specified size. Neat, huh?

### Selector Memory: We Remember So You Don't Have To

Some commands need selectors, and we're not about making you type more than you need to. These commands will remember the last selector used:

- `waitForSelector`
- `click`
- `type`
- `hover`

So you can do cool stuff like this:

```javascript
puppeteerDSL()
  .waitForSelector('.cool-button')
  .hover
  .wait(100)
  .click
  ();
```

No need to repeat `.cool-button` for `hover` and `click`. We've got your back!

### The Magic of .noFail: Because Stuff Happens

Web scraping can be unpredictable. Sometimes elements don't load, or they're not where you expect them to be. That's where `.noFail` comes in handy:

```javascript
puppeteerDSL()
  .goto('https://flaky-website.com')
  .waitForSelector('.might-not-exist').noFail
  .click('.another-iffy-element').noFail
  .screenshot('we-tried.png')
  ();
```

With `.noFail`, your script keeps going even if it hits a snag. It's like giving your code a chill pill.

## 🎬 The Grand Finale: Don't Forget to Say "Action!"

Here's the secret sauce: end your chain with `()`. It's like saying "Action!" on a movie set. Without it, your script is just a beautiful, but motionless, work of art.

```javascript
puppeteerDSL()
  .visible
  .goto('https://example.com')
  .xl.screenshot('big-screen.png')
  .xs.screenshot('tiny-screen.png')
  () // <- This is where the magic happens!
```

We thought it was pretty cool to let you pick screen sizes on the fly. It's like having a shape-shifting browser at your command. At the end of the day, it's all about making your life easier. Because let's face it, web automation should be a breeze, not a hurricane.

## 🌟 Examples: Seeing is Believing

### 🔐 Login to a Website (Don't worry, we won't tell)

```javascript
await puppeteerDSL()
  .goto('https://example.com/login')
  .waitForSelector('#username')
  .type('cooluser123')
  .waitForSelector('#password')
  .type('password123') // Please use a better password in real life
  .click('#login-button')
  .waitForSelector('.dashboard')
  .screenshot('i-am-in.png')
  ();
```

### 📊 Scrape Data from a Table (Legal purposes only, wink wink)

```javascript
const tableData = await puppeteerDSL()
  .goto('https://example.com/data-table')
  .waitForSelector('table')
  .evaluate(() => {
    const rows = document.querySelectorAll('table tr');
    return Array.from(rows, row => {
      const cells = row.querySelectorAll('td');
      return Array.from(cells, cell => cell.textContent);
    });
  })
  ();

console.log(tableData);
```

### 🎨 Test Responsive Design (Because size matters)

```javascript
await puppeteerDSL()
  .sizes('xs', 'm', 'xl')
  .goto('https://example.com')
  .screenshot('homepage.png')
  .waitForSelector('#menu-button')
  .click.noFail
  .wait(1000)
  .screenshot('menu-open.png')
  .xs.getContent('.mobile-only', 'text').noFail
  .xl.getContent('.desktop-only', 'text').noFail
  ();
```

## 🤖 GitHub Test Automation: Let the Robots Do the Work

[... GitHub Actions section remains the same ...]

## 🎉 Wrapping Up: Go Forth and Automate!

So there you have it, folks. PuppeteerDSL: making browser automation so simple, your grandma could do it (and if she does, please send us pictures).

Remember, this is an alpha version, so things might break. But hey, that's part of the fun, right? Your feedback, bug reports, and wild ideas are what will make this tool great. So don't be shy - let us know what you think!

Now go forth, chain those methods, mix and match sizes, and create symphonies of automation. And remember, in the world of PuppeteerDSL, the only limit is your imagination.

Happy scripting, and may all your tests pass on the first try! (Hey, we can dream, right?) 🚀🎭
```

This updated documentation now includes:
- A new section on using your own browser (BYOB: Bring Your Own Browser)
- Information about the `.openAfterUse` and `.closeAfterUse` options
- Explanations of the default behavior for closing browsers
- Examples of how to use these features

