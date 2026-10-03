import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  ExternalLink, 
  Layers, 
  Check, 
  X,
  Bookmark,
  Award,
  DollarSign
} from 'lucide-react';
import { UNIVERSITIES_DATA } from '../../data/universitiesData.js';
import { translations } from '../../data/translations.js';
import { tr } from '../../utils/translator.js';

const toUniversity = (university, index) => ({
  ...university,
  id: university?.id ?? `university-${index}`,
  name: university?.name || 'University listing',
  city: university?.city || 'Pakistan',
  province: university?.province || '',
  type: university?.type || 'Recognized',
  hecRankTier: university?.hecRankTier || university?.tier || 'Recognized',
  annualFeePkr: Number(university?.annualFeePkr) || 0,
  lastMeritCutoffPct: Number(university?.lastMeritCutoffPct) || 0,
  websiteUrl: university?.websiteUrl || university?.admissionsUrl || university?.officialWebsite || '#',
  programs: Array.isArray(university?.programs) ? university.programs : [],
  hasHostel: Boolean(university?.hasHostel),
});

export function UniversitiesTab({ profile, lang }) {
  const t = translations[lang] || translations.en;

  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [maxFee, setMaxFee] = useState(1500000);
  const [unis, setUnis] = useState(UNIVERSITIES_DATA);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  // Compare Tool State (Up to 3 universities)
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareLimitWarning, setCompareLimitWarning] = useState(false);

  // Fetch universities from backend API
  useEffect(() => {
    fetch(`/api/universities?city=${selectedCity}&type=${selectedType}&tier=${selectedTier}&maxFee=${maxFee}&search=${encodeURIComponent(search)}`)
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData?.data)) {
          setUnis(resData.data.map(toUniversity));
        }
      })
      .catch(() => {
        let filtered = UNIVERSITIES_DATA.filter(u => {
          if (selectedCity !== 'All' && u.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
          if (selectedType !== 'All' && u.type.toLowerCase() !== selectedType.toLowerCase()) return false;
          if (selectedTier !== 'All' && u.hecRankTier.toLowerCase() !== selectedTier.toLowerCase()) return false;
          if (u.annualFeePkr > maxFee) return false;
          if (search) {
            const q = search.toLowerCase();
            const match = u.name.toLowerCase().includes(q) || 
                          (u.shortName || '').toLowerCase().includes(q) || 
                          u.city.toLowerCase().includes(q) ||
                          (u.programs ?? []).some(p => p.toLowerCase().includes(q));
            if (!match) return false;
          }
          return true;
        });
        setUnis(filtered);
      });
  }, [search, selectedCity, selectedType, selectedTier, maxFee]);

  useEffect(() => {
    fetch('/api/bookmarks')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.data)) {
          setBookmarkedIds(data.data.map(b => b.id));
        }
      })
      .catch(err => console.log(err));
  }, []);

  const handleBookmark = (uni) => {
    const isBookmarked = bookmarkedIds.includes(uni.id);
    if (isBookmarked) {
      setBookmarkedIds(prev => prev.filter(id => id !== uni.id));
      fetch(`/api/bookmarks/${uni.id}`, { method: 'DELETE' }).catch(e => console.error(e));
    } else {
      setBookmarkedIds(prev => [...prev, uni.id]);
      fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: uni.id,
          type: 'university',
          title: uni.name,
          city: uni.city,
          officialUrl: uni.websiteUrl
        })
      }).catch(e => console.error(e));
    }
  };

  const toggleCompare = (uni) => {
    if (compareList.some(item => item.id === uni.id)) {
      setCompareList(compareList.filter(item => item.id !== uni.id));
      setCompareLimitWarning(false);
    } else {
      if (compareList.length < 3) {
        setCompareList([...compareList, uni]);
        setCompareLimitWarning(false);
      } else {
        // Show inline banner — no alert()
        setCompareLimitWarning(true);
        setTimeout(() => setCompareLimitWarning(false), 4000);
      }
    }
  };

  const citiesList = ["All", "Islamabad", "Lahore", "Karachi", "Peshawar", "Quetta", "Rawalpindi", "Gujrat", "Multan", "Faisalabad", "Gilgit", "Muzaffarabad"];

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  return (
    <div className="space-y-6">
      {/* Title & Filter Controls Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{t.universities.title}</h1>
              <p className="text-xs text-slate-500">Filter Pakistani universities by HEC rank, fee budget, city, and programs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'map' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>City Map</span>
              </button>
            </div>

            {/* Compare Button */}
            {compareList.length > 0 && (
              <button
                onClick={() => setShowCompareModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                <Layers className="w-4 h-4" />
                <span>{t.universities.compareBtn} ({compareList.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Compare limit warning banner */}
        {compareLimitWarning && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>You can compare up to <strong>3 universities</strong> at a time. Remove one from your selection to add another.</span>
          </div>
        )}

        {/* Search Bar & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.universities.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* City Filter */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            >
              <option value="All">{tr("All Cities", lang)}</option>
              {citiesList.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{tr(c, lang)}</option>
              ))}
            </select>
          </div>

          {/* Sector Type */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            >
              <option value="All">{tr("All Sectors", lang)}</option>
              <option value="Public">{tr("Public", lang)}</option>
              <option value="Private">{tr("Private", lang)}</option>
            </select>
          </div>

          {/* HEC Rank Tier */}
          <div>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            >
              <option value="All">{tr("All Tiers", lang)}</option>
              <option value="Top 5">{tr("W-4 (Top)", lang)}</option>
              <option value="Top 15">{tr("W-3 (High)", lang)}</option>
              <option value="W Category">{tr("W-2", lang)}</option>
              <option value="Recognized">{tr("W-1", lang)}</option>
            </select>
          </div>
        </div>

        {/* Max Fee Slider */}
        <div className="pt-2 flex items-center justify-between gap-4 text-xs">
          <span className="font-semibold text-slate-700">
            {t.universities.filterFee}: <strong className="text-emerald-700 font-extrabold">PKR {maxFee.toLocaleString()}</strong>
          </span>
          <input
            type="range"
            min={40000}
            max={2000000}
            step={50000}
            value={maxFee}
            onChange={(e) => setMaxFee(parseInt(e.target.value, 10))}
            className="w-full max-w-xs accent-emerald-600"
          />
        </div>
      </div>

      {viewMode === 'map' ? (
        /* Interactive City Opportunity Map View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>City-Wise Educational Opportunity Map</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">{unis.length} Recognized Institutes Shown</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {citiesList.filter(c => c !== 'All').map((city) => {
              const cityUnis = unis.filter(u => u.city.toLowerCase() === city.toLowerCase());
              return (
                <div 
                  key={city}
                  onClick={() => { setSelectedCity(city); setViewMode('grid'); }}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/40 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{city}</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      {cityUnis.length} Unis
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {cityUnis.slice(0, 3).map(u => u.shortName || u.name).join(', ')} {cityUnis.length > 3 ? '...' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* University Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {unis.map(toUniversity).map((uni) => {
          const isSelectedForCompare = compareList.some(item => item.id === uni.id);
          const isBookmarked = bookmarkedIds.includes(uni.id);

          return (
            <div key={uni.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{uni.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{uni.city}, {uni.province}</span>
                      </p>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[9px] font-semibold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-2.5 h-2.5 text-emerald-500" />
                        {uni.sourceName || 'HEC Pakistan Recognized'} • VERIFIED
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleBookmark(uni)}
                      title={isBookmarked ? "Saved to Bookmarks" : "Save Bookmark"}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isBookmarked 
                          ? 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400' 
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      uni.type === 'Public' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                    }`}>
                      {uni.type}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.universities?.meritCutoff || 'Merit Cutoff'}</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">{uni.lastMeritCutoffPct}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.universities?.annualFee || 'Annual Fee'}</span>
                    <strong className="text-slate-900 dark:text-white">PKR {(uni.annualFeePkr / 1000).toFixed(0)}k/yr</strong>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <div className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">Popular Programs:</div>
                  <div className="flex flex-wrap gap-1">
                    {uni.programs.slice(0, 4).map((prog, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                        {prog}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleCompare(uni)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isSelectedForCompare
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isSelectedForCompare ? 'Selected' : 'Compare'}</span>
                </button>

                <a
                  href={uni.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition-colors"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Side-by-Side University Comparison</h2>
              <button onClick={() => setShowCompareModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareList.map((uni) => (
                <div key={uni.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                  <h3 className="font-bold text-sm text-slate-900">{uni.name}</h3>
                  <div className="space-y-1 text-slate-700">
                    <div><strong>City:</strong> {uni.city}</div>
                    <div><strong>Sector:</strong> {uni.type}</div>
                    <div><strong>HEC Rank:</strong> {uni.hecRankTier}</div>
                    <div><strong>Annual Fee:</strong> PKR {uni.annualFeePkr.toLocaleString()}</div>
                    <div><strong>Last Merit Cutoff:</strong> {uni.lastMeritCutoffPct}%</div>
                    <div><strong>Hostel:</strong> {uni.hasHostel ? 'Available' : 'No'}</div>
                  </div>
                  <div>
                    <strong>Programs Offered:</strong>
                    <ul className="list-disc list-inside text-slate-600 mt-1">
                      {uni.programs.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
