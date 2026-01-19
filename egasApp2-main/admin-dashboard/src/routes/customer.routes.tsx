import { RouteObject } from 'react-router-dom';
import { Customers } from '../pages/Customers';
import { CustomerDetailsPage } from '../pages/CustomerDetailsPage';

export const customerRoutes: RouteObject[] = [
  {
    path: 'customers',
    element: <Customers />,
  },
  {
    path: 'customers/:id',
    element: <CustomerDetailsPage />,
  },
];
