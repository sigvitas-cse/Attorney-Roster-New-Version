import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo1 from '../../assets/logos/logo1.png';
import logo2 from '../../assets/logos/logo2.png';
import logo3 from '../../assets/logos/logo3.png';
import logo4 from '../../assets/logos/logo4.png';
import patenillustration from '../../assets/Indivisuals/patent-illustration.png';


const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('regCode');
  const [searchMode, setSearchMode] = useState('single');
  const [matchingProfiles, setMatchingProfiles] = useState([]);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      toast.error('Please enter a search query', { position: 'top-center' });
      setMatchingProfiles([]);
      setError('Please enter a search query.');
      return;
    }

    const queries = searchQuery.split(',').map((q) => q.trim()).filter(Boolean);

    if (searchMode === 'single' && queries.length > 1) {
      toast.error('Single search allows only one input.', { position: 'top-center' });
      return;
    }

    if (searchMode === 'multiple') {
      if (!isLoggedIn) {
        navigate('/MultipleSearchLogin');
        return;
      }
      if (queries.length > 5) {
        toast.error('Multiple search allows up to 5 entries.', { position: 'top-center' });
        return;
      }
    }

    try {
      const results = [];
      for (const query of queries) {
        const response = await axios.get(`${API_URL}/api/IndivisualDataFetching`, {
          params: { field: searchField, query }
        });
        if (Array.isArray(response.data) && response.data.length > 0) {
          results.push(...response.data);
        }
      }

      setMatchingProfiles(results);
      setError(results.length === 0 ? 'No matching profiles found.' : '');
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      toast.error('Server error occurred.', { position: 'top-center' });
      setMatchingProfiles([]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#1E293B] font-['Inter',sans-serif] relative overflow-hidden">
      {/* Background SVG Decoration */}
      <div className="absolute inset-0 z-0">
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 720">
          <path
            fill="#38BDF8"
            d="M0,400L60,373.3C120,347,240,293,360,293.3C480,293,600,347,720,373.3C840,400,960,400,1080,386.7C1200,373,1320,347,1380,333.3L1440,320L1440,720L1380,720C1320,720,1200,720,1080,720C960,720,840,720,720,720C600,720,480,720,360,720C240,720,120,720,60,720L0,720Z"
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#E2E8F0]/50" />
      </div>

      {/* Fixed Header */}
      <nav className="z-10 px-6 sm:px-10 lg:px-20 py-4 text-sm text-gray-500 bg-white/60 backdrop-blur border-b border-gray-200">
        <ol className="flex items-center space-x-2 max-w-7xl mx-auto">
          <li><a href="/" className="text-sky-600 hover:underline">Home</a></li>
          <li>/</li>
          <li className="text-gray-700 font-medium">Explore</li>
        </ol>
      </nav>

      {/* Scrollable Main Content */}
      <main className="z-10 flex-1 overflow-y-auto scrollbar-w-0 px-6 sm:px-10 lg:px-20 pb-24 pt-10">
                {/* Heading */}
                <div className="mb-10 text-center">
                  <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">Explore US Patent Attorney Data</h1>
                  <p className="text-lg sm:text-xl text-[#64748B] max-w-2xl mx-auto">
                    Dive into our up-to-date directory of attorneys. Use filters to narrow down your search.
                  </p>
                </div>
        
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-8">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-2xl font-bold text-blue-600">32K+</p>
                  <p className="text-sm text-gray-500">Total Attorneys</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-2xl font-bold text-sky-600">1.4K+</p>
                  <p className="text-sm text-gray-500">Organizations</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-2xl font-bold text-emerald-600">500+</p>
                  <p className="text-sm text-gray-500">Cities Covered</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-2xl font-bold text-purple-600">Updated</p>
                  <p className="text-sm text-gray-500">Weekly</p>
                </div>
              </div>
        
        
                {/* 🔐 Always-Visible Prompt */}
                {!isLoggedIn && (
                  <div className="text-sm text-center text-[#64748B] mb-6">
                    Want to search multiple entries at once?{' '}
                    <button
                      onClick={() => navigate('/MultipleSearchLogin')}
                      className="text-[#38BDF8] font-medium hover:underline"
                    >
                      Log in here
                    </button>
                    .
                  </div>
                )}
        
                {/* Search Panel */}
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-[#38BDF8]/20 mb-8">
                  <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 items-center">
                    <div className="w-full lg:w-[15%]">
                      <select
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5E1] focus:ring-[#38BDF8] outline-none"
                      >
                        <option value="regCode">Reg No.</option>
                        <option value="name">Name</option>
                        <option value="organization">Organization</option>
                        <option value="city">City</option>
                      </select>
                    </div>
                    <div className="w-full lg:w-[45%]">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search by ${searchField}${searchMode === 'multiple' ? ' (max 5, comma-separated)' : ''}`}
                        className="w-full px-4 py-2 text-sm rounded-lg border border-[#CBD5E1] focus:ring-2 focus:ring-[#38BDF8] outline-none"
                      />
                    </div>
                    <div className="w-full lg:w-[20%] flex items-center gap-2 text-sm">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="searchMode"
                          value="single"
                          checked={searchMode === 'single'}
                          onChange={() => setSearchMode('single')}
                        />
                        Single
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="searchMode"
                          value="multiple"
                          checked={searchMode === 'multiple'}
                          onChange={() => setSearchMode('multiple')}
                        />
                        Multiple
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2 text-sm bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-white rounded-lg hover:from-[#2B9FE7] hover:to-[#4B8EF1] transition shadow-md"
                    >
                      Search
                    </button>
                  </form>
                </div>
        
                <div className="text-xs text-gray-600 bg-sky-50 p-4 rounded-lg border border-sky-100 mb-6">
                💡 <span className="font-semibold">Tip:</span> Searching “apple” in organization may return Apple Inc., Apple IP, etc. Use commas for bulk search.
              </div>
        
        
                {/* Error Message */}
                {error && <p className="text-red-500 font-semibold text-sm mb-4 text-center">{error}</p>}
        
                {/* Results Table */}
                {matchingProfiles.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg border border-[#38BDF8]/20 overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr>
                          {[
                            'Name', 'Organization', 'Address Line 1', 'Address Line 2', 'City',
                            'State', 'Country', 'Zipcode', 'Phone', 'Reg No.',
                            'Attorney', 'Email'
                          ].map((col, idx) => (
                            <th key={idx} className="border border-[#CBD5E1] p-2 text-left bg-[#38BDF8] text-white font-semibold whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {matchingProfiles.map((profile, index) => (
                          <tr key={index} className="even:bg-[#F8FAFC] hover:bg-[#E2E8F0]">
                            <td className="border p-2 whitespace-nowrap">{profile.name}</td>
                            <td className="border p-2 whitespace-nowrap">{profile.organization}</td>
                            <td className="border p-2 whitespace-nowrap">{profile.addressLine1}</td>
                            <td className="border p-2 whitespace-nowrap">{profile.addressLine2}</td>
                            <td className="border p-2 whitespace-nowrap">{profile.city}</td>
                            <td className="border p-2 whitespace-nowrap">{profile.state}</td>
                            <td className="border p-2 whitespace-nowrap">{profile.country}</td>
                            <td className="border p-2 whitespace-nowrap">{profile.zipcode}</td>
                            <td className="border p-2 whitespace-nowrap">{profile.phoneNumber}</td>
                            <td className="border p-2 whitespace-nowrap">{profile.regCode}</td>
                            <td className="border p-2 whitespace-nowrap">{profile.agentAttorney}</td>
                            <td className="border p-2 whitespace-nowrap">{profile.emailAddress}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
        
                {/* Footer Buttons */}
                <div className="mt-10 text-center flex flex-col sm:flex-row justify-center items-center gap-4">
                  <button
                    onClick={() => {
                      localStorage.clear();
                      navigate('/');
                    }}
                    className="text-[#38BDF8] text-sm font-medium hover:underline"
                  >
                    ← Back to Home
                  </button>
        
                  {isLoggedIn && (
                    <button
                      onClick={() => navigate('/bigdata')}
                      className="text-[#0F172A] text-sm bg-[#E0F2FE] hover:bg-[#BAE6FD] px-4 py-2 rounded-lg font-medium"
                    >
                      Go to Big Data →
                    </button>
                  )}
                </div>
                {/* ===== Additional Bottom Content Section ===== */}
        <section className="relative mt-20 border-t border-gray-200 pt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        
          {/* How It Works */}
          <div className="bg-white rounded-xl p-6 shadow border border-sky-100">
            <h3 className="text-lg font-bold text-sky-700 mb-3">🔍 How It Works</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Choose a search field like Name or Reg No.</li>
              <li>• Enter a value or up to 5 comma-separated items</li>
              <li>• Single search for quick lookups</li>
              <li>• Multiple search requires login</li>
            </ul>
          </div>
        
          {/* Who Should Use This */}
          <div className="bg-white rounded-xl p-6 shadow border border-blue-100">
            <h3 className="text-lg font-bold text-blue-700 mb-3">👥 Who Should Use This?</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Patent attorneys verifying registrations</li>
              <li>• IP research teams exploring law firm rosters</li>
              <li>• Legal data analysts studying trends</li>
              <li>• Organizations validating city or firm affiliations</li>
            </ul>
          </div>
        
          {/* Visual Illustration */}
          <div className="flex items-center justify-center">
            <img
              src={patenillustration}
              alt="Patent Illustration"
              className="w-full max-w-sm rounded-lg shadow-md"
            />
          </div>
        </section>
        
        {/* ===== Call to Action: Big Data Access ===== */}
        {!isLoggedIn && (
          <section className="mt-16 max-w-4xl mx-auto bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl shadow text-center border border-sky-100">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Want to Unlock Big Data Insights?</h3>
            <p className="text-sm text-gray-600 mb-4">Log in to explore detailed attorney patterns, firm clusters, and smart filters designed for analysts.</p>
            <button
              onClick={() => navigate('/MultipleSearchLogin')}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-sky-600 transition shadow"
            >
              Log in for Full Access
            </button>
          </section>
        )}
        
        <section className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-6 text-sky-900">❓ Frequently Asked Questions</h3>
          <div className="space-y-4">
            <details className="bg-white p-4 rounded-xl shadow border border-gray-200 cursor-pointer">
              <summary className="font-medium text-gray-800">What’s the difference between Single and Multiple search?</summary>
              <p className="text-sm mt-2 text-gray-600">Single search lets anyone look up one entry. Multiple search (up to 5) is available after login for bulk lookups.</p>
            </details>
            <details className="bg-white p-4 rounded-xl shadow border border-gray-200 cursor-pointer">
              <summary className="font-medium text-gray-800">Is this data official?</summary>
              <p className="text-sm mt-2 text-gray-600">The data is sourced from public patent records and updated regularly, but it's recommended to cross-verify for legal purposes.</p>
            </details>
            <details className="bg-white p-4 rounded-xl shadow border border-gray-200 cursor-pointer">
              <summary className="font-medium text-gray-800">How often is the directory updated?</summary>
              <p className="text-sm mt-2 text-gray-600">We sync new data weekly to ensure accuracy and completeness.</p>
            </details>
          </div>
        </section>
        <section className="mt-16 max-w-6xl mx-auto text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Trusted by research teams at:</h3>
          <div className="flex justify-center flex-wrap gap-8 items-center opacity-80">
            <img src={logo1} className="h-8 grayscale hover:grayscale-0 transition" alt="Logo 1" />
            <img src={logo2} className="h-8 grayscale hover:grayscale-0 transition" alt="Logo 2" />
            <img src={logo3} className="h-8 grayscale hover:grayscale-0 transition" alt="Logo 3" />
            <img src={logo4} className="h-8 grayscale hover:grayscale-0 transition" alt="Logo 4" />
          </div>
        </section>
        <div className="my-20">
          <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="none">
            <path fill="#E0F2FE" fillOpacity="1" d="M0,64L80,58.7C160,53,320,43,480,42.7C640,43,800,53,960,69.3C1120,85,1280,107,1360,117.3L1440,128L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
          </svg>
        </div>
        <section className="mt-20 max-w-3xl mx-auto bg-white border border-gray-200 p-6 rounded-xl shadow text-center">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">💬 Help us improve</h4>
          <p className="text-sm text-gray-600 mb-4">Have suggestions, feature requests, or found a bug?</p>
          <button
            onClick={() => window.open('https://forms.gle/your-form-id', '_blank')}
            className="text-sm bg-sky-100 text-sky-700 px-4 py-2 rounded hover:bg-sky-200 transition"
          >
            Give Feedback
          </button>
        </section>
        
        <section className="mt-20 max-w-md mx-auto bg-white shadow border border-gray-200 p-6 rounded-xl text-center">
          <h4 className="text-base font-semibold text-gray-800 mb-2">📬 Stay Updated</h4>
          <p className="text-sm text-gray-500 mb-4">Get monthly updates on attorney data improvements and new features.</p>
          <form className="flex flex-col sm:flex-row gap-2 items-center justify-center">
            <input
              type="email"
              placeholder="Your email"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full sm:w-auto"
            />
            <button className="bg-sky-500 text-white px-4 py-2 text-sm rounded hover:bg-sky-600 transition">
              Subscribe
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Explore;
