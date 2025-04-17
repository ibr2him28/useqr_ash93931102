import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/scss/style.scss'
import './components/i18n'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import RoleBasedRoute from './components/RoleBasedRoute'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './pages/Layout'
import Error from './pages/Error'
import Dashboard from './pages/Dashboard'
import CarLogs from './pages/CarLogs'
import Setting from './pages/Setting'
import Login from './pages/Login'
import Admin from './pages/Admin'



const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Login />,
      errorElement: <Error />,
    },

    {
      path: "",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      errorElement: <Error />,
      children: [
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        {
          path: "/car-logs",
          element: <CarLogs />,
        },
        {
          path: "/setting",
          element: <Setting />,
        },
        {
          path: "/admin",
          element: (
            <RoleBasedRoute allowedRoles={['admin']}>
              <Admin />
            </RoleBasedRoute>
          ),
        },
      ],
    },
  ],
  {
    future: {
      v7_skipActionErrorRevalidation: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
    },
  }
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
