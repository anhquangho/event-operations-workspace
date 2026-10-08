import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const routes = [
  ['/mock', '01-workspace.png', 'From prototype to a shared workspace'],
  ['/workflow', '02-workflow.png', 'Connect the workflow, preserve the product'],
  ['/architecture', '03-architecture.png', 'A practical stack for an existing MVP'],
  ['/before-after', '04-before-after.png', 'Extend an existing MVP'],
];
const output = join(process.cwd(), 'exports');
await mkdir(output, { recursive: true });
const server = await createServer({ server: { host: '127.0.0.1', port: 4179, strictPort: true } });
let browser;
const errors = [];

try {
  await server.listen();
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 2 });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

  for (const [route, filename, title] of routes) {
    const response = await page.goto(`http://127.0.0.1:4179${route}`, { waitUntil: 'networkidle' });
    if (!response?.ok()) throw new Error(`${route} returned HTTP ${response?.status()}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    const dimensions = await page.evaluate(() => ({
      board: document.querySelector('.board')?.getBoundingClientRect().toJSON(),
      document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
    }));
    if (await page.locator('.board-heading h1').textContent() !== title) throw new Error(`${route} rendered the wrong board heading`);
    if (dimensions.board?.width !== 1600 || dimensions.board?.height !== 1200) throw new Error(`${route} board is not 1600 × 1200 CSS px`);
    if (dimensions.document.width !== 1600 || dimensions.document.height !== 1200) throw new Error(`${route} has unexpected document overflow: ${JSON.stringify(dimensions.document)}`);
    await page.screenshot({ path: join(output, filename), animations: 'disabled', caret: 'hide' });
    console.log(`${route} → exports/${filename} (${dimensions.board.width * 2} × ${dimensions.board.height * 2} PNG)`);
  }

  await page.goto('http://127.0.0.1:4179/mock', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Collect dietary notes/ }).click();
  if (await page.locator('.inspector-pane h3').textContent() !== 'Collect dietary notes') throw new Error('Task selection did not update the inspector');
  await page.getByLabel('Task status').selectOption('Done');
  if (await page.locator('.task-row-selected .task-check-done').count() !== 1) throw new Error('Task status did not update the agenda row');
  await page.getByRole('button', { name: 'Assigned to me' }).click();
  if (await page.getByRole('button', { name: /Collect dietary notes/ }).count() !== 0) throw new Error('Task filter did not filter the fictional dataset');
  await page.getByRole('button', { name: 'All tasks' }).click();
  await page.getByRole('button', { name: 'Preview' }).click();
  if (await page.locator('.template-popover').count() !== 1) throw new Error('Template preview did not open');
  await page.locator('.create-button').click();
  if (await page.getByRole('dialog').count() !== 1) throw new Error('Illustrative event preview did not open');
  if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`);
  console.log('Workspace selection, local status, filter, template preview, and event preview checks passed.');
  console.log('All four boards rendered without browser console or page errors.');
} finally {
  if (browser) await browser.close();
  await server.close();
}
