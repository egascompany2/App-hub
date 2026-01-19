import { RouteObject } from 'react-router-dom';
import { DeliveryPersonnel } from '../pages/DeliveryPersonnel';

export const deliveryRoutes: RouteObject[] = [
  {
    path: 'delivery',
    element: <DeliveryPersonnel />,
  },
];