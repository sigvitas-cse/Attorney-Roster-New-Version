// Roster-Data/src/pages/EmployeeDashboard.jsx
import React, { useState, useEffect } from 'react';
import 'jspdf-autotable';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NewProfilesUpdated from '../components/AdminDashBoard/IndivisualComponents/newProfiles.jsx';
import RemovedProfiles from '../components/AdminDashBoard/IndivisualComponents/removedProfiles.jsx';
import NewProfilesUpdated2 from '../components/AdminDashBoard/IndivisualComponents/updatedProfiles.jsx';
import NewUploadExcel from '../components/EmployeeDashboard/NewUploadExcel.jsx';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const rowsPerPage = 500;
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;
  const admin = users.length > 0 ? users[0].admin : false;
  const [filter, setFilter] = useState('');
  const [editedUsers, setEditedUsers] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newUploadExcel, setNewUploadExcel] = useState(false);

  useEffect(() => {
    document.title = 'Patent Analyst Dashboard';
    // Clear history state to prevent undo/redo navigation
    window.history.replaceState(null, '', window.location.pathname);
    // Check if userId exists, else redirect to login
    if (!userId) {
      navigate('/Login');
    }
  }, [userId, navigate]);

  const updating = () => {
    setLoading(!loading);
    if (loading) {
      toast.success('Data edited successfully');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUsers();
    }
  }, [userId]);

  // const API_URL = import.meta.env.VITE_API_URL || 'https://roster1.sigvitas.com';
    const API_URL = 'http://localhost:3001';

  const fetchUsers = () => {
    console.log('UserId being sent to backend:', userId);
    axios
      .get(`${API_URL}/api/fetch-users?userId=${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      })
      .then((response) => {
        console.log('Response from backend:', response.data);
        setUsers(response.data.data);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/Login');
        }
      });
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
    setPageInput('');
  };

  const handleEdit = (id, field, value) => {
    setEditedUsers({
      ...editedUsers,
      [id]: {
        ...editedUsers[id],
        [field]: value,
      },
    });
  };

  const handleUpdateAll = async () => {
    const updates = Object.keys(editedUsers)
      .filter((regCode) => Object.keys(editedUsers[regCode]).length > 0)
      .map((regCode) => ({
        regCode,
        ...editedUsers[regCode],
      }));

    if (updates.length === 0) {
      toast.info('No changes to save.');
      return;
    }

    console.log('Sending updates to backend:', updates);

    const batchSize = 500;
    const batches = [];
    for (let i = 0; i < updates.length; i += batchSize) {
      batches.push(updates.slice(i, i + batchSize));
    }

    try {
      for (const batch of batches) {
        await axios.put(`${API_URL}/api/update-users`, batch, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        console.log(`Batch of ${batch.length} users updated successfully`);
      }
      fetchUsers();
      setEditedUsers({});
      toast.success('Data saved successfully');
    } catch (error) {
      console.error('Error updating users:', error);
      toast.error(`Failed to save data: ${error.message || 'Unknown error'}`);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/Login');
      }
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    setUsers(users.map((user) => ({ ...user, isChecked })));
  };

  const handleCheckboxChange = (id, isChecked) => {
    setUsers(users.map((user) => (user.regCode === id ? { ...user, isChecked } : user)));
    const allSelected = users.every((user) => (user.regCode === id ? isChecked : user.isChecked));
    setSelectAll(allSelected);
  };

  const showNMessage = () => {
    toast.warn('Not Permitted');
  };

  const handleKeyDown = (e, rowIndex, colIndex) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const table = e.target.closest('table');
      const rows = table.querySelectorAll('tbody tr');
      const cols = rows[rowIndex].querySelectorAll('td');
      let newRowIndex = rowIndex;
      let newColIndex = colIndex;

      if (e.key === 'ArrowUp' && rowIndex > 0) {
        newRowIndex = rowIndex - 1;
      } else if (e.key === 'ArrowDown' && rowIndex < rows.length - 1) {
        newRowIndex = rowIndex + 1;
      } else if (e.key === 'ArrowLeft' && colIndex > 1) {
        newColIndex = colIndex - 1;
      } else if (e.key === 'ArrowRight' && colIndex < cols.length - 2) {
        newColIndex = colIndex + 1;
      }

      const newCell = rows[newRowIndex].querySelectorAll('td')[newColIndex];
      if (newCell && newCell.hasAttribute('contentEditable')) {
        newCell.focus();
      }
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleDropdownSelect = (component) => {
    setActiveComponent(component);
    setShowDropdown(false);
  };

  const filteredUsers = users.filter((user) => {
    if (!user) return false;
    const searchableFields = [
      user.name,
      user.organization,
      user.addressLine1,
      user.addressLine2,
      user.city,
      user.state,
      user.country,
      user.zipcode,
      user.phoneNumber,
      user.regCode,
      user.agentAttorney,
      user.dateOfPatent,
      user.agentLicensed,
      user.firmOrOrganization,
      user.updatedPhoneNumber,
      user.emailAddress,
      user.updatedOrganization,
      user.firmUrl,
      user.updatedAddress,
      user.updatedCity,
      user.updatedState,
      user.updatedCountry,
      user.updatedZipcode,
      user.linkedInProfile,
      user.notes,
      user.initials,
      user.dataUpdatedAsOn,
    ];
    return searchableFields.some((field) =>
      field?.toString().toLowerCase().includes(filter.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setPageInput(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setPageInput(currentPage + 1);
    }
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageJump = () => {
    const pageNumber = parseInt(pageInput, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setPageInput(pageNumber);
    } else {
      toast.error('Invalid page number');
      setPageInput(currentPage);
    }
  };

  const handlePageInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePageJump();
    }
  };

  const handleInsightsClick = () => {
    navigate('/insights', { state: { userId } });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <main className="min-h-[94.3vh] bg-gray-100">
        <div className="max-w-full min-h-[94.3vh] bg-white rounded-none shadow-none p-5">
          {activeComponent === 'newProfiles' && (
            <NewProfilesUpdated onClick={() => setActiveComponent(null)} />
          )}
          {activeComponent === 'removedProfiles' && (
            <RemovedProfiles onClick={() => setActiveComponent(null)} />
          )}
          {activeComponent === 'updatedProfiles' && (
            <NewProfilesUpdated2 onClick={() => setActiveComponent(null)} />
          )}

          <div className="flex flex-wrap justify-between items-center mb-5 gap-5 px-5">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">User Management</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Filter by any field"
                  value={filter}
                  onChange={handleFilterChange}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm w-64 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <i className="fa-solid fa-magnifying-glass absolute left-3 text-gray-500 text-base"></i>
              </div>
              <button
                onClick={handleUpdateAll}
                className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 active:scale-95 transition"
              >
                Save
              </button>
              <button
                onClick={() => setNewUploadExcel(true)}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 active:scale-95 transition"
              >
                Upload
              </button>
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 active:scale-95 transition"
                >
                  Updates
                </button>
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg min-w-[200px] z-10">
                    <div
                      className="px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleDropdownSelect('newProfiles')}
                    >
                      New Profiles
                    </div>
                    <div
                      className="px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleDropdownSelect('removedProfiles')}
                    >
                      Removed Profiles
                    </div>
                    <div
                      className="px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleDropdownSelect('updatedProfiles')}
                    >
                      Updated Profiles
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleInsightsClick}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 active:scale-95 transition"
              >
                Insights
              </button>
            </div>
          </div>

          <div className="w-screen min-h-[72vh] max-h-[600px] overflow-x-auto overflow-y-auto border border-gray-300 bg-white">
            <table className="w-full border-collapse text-xs font-calibri">
              <thead className="sticky top-0 bg-gray-200 z-10">
                <tr>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">S. No.</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Name</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Organization</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Address Line 1</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Address Line 2</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">City</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">State</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Country</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Zipcode</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Phone Number</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Reg Code</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Attorney</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Date of Patent</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Agent Licensed</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Firm or Organization</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Updated Phone Number</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Email Address</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Updated Organization/Law Firm Name</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Firm/Organization URL</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Updated Address</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Updated City</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Updated State</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Updated Country</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Updated Zipcode</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">LinkedIn Profile URL</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Notes</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Initials</th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">Data Updated as on</th>
                  <th className="p-2 text-center font-semibold text-gray-800 border-b-2 border-r border-gray-300 whitespace-nowrap">
                    All <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                  </th>
                  <th className="p-2 text-left font-semibold text-gray-800 border-b-2 whitespace-nowrap">Edit/Save/Delete</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-blue-50 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <td className="p-1 border-b border-r border-gray-200">{startIndex + index + 1}</td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'name', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 1)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.name || user.name}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'organization', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 2)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.organization || user.organization}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'addressLine1', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 3)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.addressLine1 || user.addressLine1}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'addressLine2', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 4)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.addressLine2 || user.addressLine2}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'city', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 5)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.city || user.city}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'state', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 6)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.state || user.state}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'country', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 7)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.country || user.country}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'zipcode', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 8)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.zipcode || user.zipcode}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'phoneNumber', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 9)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.phoneNumber || user.phoneNumber}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'regCode', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 10)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.regCode || user.regCode}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'agentAttorney', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 11)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.agentAttorney || user.agentAttorney}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'dateOfPatent', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 12)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.dateOfPatent || user.dateOfPatent}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'agentLicensed', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 13)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.agentLicensed || user.agentLicensed}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'firmOrOrganization', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 14)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.firmOrOrganization || user.firmOrOrganization}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'updatedPhoneNumber', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 15)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.updatedPhoneNumber || user.updatedPhoneNumber}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'emailAddress', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 16)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.emailAddress || user.emailAddress}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'updatedOrganization', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 17)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.updatedOrganization || user.updatedOrganization}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'firmUrl', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 18)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.firmUrl || user.firmUrl}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'updatedAddress', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 19)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.updatedAddress || user.updatedAddress}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'updatedCity', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 20)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.updatedCity || user.updatedCity}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'updatedState', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 21)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.updatedState || user.updatedState}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'updatedCountry', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 22)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.updatedCountry || user.updatedCountry}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'updatedZipcode', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 23)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.updatedZipcode || user.updatedZipcode}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'linkedInProfile', e.target.textContent)}
                      onKeyDown={(e) => {
                        handleKeyDown(e, index, 24);
                        if (e.ctrlKey && e.key === 'Enter') {
                          const url = editedUsers[user.regCode]?.linkedInProfile || user.linkedInProfile;
                          if (url) {
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }
                        }
                      }}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      <a
                        href={editedUsers[user.regCode]?.linkedInProfile || user.linkedInProfile}
                        title="Double click to follow this link"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const url = editedUsers[user.regCode]?.linkedInProfile || user.linkedInProfile;
                          if (url) {
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="underline cursor-pointer"
                      >
                        {editedUsers[user.regCode]?.linkedInProfile || user.linkedInProfile || 'No LinkedIn Profile'}
                      </a>
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'notes', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 25)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.notes || user.notes}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'initials', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 26)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.initials || user.initials}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) => handleEdit(user.regCode, 'dataUpdatedAsOn', e.target.textContent)}
                      onKeyDown={(e) => handleKeyDown(e, index, 27)}
                      className="p-1 border-b border-r border-gray-200 focus:bg-blue-50 focus:border focus:border-blue-500"
                    >
                      {editedUsers[user.regCode]?.dataUpdatedAsOn || user.dataUpdatedAsOn}
                    </td>
                    <td className="p-1 border-b border-r border-gray-200 text-center">
                      <input
                        type="checkbox"
                        checked={user.isChecked || false}
                        onChange={(e) => handleCheckboxChange(user.regCode, e.target.checked)}
                      />
                    </td>
                    <td className="p-1 border-b flex gap-1.5 justify-center">
                      <button
                        onClick={updating}
                        className="px-3 py-1 bg-yellow-500 text-white text-sm font-medium rounded hover:bg-yellow-600 active:scale-95 transition"
                      >
                        {loading ? 'Edited' : 'Edit'}
                      </button>
                      <button
                        onClick={handleUpdateAll}
                        className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 active:scale-95 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={showNMessage}
                        className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 active:scale-95 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center items-center gap-4 mt-5 px-5">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-blue-500 hover:text-white transition"
            >
              Previous
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-800">
              Page
              <input
                type="number"
                value={pageInput}
                onChange={handlePageInputChange}
                onKeyPress={handlePageInputKeyPress}
                onBlur={handlePageJump}
                className="w-16 p-1.5 border border-gray-300 rounded-md text-center text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder={currentPage}
                min="1"
                max={totalPages}
              />
              of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-blue-500 hover:text-white transition"
            >
              Next
            </button>
          </div>

          <h4 className="mt-5 text-base text-gray-800 text-center px-5">
            Total data's of {userId} : {users.length}
          </h4>

          {newUploadExcel && (
            <NewUploadExcel userId={userId._id} onClose={() => setNewUploadExcel(false)} />
          )}
        </div>
      </main>
    </div>
  );
};

export default UserTable;