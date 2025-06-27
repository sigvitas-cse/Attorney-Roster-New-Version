import { createBrowserRouter } from 'react-router-dom';
import App from '../App.jsx';
import Home from '../pages/Home.jsx';
import AdminDashboard from '../pages/adminDashboard.jsx';
import NewUserLoginPage from '../pages/RegisterPage.jsx';
import EmployeeDashboard from '../pages/EmployeeDashboard.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import Insights from '../pages/Insights.jsx';
import AdminInsights from '../components/AdminDashBoard/AdminInsights.jsx';
import Login from '../pages/LoginPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'Login',
        element: <Login />,
      },
      {
        path: 'AdminDashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'NewUserLoginPage',
        element: <NewUserLoginPage />,
      },
      {
        path: 'EmployeeDashBoard',
        element: <EmployeeDashboard />,
      },
      {
        path: 'ForgotPassword',
        element: <ForgotPassword />,
      },
      {
        path: 'insights',
        element: <Insights />,
      },
      {
        path: 'AdminInsights',
        element: <AdminInsights />,
      },
    ],
  },
]);

export default router;