import { RouteObject } from 'react-router-dom';
import { Orders } from '../pages/Orders';
import { OrderDetailsPage } from '../pages/OrderDetailsPage';

export const orderRoutes: RouteObject[] = [
  {
    path: 'orders',
    element: <Orders />,
  },
  {
    path: 'orders/:id',
    element: <OrderDetailsPage />,
  },
];