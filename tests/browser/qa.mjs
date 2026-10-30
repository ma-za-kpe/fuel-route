// Frozen browser and accessibility checks for the built site (owner-owned).
// Accessibility is checked as journeys a person takes (T-0936), on every page
// and on phone and desktop:
// - keyboard: Tab reaches the skip link first (if there is one), then every
//   link, button and the call to action, in page order;
// - focus-visible: each focused element looks different from unfocused
//   (outline, box-shadow, border or background);
// - focus-not-obscured: a sticky or fixed header never hides the focused
//   element entirely (WCAG 2.4.11), and focus never lands off screen;
// - reflow-320: at 320 CSS px no sideways scrolling and no text clipped or
//   cut off in the main landmark (WCAG 1.4.10);
// - text-zoom-200: with the root font size doubled, the same (WCAG 1.4.4);
// - reduced-motion: no animation and no smooth scrolling when reduced motion
//   is requested;
// - screen-reader: heading levels never skip and no visible text is hidden
//   from assistive technology.
// Each failure prints one located line first:
//   a11y: <journey> <viewport> <page> <element>: <why>
// axe (WCAG 2.1 AA) runs too, as supporting evidence: automated checks are
// preliminary, the journeys are the evidence. The page also loads cleanly
// with a title. Every page is checked: the root and each same-origin page it
// links to, transitively.
// CI serves the built site and runs: node tests/browser/qa.mjs URL
// The URL may be the site's Pages path (`http://127.0.0.1:8001/<repo>/`,
// T-0504): pages are named relative to it, and a link that leaves it fails.
// Compatibility (T-0259): CREW_BROWSER picks the engine (chromium, the
// default, firefox or webkit) and CREW_DEVICE a Playwright device to emulate
// as the phone (e.g. "iPhone 13"). One run is one attempt, never repeated:
// its first failure is its result. The receipt names the engine, its version,
// the device and the base path; CREW_QA_OUT is where it and the screenshots go.
import assert from 'node:assert/strict';
import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium, firefox, webkit, devices } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const target = process.argv[2] ?? 'http://127.0.0.1:8000/';
const engines = { chromium, firefox, webkit };
const engine = process.env.CREW_BROWSER || 'chromium';
assert.ok(Object.hasOwn(engines, engine), `unknown browser: ${engine}`);
const device = process.env.CREW_DEVICE || '';
assert.ok(!device || Object.hasOwn(devices, device), `unknown device: ${device}`);
const out = process.env.CREW_QA_OUT || 'qa-artifacts';
// The site's base path: `/` at the root, `/<repo>/` under Pages.
const base = new URL(target).pathname.replace(/[^/]*$/, '');
// A task pull request into release/<n> (CREW_PARTIAL=1): a linked page that is
// not built yet (404) is named and skipped; the root must always load. Main
// and the release pull request check every page.
const partial = process.env.CREW_PARTIAL === '1';
const deadline = Date.now() + 15000;
let ready = false;
while (Date.now() < deadline && !ready) {
  try {
    ready = (await fetch(target, { signal: AbortSignal.timeout(500) })).ok;
  } catch { /* bounded readiness, no success inferred */ }
  if (!ready) await new Promise(resolve => setTimeout(resolve, 100));
}
assert(ready, 'site not served within 15 seconds');

// In every page before its own scripts: name an element for a person
// (`main > p.price`), and find text that is clipped or runs out of view.
function helpers() {
  window.__qaLocate = el => {
    const parts = [];
    for (let node = el; node && node.nodeType === 1 && parts.length < 4; node = node.parentElement) {
      let part = node.tagName.toLowerCase();
      if (node.id) { parts.unshift(`${part}#${node.id}`); break; }
      const names = [...node.classList].slice(0, 2);
      if (names.length) part += '.' + names.join('.');
      parts.unshift(part);
      if (part === 'main' || part === 'body') break;
    }
    return parts.join(' > ').slice(0, 100);
  };
  window.__qaClipped = () => {
    const found = [];
    const root = document.documentElement;
    if (root.scrollWidth > innerWidth) {
      found.push(['html', `the page scrolls sideways (${root.scrollWidth}px wide in ${innerWidth}px)`]);
    }
    const main = document.querySelector('main') || document.body;
    const hidden = (el, style) => style.visibility === 'hidden' || style.clip !== 'auto'
      || style.clipPath !== 'none';
    for (const el of [main, ...main.querySelectorAll('*')]) {
      if (found.length >= 5) break;
      const text = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (!text) continue;
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      // Not rendered, or visually hidden on purpose for screen readers.
      if (box.width <= 1 || box.height <= 1 || hidden(el, style)) continue;
      const clips = s => /hidden|clip/.test(s.overflowX + s.overflowY);
      if (clips(style) && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) {
        found.push([window.__qaLocate(el), `text clipped by its own overflow `
          + `(${el.scrollWidth}×${el.scrollHeight}px content in ${el.clientWidth}×${el.clientHeight}px)`]);
        continue;
      }
      let scroller = false;
      let cut = null;
      for (let up = el.parentElement; up && up !== document.body; up = up.parentElement) {
        const s = getComputedStyle(up);
        // A region that scrolls on its own (a wide table) is allowed by 1.4.10.
        // So is anything inside a visually hidden (screen-reader only) element.
        const b = up.getBoundingClientRect();
        if (/auto|scroll/.test(s.overflowX) || hidden(up, s) || b.width <= 1 || b.height <= 1) {
          scroller = true;
          break;
        }
        if (clips(s) && (box.right > b.right + 1 || box.left < b.left - 1
          || box.bottom > b.bottom + 1 || box.top < b.top - 1)) { cut = up; break; }
      }
      if (scroller) continue;
      if (cut) {
        found.push([window.__qaLocate(el), `text cut off by ${window.__qaLocate(cut)}`]);
      } else if (box.right > innerWidth + 1 || box.left < -1) {
        found.push([window.__qaLocate(el), `text runs out of the ${innerWidth}px viewport `
          + `(from ${Math.round(box.left)}px to ${Math.round(box.right)}px)`]);
      }
    }
    return found;
  };
}

await mkdir(out, { recursive: true });
const browser = await engines[engine].launch(
  engine === 'chromium' ? { args: ['--disable-dev-shm-usage'] } : {});
const receipts = [];
// The screenshots, listed for a person to review (a gallery, not a verdict).
const gallery = [];
let complete = false;
// The pages to check: the root first, then each same-origin page link found
// on a checked page (fragments and queries dropped, assets skipped).
const pages = [target];
const origin = new URL(target).origin;
// Same-origin page links outside the base path: broken once on Pages.
const outside = [];
function discover(links) {
  for (const href of links) {
    const url = new URL(href);
    url.hash = '';
    url.search = '';
    if (url.pathname.endsWith('/index.html')) url.pathname = url.pathname.slice(0, -'index.html'.length);
    const last = url.pathname.split('/').pop();
    if (url.origin !== origin || (last.includes('.') && !last.endsWith('.html'))) continue;
    // A link home under Pages may be the bare `/<repo>`.
    if (url.pathname + '/' === base) url.pathname = base;
    if (!url.pathname.startsWith(base)) {
      if (!outside.includes(url.pathname)) outside.push(url.pathname);
      continue;
    }
    if (!pages.includes(url.href)) pages.push(url.href);
  }
}
// Phone and desktop, or only the emulated device as the phone.
const views = device
  ? [['phone', devices[device].viewport.width, devices[device].viewport.height]]
  : [['desktop', 1440, 1000], ['phone', 390, 844]];
try {
  for (const [viewport, width, height] of views) {
    const context = await browser.newContext({ ...(device ? devices[device] : {}),
      viewport: { width, height }, reducedMotion: 'reduce' });
    await context.addInitScript(helpers);
    for (const url of pages) {
      // One page on one viewport, named from the base path; the root keeps
      // its old screenshot name.
      const path = '/' + new URL(url).pathname.slice(base.length);
      const name = url === target ? viewport : `${viewport} ${path}`;
      const spot = `${viewport} ${path}`;
      const shot = url === target ? viewport : `${viewport}${path.replace(/[^a-z0-9]+/gi, '-')}`;
      // One located line per accessibility failure, before the assertion.
      const failed = new Set();
      const report = (journey, where, detail) => {
        failed.add(journey);
        console.log(`a11y: ${journey} ${spot} ${where}: ${detail}`);
      };
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', () => errors.push('page error'));
      page.on('response', r => { if (r.status() >= 400) errors.push('asset ' + r.status()); });
      const loaded = await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
      if (partial && url !== target && loaded && loaded.status() === 404) {
        console.log(`${spot}: not built yet, skipped`);
        await page.close();
        continue;
      }
      if (viewport === views[0][0]) {
        discover(await page.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.href)));
        assert.deepEqual(outside, [], `${name}: links leave the site's base path ${base}`);
      }
      assert.ok((await page.title()).trim(), name + ': the page needs a title');
      assert.equal(await page.evaluate(() =>
        document.documentElement.scrollWidth <= innerWidth), true, name + ': horizontal overflow');

      // Keyboard journey: Tab through every focusable element, in order.
      const stops = await page.evaluate(() => {
        const all = [...document.querySelectorAll(
          'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')];
        const look = el => {
          const s = getComputedStyle(el);
          return { outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`,
            shadow: s.boxShadow, background: s.backgroundColor,
            border: ['Top', 'Right', 'Bottom', 'Left']
              .map(side => s[`border${side}Width`] + ' ' + s[`border${side}Color`]).join(' ') };
        };
        all.forEach((el, i) => { el.dataset.qaIndex = String(i); });
        // How each element looks unfocused, to compare with its focused look.
        window.__qaRest = all.map(look);
        window.__qaLook = look;
        const skip = all.find(el => el.matches('a[href^="#"]') && /skip/i.test(el.textContent));
        return { count: all.length,
          ctas: all.flatMap((el, i) => el.classList.contains('cta') ? [i] : []),
          skip: skip ? { index: Number(skip.dataset.qaIndex), where: window.__qaLocate(skip),
            target: !!document.getElementById(decodeURIComponent(skip.hash.slice(1))) } : null,
          names: all.map(el => window.__qaLocate(el)) };
      });
      assert.ok(stops.count > 0, name + ': nothing to reach by keyboard');
      const focusStep = () => page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const index = el.dataset.qaIndex === undefined ? null : Number(el.dataset.qaIndex);
        const now = window.__qaLook(el);
        const rest = index === null ? null : window.__qaRest[index];
        const outlined = !/^none /.test(now.outline) && parseFloat(now.outline.split(' ')[1]) > 0;
        const ring = rest === null
          ? outlined || now.shadow !== 'none'
          : (outlined && now.outline !== rest.outline)
            || (now.shadow !== 'none' && now.shadow !== rest.shadow)
            || now.border !== rest.border || now.background !== rest.background;
        // Focus not obscured: some of it is in view and not under a sticky or
        // fixed element that does not contain it.
        const box = el.getBoundingClientRect();
        const points = [[0.5, 0.5], [0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]]
          .map(([x, y]) => [box.left + box.width * x, box.top + box.height * y]);
        let seen = false;
        let cover = null;
        for (const [x, y] of points) {
          if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
          const top = document.elementFromPoint(x, y);
          let over = null;
          for (let n = top; n && n !== document.documentElement; n = n.parentElement) {
            if (n === el || n.contains(el)) break;
            const position = getComputedStyle(n).position;
            if (position === 'fixed' || position === 'sticky') { over = n; break; }
          }
          if (over) cover = cover || `${window.__qaLocate(over)} (position: ${getComputedStyle(over).position})`;
          else seen = true;
        }
        return { index, where: window.__qaLocate(el), ring, seen, cover };
      });
      const order = [];
      const reached = new Set();
      for (let i = 0; i < stops.count + 2; i++) {
        await page.keyboard.press('Tab');
        let step = await focusStep();
        if (!step) continue;
        if (!step.ring) {
          // A focus style may still be transitioning in; look once more.
          await page.waitForTimeout(300);
          step = await focusStep();
        }
        if (!step.ring) {
          report('focus-visible', step.where,
            'no visible change on focus (outline, box-shadow, border and background as unfocused)');
        }
        if (!step.seen) {
          report('focus-not-obscured', step.where, step.cover
            ? `covered by ${step.cover}` : 'focused outside the viewport');
        }
        if (step.index !== null && !reached.has(step.index)) {
          if (order.length && step.index < order[order.length - 1]) {
            report('keyboard', step.where,
              `reached after ${stops.names[order[order.length - 1]]}, before it in the page`);
          }
          order.push(step.index);
          reached.add(step.index);
        }
      }
      if (stops.skip !== null) {
        if (order[0] !== stops.skip.index) {
          report('keyboard', stops.skip.where, 'the skip link is not the first Tab stop '
            + `(first: ${order.length ? stops.names[order[0]] : 'none'})`);
        }
        if (!stops.skip.target) report('keyboard', stops.skip.where, 'the skip link target is missing');
      }
      const missed = stops.names.filter((_, i) => !reached.has(i));
      for (const where of missed.slice(0, 5)) report('keyboard', where, 'Tab never reaches it');
      assert.ok(!failed.has('focus-visible'), name + ': no visible focus');
      assert.ok(!failed.has('focus-not-obscured'), name + ': focus hidden or off screen');
      assert.equal(missed.length, 0, name + ': Tab does not reach every link and button');
      assert.ok(stops.ctas.some(i => reached.has(i)), name + ': Tab never reaches the call to action');
      assert.ok(!failed.has('keyboard'), name + ': keyboard order');

      // Reduced motion: the page itself must stop moving, not just the browser.
      assert.equal(await page.evaluate(() =>
        matchMedia('(prefers-reduced-motion: reduce)').matches), true);
      const motion = await page.evaluate(() => ({
        moving: [...document.querySelectorAll('*')].filter(el => {
          const style = getComputedStyle(el);
          return style.animationName !== 'none' && parseFloat(style.animationDuration) > 0.01;
        }).slice(0, 5).map(el => window.__qaLocate(el)),
        smooth: getComputedStyle(document.documentElement).scrollBehavior === 'smooth',
      }));
      for (const where of motion.moving) report('reduced-motion', where, 'animates under reduced motion');
      if (motion.smooth) report('reduced-motion', 'html', 'scrollBehavior is smooth under reduced motion');
      assert.equal(motion.moving.length, 0, name + ': animations run under reduced motion');
      assert.ok(!motion.smooth, name + ': smooth scrolling under reduced motion');

      // What a screen reader user meets: heading levels never skip, and no
      // visible text is hidden from assistive technology.
      const levels = await page.evaluate(() =>
        [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
          .map(h => [Number(h.tagName[1]), window.__qaLocate(h)]));
      for (let i = 1; i < levels.length; i++) {
        if (levels[i][0] > levels[i - 1][0] + 1) {
          report('screen-reader', levels[i][1],
            `heading levels skip from h${levels[i - 1][0]} to h${levels[i][0]}`);
        }
        assert.ok(levels[i][0] <= levels[i - 1][0] + 1,
          `${name}: heading levels skip from h${levels[i - 1][0]} to h${levels[i][0]}`);
      }
      // Word by word: inline elements share one line of innerText ("Home Menu
      // Hours") but are separate nodes in the accessibility tree, so a phrase
      // match fails every inline navigation; a word that is shown and never
      // spoken is what hidden content looks like.
      const tokens = t => t.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
      const spoken = new Set(tokens(await page.locator('body').ariaSnapshot()));
      const shown = await page.evaluate(() => document.body.innerText.split('\n')
        .map(t => t.trim()).filter(t => /[\p{L}\p{N}]/u.test(t)));
      for (const text of shown) {
        const words = tokens(text).slice(0, 4).join(' ');
        const hidden = tokens(text).filter(w => !spoken.has(w));
        if (hidden.length) {
          report('screen-reader', 'body', `"${words}" is shown but hidden from screen readers`);
        }
        assert.ok(!hidden.length, `${name}: "${words}" is shown but hidden from screen readers`);
      }

      // Supporting evidence: axe's automated WCAG 2.1 AA rules. One line per
      // failing element, so whoever fixes it knows where and by how much: the
      // rule, viewport, page, element and, for contrast, the colours.
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      const violations = axe.violations.map(v => `${v.id} (${v.impact})`);
      for (const v of axe.violations) {
        for (const node of v.nodes.slice(0, 5)) {
          const data = (node.any.find(c => c.data && c.data.fgColor) || {}).data;
          const measured = data ? `: ${data.fgColor} on ${data.bgColor}, ${data.contrastRatio}:1 (needs ${data.expectedContrastRatio})` : '';
          console.log(`axe: ${v.id} (${v.impact}) ${spot} ${node.target.join(' ')}${measured}`);
        }
      }
      assert.deepEqual(violations, [], name + ': accessibility violations');
      assert.deepEqual(errors, [], name + ': load errors');
      await page.screenshot({ path: `${out}/${shot}.png`, fullPage: true });
      gallery.push({ page: path, viewport, width, height, file: `${shot}.png` });

      // Reflow (phone): at 320 CSS px wide nothing scrolls sideways and no text
      // is clipped. Text at 200% (desktop): the root font size doubled, the same.
      const journeys = { keyboard: true, 'focus-visible': true, 'focus-not-obscured': true };
      if (viewport === 'phone') {
        await page.setViewportSize({ width: 320, height: 640 });
        for (const [where, why] of await page.evaluate(() => window.__qaClipped())) {
          report('reflow-320', where, why);
        }
        await page.setViewportSize({ width, height });
        assert.ok(!failed.has('reflow-320'), name + ': content does not reflow at 320 CSS px');
        journeys['reflow-320'] = true;
      } else {
        const clipped = await page.evaluate(() => {
          const root = document.documentElement;
          const size = parseFloat(getComputedStyle(root).fontSize);
          root.style.setProperty('font-size', `${size * 2}px`, 'important');
          const found = window.__qaClipped();
          root.style.removeProperty('font-size');
          return found;
        });
        for (const [where, why] of clipped) report('text-zoom-200', where, why);
        assert.ok(!failed.has('text-zoom-200'), name + ': text at 200% is clipped or scrolls sideways');
        journeys['text-zoom-200'] = true;
      }
      journeys['reduced-motion'] = true;
      journeys['screen-reader'] = true;
      receipts.push({ viewport, page: path, width, height, journeys, stops: stops.count,
        skipLink: stops.skip !== null, loadErrors: 0,
        axe: { violations: 0, role: 'supporting evidence' } });
      await page.close();
    }
    await context.close();
  }
  complete = true;
} finally {
  await browser.close();
  // The receipt names what passed, also when a later page failed (complete: false).
  const receipt = { schema: 'crew.site-browser-qa@2', browser: browser.version(),
    engine, device: device || null, base, retries: 0, complete, receipts };
  await writeFile(`${out}/receipt.json`, JSON.stringify(receipt, null, 2) + '\n');
  await writeFile(`${out}/gallery.json`, JSON.stringify({ schema: 'crew.site-gallery@1',
    browser: receipt.browser, engine, device: receipt.device, base, shots: gallery }, null, 2) + '\n');
  console.log(JSON.stringify(receipt));
  if (process.env.GITHUB_STEP_SUMMARY) {
    const order = ['keyboard', 'focus-visible', 'focus-not-obscured', 'reflow-320', 'text-zoom-200',
      'reduced-motion', 'screen-reader'];
    const rows = receipts.map(r => `| ${r.page} | ${r.viewport} ${r.width}×${r.height} | `
      + `${order.filter(j => r.journeys[j]).join(', ')} | ${r.axe.violations} |`);
    await appendFile(process.env.GITHUB_STEP_SUMMARY, [
      '## Accessibility (owned by QA)', '',
      `${engine} ${receipt.browser}${device ? ` as ${device}` : ''}, site at ${base}`, '',
      complete ? 'Every page passed every journey.' : 'Not every page passed; see the a11y lines in the log.',
      '', '| Page | Viewport | Journeys passed | axe WCAG 2.1 AA violations (supporting evidence) |',
      '| --- | --- | --- | --- |', ...rows, ''].join('\n'));
  }
}
