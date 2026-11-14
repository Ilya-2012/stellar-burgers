import { useSelector } from '@/services/store';
import { getOrderByNumberApi } from '@api';
import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { TIngredient, TOrder } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();

  const [orderDataState, setOrderDataState] = useState<TOrder | null>(null);

  const feedOrders = useSelector((state) => state.feed.orders);
  const userOrders = useSelector((state) => state.user.orders);
  const orders = useMemo(() => {
    return [...feedOrders, ...userOrders];
  }, [feedOrders, userOrders]);

  const foundOrder = useMemo(() => {
    if (!orders.length || !number) return null;
    return orders.find((order: TOrder) => order.number === Number(number)) ?? null;
  }, [orders, number]);

  useEffect(() => {
    if (!foundOrder && number) {
      getOrderByNumberApi(Number(number))
        .then((res) => {
          if (res.orders && res.orders.length > 0) {
            setOrderDataState(res.orders[0]);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [foundOrder, number]);

  const orderData = foundOrder ?? orderDataState;

  const ingredients: TIngredient[] = useSelector(
    (state) => state.ingredients.ingredients
  );

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
