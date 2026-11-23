import { fetchIngredients, ingredientsReducer } from '../ingredientsSlice';

import type { TIngredient } from '@/utils/types';

const mockIngredients: TIngredient[] = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'https://code.s3.yandex.net/react/code/meat-01.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
  },
];

describe('тесты редьюсера слайса ingredients', () => {
  const initialState = {
    ingredients: [],
    isLoading: false,
    error: null,
  };

  test('возвращает начальное состояние при вызове с undefined и неизвестным экшеном', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  test('обрабатывает fetchIngredients.pending', () => {
    const action = { type: fetchIngredients.pending.type };
    const state = ingredientsReducer(initialState, action);

    expect(state).toEqual({
      ingredients: [],
      isLoading: true,
      error: null,
    });
  });

  test('обрабатывает fetchIngredients.fulfilled', () => {
    const action = {
      type: fetchIngredients.fulfilled.type,
      payload: mockIngredients,
    };
    const state = ingredientsReducer({ ...initialState, isLoading: true }, action);

    expect(state).toEqual({
      ingredients: mockIngredients,
      isLoading: false,
      error: null,
    });
  });

  test('обрабатывает fetchIngredients.rejected', () => {
    const error = { message: 'Ошибка загрузки ингредиентов' };
    const action = {
      type: fetchIngredients.rejected.type,
      error,
    };
    const state = ingredientsReducer({ ...initialState, isLoading: true }, action);

    expect(state).toEqual({
      ingredients: [],
      isLoading: false,
      error,
    });
  });
});
