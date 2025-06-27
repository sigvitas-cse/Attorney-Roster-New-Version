import { createBrowserRouter } from 'react-router-dom';
import App from '../App.jsx';
import Home from '../pages/Home.jsx';
import AdminDashboard from '../pages/adminDashboard.jsx';
import NewUserLoginPage from '../pages/RegisterPage.jsx';
import EmployeeDashboard from '../pages/EmployeeDashboard.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import Insights from '../components/EmployeeDashboard/note.jsx';
import Note from '../components/AdminDashBoard/IndivisualComponents/note.jsx';
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
        path: 'note',
        element: <Note />,
      },
    ],
  },
]);

export default router;