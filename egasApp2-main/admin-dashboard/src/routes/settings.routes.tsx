import { RouteObject } from 'react-router-dom';
import { Settings } from '../pages/Settings';

export const settingsRoutes: RouteObject[] = [
  {
    path: 'settings',
    element: <Settings />,
  },
];