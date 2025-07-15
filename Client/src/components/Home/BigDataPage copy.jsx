import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function BigDataPage() {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(null);
  const [error, setError] = useState('');
  const [isBlurred, setIsBlurred] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const headerMap = {
    "Sl.No": "slNo",
    "Name": "name",
    "Organization": "organization",
    "Address Line 1": "addressLine1",
    "Address Line 2": "addressLine2",
    "City": "city",
    "State": "state",
    "Country": "country",
    "Zipcode": "zipcode",
    "Phone": "phoneNumber",
    "Reg No.": "regCode",
    "Attorney": "agentAttorney",
    "Date of Patent": "dateOfPatent",
    "Agent Licensed": "agentLicensed",
    "Firm": "firmOrOrganization",
    "Updated Phone": "updatedPhoneNumber",
    "Email": "emailAddress",
    "Updated Org": "updatedOrganization",
    "Website": "firmUrl",
    "Updated Address": "updatedAddress",
    "Updated City": "updatedCity",
    "Updated State": "updatedState",
    "Updated Country": "updatedCountry",
    "Updated Zipcode": "updatedZipcode",
    "LinkedIn": "linkedInProfile",
    // "Notes": "notes",
    "Data Updated As On": "dataUpdatedAsOn",
  };

  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/explore', { replace: true });
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/verify-token`, {
        method: 'GET',
        headers: { 'x-auth-token': token },
      });
      const data = await response.json();
      return response.ok && data.message === 'Token valid';
    } catch {
      localStorage.removeItem('token');
      navigate('/explore', { replace: true });
      return false;
    }
  };

  const fetchCurrentPage = async () => {
    try {
      const response = await fetch(`${API_URL}/api/current-page`, {
        method: 'GET',
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      const data = await response.json();
      return response.ok ? data.currentPage : 1;
    } catch {
      return 1;
    }
  };

  const fetchData = async (page) => {
    try {
      const response = await fetch(`${API_URL}/api/guiestdata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
        body: JSON.stringify({ page }),
      });
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
        setTotalCount(result.totalCount);
        setCurrentPage(page);
        setError('');
      } else {
        if (response.status === 403 || response.status === 401) {
          localStorage.removeItem('token');
          navigate('/explore', { replace: true });
        } else {
          setError(result.message || 'Failed to fetch data');
        }
      }
    } catch {
      setError('Network error. Please check your connection or server status.');
    }
  };

  useEffect(() => {
    verifyToken().then(async (isValid) => {
      if (isValid) {
        const page = await fetchCurrentPage();
        setCurrentPage(page);
        fetchData(page);
      }
    });

    const handlePopstate = () => {
      verifyToken().then((isValid) => {
        if (!isValid) {
          navigate('/explore', { replace: true });
        }
      });
    };

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [navigate]);

  useEffect(() => {
    if (currentPage !== null) {
      fetchData(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleNext = () => {
    if (currentPage < 3) {
      setCurrentPage(prev => prev + 1);
      setError('');
    } else {
      setError('You’ve reached the page limit. Please contact admin to unlock more.');
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      setError('');
    } else {
      setError('You are on the first page.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/guiestlogout`, {
        method: 'POST',
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
    } finally {
      localStorage.removeItem('token');
      navigate('/explore', { replace: true });
    }
  };

  const disableCopyPaste = (e) => e.preventDefault();
  const disableRightClick = (e) => e.preventDefault();

  if (currentPage === null) return <div className="text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900">
      {/* Header */}
      <div className="w-full py-4 bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Triangle IP | Data Portal</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-6xl relative">
          <p className="text-sm font-medium mb-2 text-left">Total Records: {totalCount}</p>

          {error && (
            <p className="bg-red-100 border-l-4 border-red-400 text-red-700 p-3 rounded-md text-sm mb-3 text-left">
              {error}
            </p>
          )}

          <div
            className={`overflow-x-auto mb-4 relative ${isBlurred ? 'blur' : ''}`}
            onCopy={disableCopyPaste}
            onCut={disableCopyPaste}
            onPaste={disableCopyPaste}
            onContextMenu={disableRightClick}
            style={{ userSelect: 'none' }}
          >
            <table className="w-full border-collapse min-w-[2000px] text-xs">
              <thead className="bg-gray-800 text-white">
                <tr>
                  {Object.keys(headerMap).map((header) => (
                    <th
                      key={header}
                      className="p-2 text-left font-semibold min-w-[50px] max-w-[200px] truncate whitespace-nowrap"
                      title={header}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((profile, index) => (
                  <tr key={profile._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td
                      className="p-2 text-xs font-medium text-left"
                    >
                      {index + 1}
                    </td>
                    {Object.values(headerMap).slice(1).map((key, i) => (
                      <td
                        key={i}
                        className="p-2 min-w-[120px] max-w-[200px] truncate hover:bg-gray-100"
                        title={profile[key]}
                      >
                        {key === 'firmUrl' || key === 'linkedInProfile' ? (
                          <a
                            href={profile[key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {profile[key]}
                          </a>
                        ) : (
                          profile[key]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              className="absolute top-0 left-0 w-[2000px] h-full text-gray-800/10 text-2xl font-bold text-center pointer-events-none flex items-center justify-center"
              style={{
                background: 'repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(0,0,0,0.05) 50px, rgba(0,0,0,0.05) 100px)',
              }}
            >
              Confidential - Do Not Copy
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={handlePrevious}
              disabled={currentPage <= 1}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-700 disabled:bg-blue-300"
            >
              Previous
            </button>
            <span className="text-sm font-medium">Page {currentPage}</span>
            <button
              onClick={handleNext}
              disabled={currentPage >= 3}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-700 disabled:bg-blue-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BigDataPage;
