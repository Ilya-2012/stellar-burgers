import { expect, test, type Page } from '@playwright/test';

const BUN_NAME = 'Краторная булка N-200i';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';
const HAR_PATH = 'tests/hars/burger-api.har';

const addIngredient = async (page: Page, name: string): Promise<void> => {
  const card = page.getByRole('listitem').filter({ hasText: name }).first();
  await card.getByRole('button', { name: /добавить/i }).click();
};

test.describe('Страница конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR(HAR_PATH, {
      url: '**/api/**',
      update: false,
    });

    await page.goto('/');
  });

  test('добавление булки и начинки в конструктор', async ({ page }) => {
    const burgerConstructor = page.getByTestId('burger-constructor');

    await expect(burgerConstructor.getByText(BUN_NAME)).toHaveCount(0);
    await expect(burgerConstructor.getByText(MAIN_NAME)).toHaveCount(0);

    await addIngredient(page, BUN_NAME);
    await addIngredient(page, MAIN_NAME);

    await expect(burgerConstructor.getByText(BUN_NAME).first()).toBeVisible();
    await expect(burgerConstructor.getByText(MAIN_NAME).first()).toBeVisible();
  });

  test('работа модального окна ингредиента: открытие, закрытие по крестику и по оверлею', async ({
    page,
  }) => {
    const modalRoot = page.locator('#modals');

    await expect(modalRoot).toBeEmpty();
    await page.getByText(BUN_NAME).first().click();
    await expect(modalRoot).not.toBeEmpty();
    await expect(modalRoot.getByText(BUN_NAME)).toBeVisible();

    await modalRoot.getByRole('button', { name: /закрыть/i }).click();
    await expect(modalRoot).toBeEmpty();

    await expect(modalRoot).toBeEmpty();
    await page.getByText(BUN_NAME).first().click();
    await expect(modalRoot).not.toBeEmpty();

    const overlay = modalRoot.locator('[class*="overlay"]').first();
    await expect(overlay).toBeVisible();
    await overlay.click({ position: { x: 10, y: 10 } });
    await expect(modalRoot).toBeEmpty();
  });

  test('после оформления заказа показывается окно с номером, а конструктор очищается', async ({
    page,
  }) => {
    const burgerConstructor = page.getByTestId('burger-constructor');
    const modalRoot = page.locator('#modals');

    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { email: 'test@test.ru', name: 'Test User' },
        }),
      });
    });

    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            name: 'Краторный марсианский бургер',
            order: { number: 12345 },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.addInitScript(() => {
      document.cookie = 'accessToken=Bearer mock-access-token';
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
    });

    await page.reload();

    await addIngredient(page, BUN_NAME);
    await addIngredient(page, MAIN_NAME);

    await expect(burgerConstructor.getByText(BUN_NAME).first()).toBeVisible();
    await expect(burgerConstructor.getByText(MAIN_NAME).first()).toBeVisible();
    await expect(modalRoot).toBeEmpty();

    await page.getByRole('button', { name: /оформить заказ/i }).click();

    await expect(modalRoot).not.toBeEmpty();
    await expect(modalRoot.getByText(/12345/)).toBeVisible();

    await modalRoot.getByRole('button', { name: /закрыть/i }).click();
    await expect(modalRoot).toBeEmpty();

    await expect(burgerConstructor.getByText(BUN_NAME)).toHaveCount(0);
    await expect(burgerConstructor.getByText(MAIN_NAME)).toHaveCount(0);
    await expect(page.getByText(/выберите булки/i).first()).toBeVisible();
  });
});
