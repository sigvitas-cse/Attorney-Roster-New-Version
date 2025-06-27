import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

function App() {
  const location = useLocation();
  
  console.log(`Current Route at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}:`, location.pathname);

  const [users, setUsers] = useState([]);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [activeCard, setActiveCard] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const handleDeleteAlert = () => {
    console.log('Delete Alert Triggered');
  };

  const handleLogin = () => {
    console.log('Login Function Called');
  };

  const handleCardClick = (card) => {
    setActiveCard(card);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  // Enhanced condition to handle variations in pathname
  const showHeader = !['/AdminDashboard', '/AdminDashboard/','/EmployeeDashBoard', '/EmployeeDashBoard/'].includes(location.pathname);
  console.log('Show Header:', showHeader, 'for pathname:', location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] font-['Inter',sans-serif]">
      {showHeader && <Header />}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-0 ">
        <div className="max-w-6xl w-full">
          <Outlet
            context={{
              users,
              allData,
              filteredData,
              handleFilterChange,
              filters,
              handleDeleteAlert,
              handleLogin,
              handleCardClick,
              activeCard,
              showForm,
              toggleForm,
              loading,
              email,
              setEmail,
            }}
          />
        </div>
      </main>
      {['/', '/Login', '/NewUserLoginPage', '/ForgotPassword'].includes(location.pathname) && <Footer />}
    </div>
  );
}

export default App;