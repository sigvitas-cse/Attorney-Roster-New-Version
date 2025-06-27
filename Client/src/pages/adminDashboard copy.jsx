import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AttorneyRoster from "../components/AdminDashBoard/AttorneyRoster.jsx";
import Users from "../components/AdminDashBoard/UsersTable.jsx";
import AddUserForm from "../components/AdminDashBoard/AddUserForm.jsx";
import Analysis from "../components/AdminDashBoard/Analysis.jsx";

// ErrorBoundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    toast.error("An error occurred. Please try again or contact support.", {
      position: "top-center",
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center text-red-600">
          <h2 className="text-xl font-bold">Something Went Wrong</h2>
          <p>{this.state.error?.message || "Unknown error"}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-[#38BDF8] text-white rounded-lg hover:bg-[#2B9FE7] transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("users"); // Default to "users"
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Dashboard - Triangle IP";
    window.history.replaceState(null, "", window.location.pathname);
    const authToken = localStorage.getItem("authToken");
    const userType = localStorage.getItem("userType");
    if (!authToken || userType !== "admin") {
      toast.error("Unauthorized access. Please log in as an admin.", {
        position: "top-center",
      });
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userType");
      toast.success("Logged out successfully!", { position: "top-center" });
      navigate("/");
    }, 500);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { id: "users", label: "Users", icon: "fa-users", badge: 15 },
    { id: "patentData", label: "Attorney Roster", icon: "fa-cloud", badge: 8 },
    { id: "analysis", label: "Analysis", icon: "fa-chart-simple", badge: 0 },
    { id: "addUserForm", label: "Add User", icon: "fa-user-plus", badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] text-[#1E293B] flex flex-col box-border">
      {/* Header */}
      <header className="bg-white border-b border-[#CBD5E1] p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden text-[#64748B] focus:outline-none hover:text-[#38BDF8] transition-colors duration-200"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <i className={`fa-solid ${isSidebarOpen ? "fa-times" : "fa-bars"} text-xl`} />
          </button>
          <h1 className="text-2xl font-extrabold text-[#1E293B]">Triangle IP Admin</h1>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`px-4 py-2 bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white text-sm font-semibold rounded-lg hover:from-[#2B9FE7] hover:to-[#4B8EF1] transition-all duration-200 shadow-md hover:shadow-lg ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Logging Out..." : "Log Out"}
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 w-full h-full box-border">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:${isSidebarOpen ? "translate-x-0 static w-64" : "translate-x-0 w-16"} z-40 fixed lg:static`}
        >
          <div className="p-4 h-full overflow-auto box-border">
            <h2 className="text-xl font-extrabold text-[#1E293B] mb-6 flex items-center">
              <i className="fa-solid fa-tachometer-alt mr-2 text-[#38BDF8]" /> Dashboard
            </h2>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between p-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-[#F8FAFC] ${
                    activeSection === item.id
                      ? "bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white shadow-md"
                      : "text-[#64748B]"
                  }`}
                  title={`View ${item.label}`}
                >
                  <span className="flex items-center gap-3">
                    <i className={`fa-solid ${item.icon} text-lg`} />
                    <span>{item.label}</span>
                  </span>
                  {item.badge > 0 && (
                    <span className="bg-[#38BDF8]/20 text-[#38BDF8] text-xs font-semibold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main
          className={`flex-1 p-6 overflow-auto transition-all box-border ${
            isSidebarOpen ? "" : "w-full"
          } lg:${isSidebarOpen ? "flex-1" : "ml-16"}`}
        >
          <div className="w-full h-full grid grid-cols-1 lg:grid-cols-1 gap-0 box-border">
            <ErrorBoundary>
              <div className="lg:col-span-1 bg-white rounded-xl shadow-md border border-[#CBD5E1] p-6 w-full box-border">
                <div className="mb-6">
                  <h2 className="text-2xl font-extrabold text-[#1E293B] mb-2">
                    {navItems.find((item) => item.id === activeSection)?.label}
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] rounded" />
                </div>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <i className="fa-solid fa-spinner fa-spin text-[#38BDF8] text-4xl" />
                  </div>
                ) : (
                  <>
                    {activeSection === "users" && <Users />}
                    {activeSection === "patentData" && <AttorneyRoster />}
                    {activeSection === "analysis" && <Analysis />}
                    {activeSection === "addUserForm" && <AddUserForm />}
                  </>
                )}
              </div>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;