import type { FC } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Error } from './pages/Error';
import { TowerGame } from './pages/TowerGame';

const router = createBrowserRouter([
  {
    path: '/',
    element: <TowerGame />,
    errorElement: <Error />,
  },
]);

export const App: FC = () => {
  return <RouterProvider router={router} />;
};
