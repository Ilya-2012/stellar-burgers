import { Preloader } from '@ui';
import { Navigate, useLocation } from 'react-router-dom';

import { useSelector } from '../services/store';

import type React from 'react';

type ProtectedRouteProps = {
  onlyUnAuth?: boolean;
  element: React.JSX.Element;
};

export const ProtectedRoute = ({
  onlyUnAuth = false,
  element,
}: ProtectedRouteProps): React.JSX.Element => {
  const isAuthChecked = useSelector((state) => state.user.isAuthChecked);
  const user = useSelector((state) => state.user.user);
  const location = useLocation();
  if (!isAuthChecked) return <Preloader />;

  if (onlyUnAuth && user) {
    const state = location.state as { from?: { pathname: string } } | null;
    const from = state?.from ?? { pathname: '/' };
    return <Navigate to={from} />;
  }

  if (!onlyUnAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return element;
};
