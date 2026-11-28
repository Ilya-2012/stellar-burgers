import {
  addIngredient,
  constructorReducer,
  moveIngridient,
  removeIngredient,
  resetOrderBurger,
} from '../constructorSlice';

import type { TConstructorState, TIngredient } from '@/utils/types';

const bunIngredient: TIngredient = {
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
};

const mainIngredient1: TIngredient = {
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
};

const mainIngredient2: TIngredient = {
  _id: '643d69a5c3f7b9001cfa093e',
  name: 'Филе Люминесцентного тетраодонтимформа',
  type: 'main',
  proteins: 44,
  fat: 26,
  carbohydrates: 85,
  calories: 643,
  price: 988,
  image: 'https://code.s3.yandex.net/react/code/meat-03.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/meat-03-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/meat-03-large.png',
};

describe('тесты редьюсера слайса burgerConstructor', () => {
  const initialState: TConstructorState = {
    bun: null,
    ingredients: [],
  };

  test('возвращает начальное состояние при вызове с undefined и неизвестным экшеном', () => {
    const state = constructorReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  test('добавляет булку через addIngredient', () => {
    const state = constructorReducer(initialState, addIngredient(bunIngredient));

    expect(state.bun).not.toBeNull();
    expect(state.bun?._id).toBe(bunIngredient._id);
    expect(state.bun?.id).toBeDefined();
    expect(state.ingredients).toHaveLength(0);
  });

  test('добавляет начинку в массив ingredients через addIngredient', () => {
    const state = constructorReducer(initialState, addIngredient(mainIngredient1));

    expect(state.bun).toBeNull();
    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0]._id).toBe(mainIngredient1._id);
    expect(state.ingredients[0].id).toBeDefined();
  });

  test('удаляет ингредиент по id через removeIngredient', () => {
    const populatedState: TConstructorState = {
      bun: null,
      ingredients: [
        { ...mainIngredient1, id: 'id-1' },
        { ...mainIngredient2, id: 'id-2' },
      ],
    };

    const state = constructorReducer(populatedState, removeIngredient('id-1'));

    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0].id).toBe('id-2');
  });

  test('меняет порядок ингредиентов через moveIngridient', () => {
    const populatedState: TConstructorState = {
      bun: null,
      ingredients: [
        { ...mainIngredient1, id: 'id-1' },
        { ...mainIngredient2, id: 'id-2' },
      ],
    };

    const state = constructorReducer(populatedState, moveIngridient({ from: 0, to: 1 }));

    expect(state.ingredients.map((item) => item.id)).toEqual(['id-2', 'id-1']);
  });

  test('очищает конструктор через resetOrderBurger', () => {
    const populatedState: TConstructorState = {
      bun: { ...bunIngredient, id: 'bun-id-1' },
      ingredients: [{ ...mainIngredient1, id: 'id-1' }],
    };

    const state = constructorReducer(populatedState, resetOrderBurger());

    expect(state).toEqual(initialState);
  });
});
