import { resetOrderBurger } from '@/services/slices/constructorSlice';
import { clearOrderModalData, orderBurger } from '@/services/slices/userSlice';
import { useDispatch, useSelector } from '@/services/store';
import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import type { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor = (): React.JSX.Element | null => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const constructorItems = useSelector((state) => state.burgerConstructor);

  const bun = useSelector((state) => state.burgerConstructor.bun);
  const ingredients = useSelector((state) => state.burgerConstructor.ingredients);

  const orderModalData = useSelector((state) => state.user.orderModalData);
  const orderRequest = useSelector((state) => state.user.loading);

  const onOrderClick = (): void => {
    if (!constructorItems.bun || orderRequest) return;
    if (!isAuthenticated) {
      void navigate('/login');
      return;
    }
    if (!bun) return;
    const orderIds = [bun._id, ...ingredients.map((item) => item._id), bun._id];
    void dispatch(orderBurger(orderIds));
  };

  const closeOrderModal = (): void => {
    void dispatch(clearOrderModalData());
    void dispatch(resetOrderBurger());
    void navigate('/');
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
