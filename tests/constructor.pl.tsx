import { expect, test } from '@playwright/test';

const mockUserResponse = {
  success: true,
  user: {
    email: 'test@example.com',
    name: 'Test User',
  },
};

const mockOrderResponse = {
  success: true,
  name: 'Краторный марсианский бургер',
  order: {
    number: 12345,
  },
};

test.describe('Страница конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
  await page.routeFromHAR('tests/fixtures/ingredients.har', {
    url: '**/api/ingredients',
    update: false,
  });
});

  test('добавление булки и начинки в конструктор', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Краторная булка N-200i').first()).toBeVisible();
    await expect(
      page.getByText('Биокотлета из марсианской Магнолии').first()
    ).toBeVisible();

    const bunCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Краторная булка N-200i' })
      .first();
    await bunCard.getByRole('button', { name: /добавить/i }).click();

    const mainCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Биокотлета из марсианской Магнолии' })
      .first();
    await mainCard.getByRole('button', { name: /добавить/i }).click();

    await expect(
      page.getByText(/Краторная булка N-200i/i).first()
    ).toBeVisible();
    await expect(
      page.getByText(/Биокотлета из марсианской Магнолии/i).nth(1)
    ).toBeVisible();
  });

  test('работа модального окна ингредиента: открытие, закрытие по крестику и по оверлею', async ({
    page,
  }) => {
    await page.goto('/');

    const modalRoot = page.locator('#modals');
    await page.getByText('Краторная булка N-200i').first().click();
    await expect(modalRoot).not.toBeEmpty();
    await expect(modalRoot.getByText('Краторная булка N-200i')).toBeVisible();

    await modalRoot.getByRole('button', { name: /закрыть/i }).click();
    await expect(modalRoot).toBeEmpty();

    await page.getByText('Краторная булка N-200i').first().click();
    await expect(modalRoot).not.toBeEmpty();

    const overlay = modalRoot.locator('[class*="overlay"]').first();
    if ((await overlay.count()) > 0) {
      await overlay.click({ position: { x: 10, y: 10 } });
    } else {
      await page.mouse.click(10, 10);
    }
    await expect(modalRoot).toBeEmpty();
  });

  test('создание заказа с моками пользователя, заказа и токенов', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'accessToken=Bearer mock-access-token';
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
    });

    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUserResponse),
      });
    });

    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockOrderResponse),
        });
      } else {
        await route.continue();
      }
    });
    await page.goto('/');

    const bunCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Краторная булка N-200i' })
      .first();
    await bunCard.getByRole('button', { name: /добавить/i }).click();

    const mainCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Биокотлета из марсианской Магнолии' })
      .first();
    await mainCard.getByRole('button', { name: /добавить/i }).click();

    await page.getByRole('button', { name: /оформить заказ/i }).click();

    const modalRoot = page.locator('#modals');
    await expect(modalRoot).not.toBeEmpty();
    await expect(modalRoot.getByText('12345')).toBeVisible();

    await modalRoot.getByRole('button', { name: /закрыть/i }).click();
    await expect(modalRoot).toBeEmpty();

    await expect(page.getByText(/выберите булки/i).first()).toBeVisible();
  });
});
