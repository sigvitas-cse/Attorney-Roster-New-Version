import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineOfficeBuilding, HiOutlineIdentification, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { toast } from 'react-toastify';

function BigDataPage() {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [detectedField, setDetectedField] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

 const fetchData = async (query = '', page = 1) => {
  try {
    const url = `${API_URL}/api/FullDataAccess?page=${page}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token'),
      },
    });
    const result = await response.json();
    if (response.ok && result.results && result.totalCount !== undefined) {
      setData(result.results);
      setTotalCount(result.totalCount);
      setCurrentPage(page);
      setError('');
    } else {
      setData([]);
      setTotalCount(0);
      setError(result.message || 'Failed to fetch data');
    }
  } catch {
    setError('Network error. Please check your connection or server status.');
  }
};


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/explore', { replace: true });
    fetchData('', 1);
  }, [navigate]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query', { position: 'top-center' });
      return;
    }
    fetchData(searchQuery.trim(), 1);
    setSuggestions([]);
    setIsInputFocused(false);
  };

  const handleSuggestionSearch = (term) => {
    setSearchQuery(term);
    fetchData(term, 1);
    setSuggestions([]);
    setIsInputFocused(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSuggestions([]);
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    fetch(`${API_URL}/api/suggestions?query=${encodeURIComponent(trimmed)}`)
      .then(res => res.json())
      .then(res => {
        if (res.suggestions?.length > 0) {
          setSuggestions(res.suggestions);
          setDetectedField(res.field);
        }
      })
      .catch(err => console.error('Suggestion error:', err.message));
  };

  const handleNext = () => fetchData(searchQuery.trim(), currentPage + 1);
  const handlePrevious = () => currentPage > 1 && fetchData(searchQuery.trim(), currentPage - 1);

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/guiestlogout`, {
      method: 'POST',
      headers: { 'x-auth-token': localStorage.getItem('token') },
    });
    localStorage.removeItem('token');
    navigate('/explore', { replace: true });
  };

  const copyToClipboard = (profile) => {
    const contactDetails = `Name: ${profile.name}\nOrganization: ${profile.organization}\nPhone: ${profile.phoneNumber}\nEmail: ${profile.emailAddress}\nAddress: ${profile.addressLine1}${profile.addressLine2 ? ', ' + profile.addressLine2 : ''}, ${profile.city}, ${profile.state}, ${profile.country}, ${profile.zipcode}\nReg No.: ${profile.regCode}`.trim();
    navigator.clipboard.writeText(contactDetails)
      .then(() => toast.success(`✔️ Contact info for "${profile.name}" copied!`, { position: 'top-center', autoClose: 2000, theme: 'light' }))
      .catch(() => toast.error('❌ Failed to copy contact details.', { position: 'top-center' }));
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#1E293B] font-['Inter',sans-serif]">
      <div className="w-full py-4 bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Triangle IP | Data Portal</h1>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700">
            Logout
          </button>
        </div>
      </div>


      {/* Search Panel */}
      <div className="z-50 sticky top-[68px] w-full max-w-6xl mb-0 mx-auto flex justify-center bg-white p-6 sm:p-8   border border-none my-0 ">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="w-full max-w-2xl flex flex-col lg:flex-row gap-4 items-center">
          <div className="w-full relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 100)}
              placeholder="Search by name, reg no., org, city, etc."
              className="w-full px-4 py-3 pr-14 pl-4 rounded-full border border-gray-300 focus:ring-2 focus:ring-sky-400 text-sm shadow-sm outline-none"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-lg" title="Clear">
                <HiOutlineX />
              </button>
            )}
            <button type="button" onClick={handleSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-sky-600 text-lg" title="Search">
              <HiOutlineSearch />
            </button>
            {isInputFocused && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 bg-white border border-gray-200 mt-1 z-50 rounded shadow text-sm max-h-48 overflow-y-auto scrollbar-w-0 w-full">
                {suggestions.map((s, i) => (
                  <li key={i} onClick={() => handleSuggestionSearch(s)} className="px-4 py-2 hover:bg-sky-100 cursor-pointer">
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {detectedField && (
            <p className="text-xs text-gray-500 mt-1">💡{detectedField}</p>
          )}
        </form>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6  border border-gray-100 bg-white">
        <p className="text-sm font-medium mb-4">Total Records: {totalCount}</p>
        {error && <p className="bg-red-100 border-l-4 border-red-400 text-red-700 p-3 rounded-md text-sm mb-4">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.map((profile, index) => (
            <div key={index} className="relative group bg-white rounded-0 border border-[#38BDF8]/20 shadow-md hover:shadow-2xl transition-transform duration-300 ease-in-out h-[360px] overflow-hidden flex flex-col before:absolute before:inset-0 before:bg-[#38BDF8] before:h-2 before:top-0 before:z-0 group-hover:before:h-full before:transition-all before:duration-300">
              <div className="relative z-10 flex flex-col h-full">
                <div className="h-1/2 group-hover:h-[45%] transition-all duration-300 flex justify-center items-center bg-sky-700 hover:bg-sky-950">
                  <svg className="w-28 h-28 text-[#38BDF8] p-3 bg-[#E0F2FE] rounded-full shadow" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C9.24 2 7 4.24 7 7c0 2.76 2.24 5 5 5s5-2.24 5-5c0-2.76-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm0 2c-2.21 0-4 1.79-4 4v2h8v-2c0-2.21-1.79-4-4-4zm0 6H8v-2c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2h-4z" />
                  </svg>
                </div>
                <div className="h-1/2 group-hover:h-[50%] transition-all duration-300 px-4 pt-2 overflow-hidden text-left">
                  <div className="space-y-[6px] text-[14px] text-slate-800 leading-tight">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">{profile.name}</h3>
                    {profile.agentAttorney && (
                      <p className="text-sky-600 italic font-medium text-[13px]">{profile.agentAttorney}</p>
                    )}
                    <p className="flex items-center gap-2">
                      <HiOutlineOfficeBuilding className="text-sky-600 text-lg" />
                      <span className="text-sm text-gray-700 truncate">{profile.organization}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <HiOutlineIdentification className="text-sky-600 text-lg" />
                      <span className="text-sm text-gray-700">{profile.regCode}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <HiOutlinePhone className="text-sky-600 text-lg" />
                      <span className="text-sm text-gray-700">{profile.phoneNumber}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <HiOutlineMail className="text-sky-600 text-lg" />
                      <span className="text-sm text-gray-700 truncate">{profile.emailAddress}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-0 group-hover:h-[20%] transition-all duration-300 px-4 bg-sky-950 text-white text-sm flex justify-between items-center opacity-0 group-hover:opacity-100">
                <button onClick={() => copyToClipboard(profile)} className="hover:underline">📋 Copy Contact</button>
                <button
                  onClick={() => navigate(`/profile/${profile._id}`)}
                  className="text-lg hover:scale-110 transition"
                  title="More Info"
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-2 mt-6">
          <button onClick={handlePrevious} disabled={currentPage <= 1} className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-700 disabled:bg-blue-300">Previous</button>
          <span className="text-sm font-medium">Page {currentPage}</span>
          <button onClick={handleNext} className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-700">Next</button>
        </div>
      </div>
    </div>
  );
}

export default BigDataPage;
