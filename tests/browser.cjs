/* Optional end-to-end checks. Requires Playwright and a running static server.
   PORTFOLIO_URL defaults to http://127.0.0.1:8080.
   CHROMIUM_EXECUTABLE_PATH may point to an existing Chromium installation. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const base = (process.env.PORTFOLIO_URL || "http://127.0.0.1:8080").replace(/\/$/, "");
const pages = fs.readdirSync(root).filter(file => file.endsWith(".html"))
  .concat(fs.readdirSync(path.join(root, "projects"))
    .filter(file => file.endsWith(".html")).map(file => "projects/" + file));

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-zygote"]
  });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    const brokenResources = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("response", response => {
      if (response.url().startsWith(base) && response.status() >= 400) {
        brokenResources.push(response.status() + " " + response.url());
      }
    });
    await page.addInitScript(() => {
      window.introProbe = {};
      new MutationObserver(() => {
        const intro = document.getElementById("site-loader");
        if (intro && !window.introProbe.start) window.introProbe.start = performance.now();
        if (!intro && window.introProbe.start && !window.introProbe.end) {
          window.introProbe.end = performance.now();
        }
      }).observe(document, { childList: true, subtree: true });
      document.addEventListener("portfolio:ready", () => {
        window.introProbe.ready = performance.now();
      });
    });

    // Real-time stroke drawing, a two-second total duration, and delayed reveals.
    await page.goto(base + "/index.html", { waitUntil: "domcontentloaded" });
    assert.equal(await page.locator("#site-loader").getAttribute("data-duration"), "2000");
    assert.equal(await page.locator("main").evaluate(el => getComputedStyle(el).visibility), "hidden");
    assert.equal(await page.locator("#hero-title").evaluate(el => el.classList.contains("is-visible")), false);
    const stroke = page.locator(".site-loader__signature path").first();
    const initialDash = await stroke.evaluate(el => parseFloat(getComputedStyle(el).strokeDashoffset));
    await page.waitForTimeout(160);
    const nextDash = await stroke.evaluate(el => parseFloat(getComputedStyle(el).strokeDashoffset));
    assert(nextDash < initialDash, "The pen stroke must actually draw, not just fade in.");
    await page.locator("#site-loader").waitFor({ state: "detached" });
    const timing = await page.evaluate(() => window.introProbe);
    assert(timing.end - timing.start >= 1950 && timing.end - timing.start <= 2300, JSON.stringify(timing));
    assert(timing.ready - timing.start >= 1690 && timing.ready - timing.start <= 2050, JSON.stringify(timing));
    await page.waitForFunction(() => document.getElementById("hero-title").classList.contains("is-visible"));
    console.log("PASS: stroke animation, two-second lifecycle, and reveal sequencing");

    // Every root page and nested case study gets the same intro and correct links.
    for (const file of pages) {
      await page.goto(base + "/" + file, { waitUntil: "domcontentloaded" });
      assert(await page.locator("#site-loader").isVisible(), file + " must show the intro");
      await page.getByRole("button", { name: "Skip intro" }).click();
      assert.equal(await page.locator("#site-loader").count(), 0);
      const calls = await page.locator('a[href^="tel:"]').evaluateAll(links => links.map(link => link.getAttribute("href")));
      const chats = await page.locator('a[href*="wa.me/"]').evaluateAll(links => links.map(link => link.getAttribute("href")));
      assert(calls.length && calls.every(href => href === "tel:+919005564240"), file);
      assert(chats.length && chats.every(href => href === "https://wa.me/919005564240"), file);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(brokenResources, []);
    console.log("PASS: all " + pages.length + " pages, contact links, and skip control");

    await page.goto(base + "/about.html", { waitUntil: "domcontentloaded" });
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#site-loader").count(), 0);
    assert.equal(await page.evaluate(() => document.activeElement.id), "main");
    await page.goto(base + "/about.html", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })));
    assert.equal(await page.locator("#site-loader").count(), 0);
    console.log("PASS: keyboard skip and back/forward-cache cleanup");

    const reduced = await browser.newContext({ reducedMotion: "reduce" });
    const accessible = await reduced.newPage();
    await reduced.grantPermissions(["clipboard-read", "clipboard-write"], { origin: new URL(base).origin });
    await accessible.goto(base + "/contact.html", { waitUntil: "domcontentloaded" });
    assert.equal(await accessible.locator("#site-loader").count(), 0);
    await accessible.getByRole("button", { name: "Copy Sarim Khan's phone number" }).click();
    await accessible.locator('[data-copy="+91 90055 64240"] [data-copy-label]').filter({ hasText: "Copied!" }).waitFor();
    assert.equal(await accessible.evaluate(() => navigator.clipboard.readText()), "+91 90055 64240");
    console.log("PASS: reduced-motion bypass and phone clipboard action");

    // Keep existing project filters, sorting, gallery filters, and lightbox working.
    await accessible.goto(base + "/projects.html");
    await accessible.locator("[data-search]").fill("Infosys");
    assert.equal(await accessible.locator("[data-item]:not([hidden])").count(), 1);
    await accessible.locator('[data-filter="BFSI"]').click();
    assert.equal(await accessible.locator("[data-item]:not([hidden])").count(), 0);
    await accessible.locator("[data-search]").fill("");
    assert(await accessible.locator("[data-item]:not([hidden])").count() > 0);
    await accessible.locator("[data-sort]").selectOption("value");
    const values = await accessible.locator("[data-item]:not([hidden])").evaluateAll(items => items.map(item => Number(item.dataset.value)));
    assert.deepEqual(values, values.slice().sort((a, b) => b - a));
    await accessible.goto(base + "/gallery.html");
    const totalPhotos = await accessible.locator("[data-gallery-item].show").count();
    await accessible.locator("[data-gallery] [data-group]").filter({ has: accessible.locator("button") }).count();
    await accessible.locator("[data-gallery] button[data-group]").nth(1).click();
    const filteredPhotos = await accessible.locator("[data-gallery-item].show").count();
    assert(filteredPhotos > 0 && filteredPhotos < totalPhotos);
    await accessible.goto(base + "/media.html");
    await accessible.locator("[data-lightbox]").first().click();
    assert(await accessible.locator("#lightbox").isVisible());
    await accessible.keyboard.press("Escape");
    assert.equal(await accessible.locator("#lightbox").isVisible(), false);
    console.log("PASS: existing filters, sort, and portrait lightbox");

    for (const width of [320, 390, 768, 1024, 1440]) {
      await accessible.setViewportSize({ width, height: 900 });
      await accessible.goto(base + "/index.html");
      const layout = await accessible.evaluate(() => {
        const heading = document.getElementById("hero-title");
        return {
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          headingHeight: heading.getBoundingClientRect().height,
          fontSize: parseFloat(getComputedStyle(heading).fontSize)
        };
      });
      assert(layout.scrollWidth <= layout.width, "Horizontal overflow: " + JSON.stringify(layout));
      assert(layout.headingHeight < layout.fontSize * 1.5, "Name must stay on one line: " + width);
    }
    await accessible.setViewportSize({ width: 390, height: 844 });
    await accessible.goto(base + "/index.html");
    const toggle = accessible.locator(".nav-toggle");
    await toggle.click();
    assert.equal(await toggle.getAttribute("aria-expanded"), "true");
    assert.equal(await accessible.evaluate(() => document.activeElement.textContent.trim()), "About");
    await accessible.keyboard.press("Shift+Tab");
    assert.equal(await accessible.evaluate(() => document.activeElement.className), "nav-toggle");
    await accessible.keyboard.press("Escape");
    assert.equal(await toggle.getAttribute("aria-expanded"), "false");
    assert.equal(await accessible.evaluate(() => document.activeElement.className), "nav-toggle");
    console.log("PASS: 320–1440px responsive layout and keyboard-friendly mobile menu");

    const noScripts = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const fallback = await noScripts.newPage();
    await fallback.goto(base + "/index.html");
    assert.equal(await fallback.locator("#site-loader").count(), 0);
    assert(await fallback.locator("#hero-title").isVisible());
    assert(await fallback.locator("#primary-nav a").first().isVisible());
    const independent = await browser.newContext();
    const failedInteractions = await independent.newPage();
    await failedInteractions.route("**/assets/js/main.js", route => route.abort());
    await failedInteractions.goto(base + "/index.html", { waitUntil: "domcontentloaded" });
    assert(await failedInteractions.locator("#site-loader").isVisible());
    await failedInteractions.locator("#site-loader").waitFor({ state: "detached" });
    assert(await failedInteractions.locator("#hero-title").isVisible());
    console.log("PASS: no-JavaScript navigation and independent loader cleanup");
    console.log("All browser regressions passed.");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
