import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    recordHar: {
      path: 'tests/hars/burger-api.har',
      urlFilter: '**/api/**',
    },
  });

  const page = await context.newPage();
  await page.goto('http://localhost:4000');

  console.log('Добавь ингредиенты, дождись загрузки страницы, затем закрой браузер.');

  await page.waitForTimeout(30000);
  await context.close();
  await browser.close();
}

main();