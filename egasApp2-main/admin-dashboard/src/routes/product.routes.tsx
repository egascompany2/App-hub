import { RouteObject } from 'react-router-dom';
import { Products } from '../pages/Products';

export const productRoutes: RouteObject[] = [
  {
    path: 'products',
    element: <Products />,
  },
];