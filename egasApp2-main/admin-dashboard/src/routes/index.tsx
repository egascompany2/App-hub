import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AuthLayout } from '../components/AuthLayout';
import { Login } from '../pages/Login';
import { dashboardRoutes } from './dashboard.routes';
import { productRoutes } from './product.routes';
import { orderRoutes } from './order.routes';
import { customerRoutes } from './customer.routes';
import { deliveryRoutes } from './delivery.routes';
import { settingsRoutes } from './settings.routes';
import NotFoundPage from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
  {
    path: '/',
    element: (
      <AuthLayout>
        <Layout />
      </AuthLayout>
    ),
    children: [
      ...dashboardRoutes,
      ...productRoutes,
      ...orderRoutes,
      ...customerRoutes,
      ...deliveryRoutes,
      ...settingsRoutes,
    ],
  },
]);