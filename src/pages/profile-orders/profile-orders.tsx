import { getOrders } from '@/services/slices/userSlice';
import { useDispatch, useSelector } from '@/services/store';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import type { TOrder } from '@utils-types';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();

  useEffect(() => {
    void dispatch(getOrders());
  }, [dispatch]);

  const orders: TOrder[] = useSelector((state) => state.user.orders);

  return <ProfileOrdersUI orders={orders} />;
};
