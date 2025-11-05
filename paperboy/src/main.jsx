import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './App.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'
import MarketDetail from './pages/MarketDetail.jsx' 
import AdminDashboard from './pages/AdminDashboard.jsx' // Import AdminDashboard
import AdminRoute from './components/AdminRoute.jsx' // Import AdminRoute
import Home from './pages/Home.jsx' // Import Home

import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // App is the main layout
    children: [
      {
        index: true, // Renders Home component at '/'
        element: <Home />,
      },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'profile', element: <Profile /> },
      { path: 'market/:id', element: <MarketDetail /> }, // This path now works
      {
        path: 'admin', // This is the new protected admin route
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)