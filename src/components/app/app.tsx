import { fetchIngredients } from '@/services/slices/ingredientsSlice';
import { authChecked, getUser } from '@/services/slices/userSlice';
import { getCookie } from '@/utils/cookie';
import { AppHeader, IngredientDetails, Modal, OrderInfo } from '@components';
import {
  ConstructorPage,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
  Feed,
} from '@pages';
import { Preloader } from '@ui';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  type Location,
} from 'react-router-dom';

import { useDispatch, type RootState } from '../../services/store';
import { ProtectedRoute } from '../protected-route';

import type { AppContentProps } from './type';

import '../../index.css';

import styles from './app.module.css';

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { ingredients, isLoading, error } = useSelector(
    (state: RootState) => state.ingredients
  );

  useEffect(() => {
    void dispatch(fetchIngredients());

    if (getCookie('accessToken')) {
      void dispatch(getUser());
    } else {
      void dispatch(authChecked(true));
    }
  }, [dispatch]);

  if (isLoading) {
    return <div>Загрузка ...</div>;
  }

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppContent ingredients={ingredients} isLoading={isLoading} error={error} />
    </div>
  );
};

export default App;

const AppContent = ({
  ingredients,
  isLoading,
  error,
}: AppContentProps): React.JSX.Element => {
  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className={`${styles.message} text text_type_main-medium`}>
        Не удалось загрузить ингредиенты
        {error.message ? `: ${error.message}` : '.'}
      </p>
    );
  }
  if (!ingredients.length) {
    return (
      <p className={`${styles.message} text text_type_main-medium`}>Нет ингредиентов</p>
    );
  }

  return <RouteComponent />;
};

const RouteComponent = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { background?: Location } | null;
  const background = state?.background;

  const handleCloseModal = (): void => {
    void navigate(-1);
  };

  return (
    <>
      <Routes location={background ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route
          path="/login"
          element={<ProtectedRoute onlyUnAuth element={<Login />} />}
        />
        <Route
          path="/register"
          element={<ProtectedRoute onlyUnAuth element={<Register />} />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route
          path="/profile/orders"
          element={<ProtectedRoute element={<ProfileOrders />} />}
        />

        <Route path="/feed/:number" element={<OrderInfo />} />
        <Route path="/ingredients/:id" element={<IngredientDetails />} />
        <Route
          path="/profile/orders/:number"
          element={<ProtectedRoute element={<OrderInfo />} />}
        />

        <Route path="*" element={<NotFound404 />} />
      </Routes>
      {background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="" onClose={handleCloseModal}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path="/feed/:number"
            element={
              <Modal title="" onClose={handleCloseModal}>
                <OrderInfo />
              </Modal>
            }
          />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute
                element={
                  <Modal title="" onClose={handleCloseModal}>
                    <OrderInfo />
                  </Modal>
                }
              />
            }
          />
        </Routes>
      )}
    </>
  );
};
