// 'use client'
// import { useState, useMemo, useCallback } from 'react'
// import Navbar from '@/components/Navbar'
// import VideoCard from '@/components/VideoCard'
// import ControlBar from '@/components/ControlBar'
// import InterestSidebar from '@/components/InterestSidebar'
// import StatsSidebar from '@/components/StatsSidebar'
// import {
//   Video, Mic, SlidersHorizontal, Users, X,
//   Sparkles, Globe, Flame, UserPlus, Search, Check
// } from 'lucide-react'
// import Flags from 'country-flag-icons/react/3x2'

// // ── Static Data ───────────────────────────────────────
// const INTERESTS = [
//   { icon: '🎮', label: 'Gaming' }, { icon: '🎵', label: 'Music' },
//   { icon: '🌍', label: 'Travel' }, { icon: '💻', label: 'Tech' },
//   { icon: '🎨', label: 'Art' },   { icon: '📚', label: 'Books' },
//   { icon: '🏋️', label: 'Fitness' },{ icon: '🍕', label: 'Food' },
//   { icon: '🎬', label: 'Movies' }, { icon: '⚽', label: 'Sports' },
// ]

// const ALL_COUNTRIES = [
//   { code: 'IN', name: 'India' },       { code: 'US', name: 'United States' },
//   { code: 'BR', name: 'Brazil' },      { code: 'DE', name: 'Germany' },
//   { code: 'JP', name: 'Japan' },       { code: 'KR', name: 'South Korea' },
//   { code: 'FR', name: 'France' },      { code: 'GB', name: 'United Kingdom' },
//   { code: 'CA', name: 'Canada' },      { code: 'AU', name: 'Australia' },
//   { code: 'MX', name: 'Mexico' },      { code: 'IT', name: 'Italy' },
//   { code: 'ES', name: 'Spain' },       { code: 'RU', name: 'Russia' },
//   { code: 'CN', name: 'China' },       { code: 'TR', name: 'Turkey' },
//   { code: 'SA', name: 'Saudi Arabia' },{ code: 'ZA', name: 'South Africa' },
//   { code: 'NG', name: 'Nigeria' },     { code: 'AR', name: 'Argentina' },
//   { code: 'PH', name: 'Philippines' }, { code: 'ID', name: 'Indonesia' },
//   { code: 'PK', name: 'Pakistan' },    { code: 'EG', name: 'Egypt' },
// ]

// const LANGUAGES = [
//   { code: 'en', label: 'English',    flag: 'GB' },
//   { code: 'hi', label: 'Hindi',      flag: 'IN' },
//   { code: 'es', label: 'Spanish',    flag: 'ES' },
//   { code: 'fr', label: 'French',     flag: 'FR' },
//   { code: 'de', label: 'German',     flag: 'DE' },
//   { code: 'pt', label: 'Portuguese', flag: 'BR' },
//   { code: 'ja', label: 'Japanese',   flag: 'JP' },
//   { code: 'ko', label: 'Korean',     flag: 'KR' },
//   { code: 'zh', label: 'Chinese',    flag: 'CN' },
//   { code: 'ar', label: 'Arabic',     flag: 'SA' },
//   { code: 'ru', label: 'Russian',    flag: 'RU' },
//   { code: 'tr', label: 'Turkish',    flag: 'TR' },
//   { code: 'it', label: 'Italian',    flag: 'IT' },
//   { code: 'id', label: 'Indonesian', flag: 'ID' },
// ]

// const DEFAULT_FILTERS = {
//   gender: 'any',
//   countries: [],
//   languages: ['en'],
//   interests: ['Anime', 'Tech'],
//   smartMatch: true,
//   duoMode: false,
// }

// // ── Sub-components ────────────────────────────────────
// function Toggle({ on, onToggle, color = 'teal' }) {
//   return (
//     <button
//       onClick={onToggle}
//       className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${
//         on ? color === 'teal' ? 'bg-teal-500' : 'bg-violet-500' : 'bg-gray-600'
//       }`}
//     >
//       <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
//         on ? 'left-6' : 'left-0.5'
//       }`} />
//     </button>
//   )
// }

// function SectionLabel({ children, count, onClear }) {
//   return (
//     <div className="flex items-center justify-between mb-3">
//       <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">{children}</p>
//       <div className="flex items-center gap-2">
//         {count !== undefined && count > 0 && (
//           <span className="text-xs text-teal-400 font-semibold">{count} selected</span>
//         )}
//         {onClear && count > 0 && (
//           <button onClick={onClear} className="text-xs text-red-400 hover:text-red-300 transition-colors">
//             Clear
//           </button>
//         )}
//       </div>
//     </div>
//   )
// }

// // ── Main Page ─────────────────────────────────────────
// export default function Home() {
//   const [mode, setMode] = useState('video')
//   const [filterOpen, setFilterOpen] = useState(false)
//   const [isApplying, setIsApplying] = useState(false)

//   // Draft filters (inside sheet — not committed until Apply)
//   const [draft, setDraft] = useState({ ...DEFAULT_FILTERS })

//   // Applied filters (used for actual API calls)
//   const [appliedFilters, setAppliedFilters] = useState({ ...DEFAULT_FILTERS })

//   // Country search
//   const [countrySearch, setCountrySearch] = useState('')

//   // Draft helpers
//   const setDraftField = (key, val) => setDraft(p => ({ ...p, [key]: val }))

//   const toggleDraftArray = (key, val) =>
//     setDraft(p => ({
//       ...p,
//       [key]: p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val],
//     }))

//   const filteredCountries = useMemo(() =>
//     ALL_COUNTRIES.filter(c =>
//       c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
//       c.code.toLowerCase().includes(countrySearch.toLowerCase())
//     ), [countrySearch]
//   )

//   const draftFilterCount =
//     (draft.gender !== 'any' ? 1 : 0) +
//     draft.countries.length +
//     draft.languages.length +
//     draft.interests.length

//   const appliedFilterCount =
//     (appliedFilters.gender !== 'any' ? 1 : 0) +
//     appliedFilters.countries.length +
//     appliedFilters.languages.length +
//     appliedFilters.interests.length

//   // Open sheet — sync draft from applied
//   const openFilter = () => {
//     setDraft({ ...appliedFilters })
//     setCountrySearch('')
//     setFilterOpen(true)
//   }

//   // Apply → commit draft → trigger API call
//   const handleApply = useCallback(async () => {
//     setIsApplying(true)
//     setAppliedFilters({ ...draft })

//     try {
//       // ─────────────────────────────────────────────
//       // 🔌 YOUR API CALL GOES HERE
//       // Example:
//       // await fetch('/api/match/preferences', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify({
//       //     gender:     draft.gender,
//       //     countries:  draft.countries,
//       //     languages:  draft.languages,
//       //     interests:  draft.interests,
//       //     smartMatch: draft.smartMatch,
//       //     duoMode:    draft.duoMode,
//       //   }),
//       // })
//       console.log('✅ Filters applied:', draft)
//     } catch (err) {
//       console.error('Filter API error:', err)
//     } finally {
//       setIsApplying(false)
//       setFilterOpen(false)
//     }
//   }, [draft])

//   // Reset draft inside sheet
//   const handleReset = () => {
//     setDraft({ ...DEFAULT_FILTERS })
//     setCountrySearch('')
//   }

//   return (
//     <main className="min-h-screen bg-[#080C18] relative overflow-x-hidden">
//       {/* Orbs */}
//       <div className="orb w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-teal-500 top-20 -left-16 md:-left-32" />
//       <div className="orb w-40 h-40 sm:w-56 sm:h-56 md:w-80 md:h-80 bg-violet-600 top-40 -right-8 md:right-0" style={{ animationDelay: '3s' }} />
//       <div className="orb w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-blue-600 bottom-20 left-1/3" style={{ animationDelay: '5s' }} />

//       <Navbar />

//       <div className="relative z-10 pt-14 sm:pt-16 md:pt-20 px-3 sm:px-4 md:px-6 pb-24 md:pb-6 max-w-[1400px] mx-auto">

//         {/* Hero Tag */}
//         <div className="flex justify-center mt-3 mb-3 md:mt-4 md:mb-4">
//           <div className="flex items-center gap-2 glass border border-teal-500/20 px-3 py-1.5 rounded-full text-xs text-teal-300">
//             <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse flex-shrink-0" />
//             <span className="hidden sm:inline">2.4M people online —</span> Start a random chat now
//           </div>
//         </div>

//         {/* Mode Toggle */}
//         <div className="flex justify-center mb-4 md:mb-6">
//           <div className="glass border border-white/10 rounded-2xl p-1 flex gap-1">
//             <button
//               onClick={() => setMode('video')}
//               className={`flex items-center gap-1.5 px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ${
//                 mode === 'video' ? 'gradient-btn text-white glow-teal' : 'text-gray-400 hover:text-white'
//               }`}
//             >
//               <Video size={13} /> Video Chat
//             </button>
//             <button
//               onClick={() => setMode('audio')}
//               className={`flex items-center gap-1.5 px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ${
//                 mode === 'audio' ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300' : 'text-gray-400 hover:text-white'
//               }`}
//             >
//               <Mic size={13} /> Voice Chat
//             </button>
//           </div>
//         </div>

//         {/* Applied Filters Summary Bar */}
//         {appliedFilterCount > 0 && (
//           <div className="flex items-center gap-2 mb-3 flex-wrap">
//             <span className="text-xs text-gray-500">Active filters:</span>
//             {appliedFilters.gender !== 'any' && (
//               <span className="px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs capitalize">
//                 {appliedFilters.gender === 'male' ? '👨' : '👩'} {appliedFilters.gender}
//               </span>
//             )}
//             {appliedFilters.countries.slice(0, 2).map(code => {
//               const Flag = Flags[code]
//               return (
//                 <span key={code} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs">
//                   {Flag && <Flag className="w-3.5 h-2.5 rounded-sm" />}
//                   {ALL_COUNTRIES.find(c => c.code === code)?.name}
//                 </span>
//               )
//             })}
//             {appliedFilters.countries.length > 2 && (
//               <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs">
//                 +{appliedFilters.countries.length - 2} countries
//               </span>
//             )}
//             {appliedFilters.interests.slice(0, 2).map(i => (
//               <span key={i} className="px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs">{i}</span>
//             ))}
//             {appliedFilters.interests.length > 2 && (
//               <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs">
//                 +{appliedFilters.interests.length - 2} more
//               </span>
//             )}
//             <button
//               onClick={() => { setAppliedFilters({ ...DEFAULT_FILTERS }); setDraft({ ...DEFAULT_FILTERS }) }}
//               className="text-xs text-red-400 hover:text-red-300 transition-colors ml-1"
//             >
//               Clear all
//             </button>
//           </div>
//         )}

//         {/* Three-Column Layout */}
//         <div className="flex gap-3 md:gap-4 items-start">

//           {/* Left Sidebar — lg+ only */}
//           <div className="hidden lg:block w-56 flex-shrink-0">
//             <InterestSidebar />
//           </div>

//           {/* Center */}
//           <div className="flex-1 flex flex-col gap-3 min-w-0">

//             {/* Video Cards */}
//             <div className="flex gap-2 md:gap-3 flex-col sm:flex-row">
//               <VideoCard label="You" isYou={true} mode={mode} />
//               <VideoCard label="Stranger" isSearching={true} mode={mode} />
//             </div>

//             {/* Control Bar */}
//             <div className="glass rounded-2xl border border-white/6 px-1 sm:px-2 md:px-4">
//               <ControlBar mode={mode} onFilterClick={openFilter} />
//             </div>

//             {/* Mobile Quick Stats */}
//             <div className="grid grid-cols-3 gap-2 lg:hidden">
//               {[
//                 { icon: <Users size={13} className="text-green-400" />, val: '2.4M', sub: 'Online', border: 'border-green-500/10' },
//                 { icon: <Flame size={13} className="text-orange-400" />, val: 'Gaming', sub: 'Trending 🔥', border: 'border-orange-500/10' },
//                 { icon: <Globe size={13} className="text-blue-400" />, val: '190+', sub: 'Countries', border: 'border-blue-500/10' },
//               ].map(({ icon, val, sub, border }) => (
//                 <div key={sub} className={`glass border ${border} rounded-xl p-2.5 flex items-center gap-1.5`}>
//                   {icon}
//                   <div className="min-w-0">
//                     <p className="text-white text-xs font-bold leading-none truncate">{val}</p>
//                     <p className="text-gray-500 text-[10px] mt-0.5 truncate">{sub}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Chat Box */}
//             <div className="glass rounded-2xl border border-white/6 p-3 md:p-4 flex flex-col gap-2 h-[130px] sm:h-[140px]">
//               <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">Chat</p>
//               <div className="flex-1 flex items-center justify-center">
//                 <p className="text-gray-600 text-xs md:text-sm">Connect to start chatting...</p>
//               </div>
//               <div className="flex gap-2">
//                 <input
//                   className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-600 outline-none focus:border-teal-500/50 transition-all min-w-0"
//                   placeholder="Type a message..."
//                 />
//                 <button className="gradient-btn px-3 md:px-4 py-2 rounded-xl text-white text-xs md:text-sm font-semibold flex-shrink-0">
//                   Send
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Right Sidebar — lg+ only */}
//           <div className="hidden lg:block w-56 flex-shrink-0">
//             <StatsSidebar />
//           </div>
//         </div>
//       </div>

//       {/* ── Mobile Bottom Nav ── */}
//       <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-dark border-t border-white/6 px-1 py-2 flex items-center justify-around safe-area-bottom">
//         {[
//           { icon: Video, label: 'Video', action: () => setMode('video'), active: mode === 'video' },
//           { icon: Mic, label: 'Voice', action: () => setMode('audio'), active: mode === 'audio' },
//           { icon: SlidersHorizontal, label: 'Filters', action: openFilter, active: false, badge: appliedFilterCount },
//           { icon: UserPlus, label: 'Duo', action: () => setAppliedFilters(p => ({ ...p, duoMode: !p.duoMode })), active: appliedFilters.duoMode },
//         ].map(({ icon: Icon, label, action, active, badge }) => (
//           <button
//             key={label}
//             onClick={action}
//             className={`flex flex-col items-center gap-0.5 px-3 sm:px-4 py-1 rounded-xl transition-all min-w-[56px] ${
//               active ? 'text-teal-400' : 'text-gray-500 hover:text-gray-300'
//             }`}
//           >
//             <div className="relative">
//               <Icon size={19} />
//               {badge > 0 && (
//                 <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-teal-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
//                   {badge > 9 ? '9+' : badge}
//                 </span>
//               )}
//             </div>
//             <span className="text-[10px] font-medium">{label}</span>
//           </button>
//         ))}
//       </div>

//       {/* ── Filter Bottom Sheet ── */}
//       {filterOpen && (
//         <>
//           {/* Backdrop */}
//           <div
//             className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
//             onClick={() => setFilterOpen(false)}
//           />

//           {/* Sheet */}
//           <div
//             className="fixed z-50 w-full md:w-[480px] rounded-t-3xl md:rounded-2xl flex flex-col"
//             style={{
//               bottom: 0,
//               left: '50%',
//               transform: 'translateX(-50%)',
//               background: 'rgba(8, 12, 24, 0.99)',
//               backdropFilter: 'blur(32px)',
//               border: '1px solid rgba(255,255,255,0.08)',
//               maxHeight: '92vh',
//             }}
//           >
//             {/* Scrollable body */}
//             <div className="overflow-y-auto flex flex-col gap-4 p-4 sm:p-5">

//               {/* Handle */}
//               <div className="w-10 h-1 bg-white/20 rounded-full mx-auto md:hidden flex-shrink-0" />

//               {/* Header */}
//               <div className="flex items-center justify-between flex-shrink-0">
//                 <div className="flex items-center gap-2 flex-wrap">
//                   <SlidersHorizontal size={17} className="text-teal-400" />
//                   <h2 className="text-white font-bold text-sm sm:text-base">Filters & Preferences</h2>
//                   {draftFilterCount > 0 && (
//                     <span className="px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold">
//                       {draftFilterCount} active
//                     </span>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => setFilterOpen(false)}
//                   className="p-1.5 glass rounded-xl border border-white/10 hover:bg-white/10 transition-all flex-shrink-0"
//                 >
//                   <X size={15} className="text-gray-400" />
//                 </button>
//               </div>

//               {/* ── Smart Match ── */}
//               <div className="glass border border-white/6 rounded-2xl p-3.5 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
//                     <Sparkles size={15} className="text-teal-400" />
//                   </div>
//                   <div>
//                     <p className="text-white text-xs sm:text-sm font-semibold">Smart Match</p>
//                     <p className="text-gray-500 text-[10px] sm:text-xs">Match by shared interests</p>
//                   </div>
//                 </div>
//                 <Toggle on={draft.smartMatch} onToggle={() => setDraftField('smartMatch', !draft.smartMatch)} />
//               </div>

//               {/* ── Gender ── */}
//               <div>
//                 <SectionLabel>Match by Gender</SectionLabel>
//                 <div className="grid grid-cols-3 gap-2">
//                   {[
//                     { value: 'any', label: 'Anyone', emoji: '👥' },
//                     { value: 'male', label: 'Male', emoji: '👨' },
//                     { value: 'female', label: 'Female', emoji: '👩' },
//                   ].map(({ value, label, emoji }) => (
//                     <button
//                       key={value}
//                       onClick={() => setDraftField('gender', value)}
//                       className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border transition-all duration-200 ${
//                         draft.gender === value
//                           ? 'bg-teal-500/15 border-teal-500/50 text-teal-300'
//                           : 'glass border-white/8 text-gray-400 hover:border-white/20 hover:text-gray-200'
//                       }`}
//                     >
//                       <span className="text-xl sm:text-2xl">{emoji}</span>
//                       <span className="text-[10px] sm:text-xs font-semibold">{label}</span>
//                       {draft.gender === value && <span className="w-1.5 h-1.5 bg-teal-400 rounded-full" />}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* ── Country ── */}
//               <div>
//                 <SectionLabel
//                   count={draft.countries.length}
//                   onClear={() => setDraftField('countries', [])}
//                 >
//                   Filter by Country
//                 </SectionLabel>

//                 {/* Search */}
//                 <div className="relative mb-2.5">
//                   <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
//                   <input
//                     value={countrySearch}
//                     onChange={(e) => setCountrySearch(e.target.value)}
//                     className="w-full glass border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm text-white placeholder-gray-600 outline-none focus:border-teal-500/50 transition-all"
//                     placeholder="Search country or code..."
//                   />
//                   {countrySearch && (
//                     <button onClick={() => setCountrySearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
//                       <X size={12} className="text-gray-500 hover:text-gray-300" />
//                     </button>
//                   )}
//                 </div>

//                 {/* Grid */}
//                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
//                   {filteredCountries.length === 0 ? (
//                     <p className="col-span-4 text-center text-gray-600 text-xs py-4">No countries found</p>
//                   ) : filteredCountries.map(({ code, name }) => {
//                     const Flag = Flags[code]
//                     const isSelected = draft.countries.includes(code)
//                     return (
//                       <button
//                         key={code}
//                         onClick={() => toggleDraftArray('countries', code)}
//                         className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200 ${
//                           isSelected
//                             ? 'bg-teal-500/15 border-teal-500/50'
//                             : 'glass border-white/8 hover:border-white/20'
//                         }`}
//                       >
//                         <div className="w-9 h-6 rounded-md overflow-hidden flex-shrink-0 bg-gray-800">
//                           {Flag
//                             ? <Flag className="w-full h-full object-cover" />
//                             : <span className="text-[9px] text-gray-400 flex items-center justify-center h-full">{code}</span>
//                           }
//                         </div>
//                         <span className={`text-[9px] sm:text-[10px] font-medium text-center leading-tight w-full truncate ${
//                           isSelected ? 'text-teal-300' : 'text-gray-400'
//                         }`}>
//                           {name.length > 9 ? name.slice(0, 8) + '…' : name}
//                         </span>
//                         {isSelected && (
//                           <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center">
//                             <Check size={8} className="text-white" />
//                           </div>
//                         )}
//                       </button>
//                     )
//                   })}
//                 </div>

//                 {/* Selected chips */}
//                 {draft.countries.length > 0 && (
//                   <div className="flex flex-wrap gap-1.5 mt-2.5">
//                     {draft.countries.map(code => {
//                       const Flag = Flags[code]
//                       const country = ALL_COUNTRIES.find(c => c.code === code)
//                       return (
//                         <div key={code} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[10px] sm:text-xs font-medium">
//                           {Flag && <Flag className="w-4 h-2.5 rounded-sm flex-shrink-0" />}
//                           <span className="max-w-[60px] truncate">{country?.name}</span>
//                           <button onClick={() => toggleDraftArray('countries', code)}>
//                             <X size={10} className="ml-0.5 hover:text-white flex-shrink-0" />
//                           </button>
//                         </div>
//                       )
//                     })}
//                   </div>
//                 )}
//               </div>

//               {/* ── Language ── */}
//               <div>
//                 <SectionLabel
//                   count={draft.languages.length}
//                   onClear={() => setDraftField('languages', [])}
//                 >
//                   Filter by Language
//                 </SectionLabel>
//                 <div className="grid grid-cols-2 gap-1.5">
//                   {LANGUAGES.map(({ code, label, flag }) => {
//                     const Flag = Flags[flag]
//                     const isSelected = draft.languages.includes(code)
//                     return (
//                       <button
//                         key={code}
//                         onClick={() => toggleDraftArray('languages', code)}
//                         className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
//                           isSelected
//                             ? 'bg-violet-500/15 border-violet-500/50 text-violet-300'
//                             : 'glass border-white/8 text-gray-400 hover:border-white/20 hover:text-gray-200'
//                         }`}
//                       >
//                         <div className="w-7 h-4.5 rounded-sm overflow-hidden flex-shrink-0 bg-gray-800" style={{ height: '18px' }}>
//                           {Flag ? <Flag className="w-full h-full object-cover" /> : <span className="text-[9px] text-gray-400">{flag}</span>}
//                         </div>
//                         <span className="text-[10px] sm:text-xs font-medium flex-1 text-left truncate">{label}</span>
//                         {isSelected && <Check size={12} className="text-violet-400 flex-shrink-0" />}
//                       </button>
//                     )
//                   })}
//                 </div>
//               </div>

//               {/* ── Interests ── */}
//               <div>
//                 <SectionLabel
//                   count={draft.interests.length}
//                   onClear={() => setDraftField('interests', [])}
//                 >
//                   Your Interests
//                 </SectionLabel>
//                 <div className="flex flex-wrap gap-1.5 sm:gap-2">
//                   {INTERESTS.map(({ icon, label }) => (
//                     <button
//                       key={label}
//                       onClick={() => toggleDraftArray('interests', label)}
//                       className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
//                         draft.interests.includes(label)
//                           ? 'bg-teal-500/20 border border-teal-500/50 text-teal-300'
//                           : 'glass border border-white/8 text-gray-400 hover:border-white/20 hover:text-gray-200'
//                       }`}
//                     >
//                       <span>{icon}</span>{label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* ── Duo Mode ── */}
//               <div className="glass border border-white/6 rounded-2xl p-3.5 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
//                     <UserPlus size={15} className="text-violet-400" />
//                   </div>
//                   <div>
//                     <p className="text-white text-xs sm:text-sm font-semibold">Duo Mode</p>
//                     <p className="text-gray-500 text-[10px] sm:text-xs">Chat with a friend together</p>
//                   </div>
//                 </div>
//                 <Toggle on={draft.duoMode} onToggle={() => setDraftField('duoMode', !draft.duoMode)} color="violet" />
//               </div>

//               {/* ── Reset + Apply ── */}
//               <div className="flex gap-2 pb-4 sm:pb-2 flex-shrink-0">
//                 <button
//                   onClick={handleReset}
//                   className="flex-1 py-3 rounded-2xl glass border border-white/10 text-gray-400 font-semibold text-xs sm:text-sm hover:text-white hover:border-white/20 transition-all"
//                 >
//                   Reset All
//                 </button>
//                 <button
//                   onClick={handleApply}
//                   disabled={isApplying}
//                   className="flex-[2] gradient-btn py-3 rounded-2xl text-white font-bold text-xs sm:text-sm glow-teal disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                 >
//                   {isApplying ? (
//                     <>
//                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                       Applying...
//                     </>
//                   ) : (
//                     `Apply ${draftFilterCount > 0 ? `(${draftFilterCount} filters)` : 'Filters'}`
//                   )}
//                 </button>
//               </div>

//             </div>
//           </div>
//         </>
//       )}
//     </main>
//   )
// } 
/////////////BEST CODE AND BEST UI ///////////////////////////


'use client'
import { useState, useMemo, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import VideoCard from '@/components/VideoCard'
import ControlBar from '@/components/ControlBar'
import InterestSidebar from '@/components/InterestSidebar'
import StatsSidebar from '@/components/StatsSidebar'
import { useWebRTC } from '@/components/hooks/useWebRTC'
import {
  Video, Mic, SlidersHorizontal, Users, X,
  Sparkles, Globe, Flame, UserPlus, Search, Check, Send
} from 'lucide-react'
import Flags from 'country-flag-icons/react/3x2'

// ── Static Data ───────────────────────────────────────
const INTERESTS = [
  { icon: '🎮', label: 'Gaming' }, { icon: '🎵', label: 'Music' },
  { icon: '🌍', label: 'Travel' }, { icon: '💻', label: 'Tech' },
  { icon: '🎨', label: 'Art' },   { icon: '📚', label: 'Books' },
  { icon: '🏋️', label: 'Fitness' },{ icon: '🍕', label: 'Food' },
  { icon: '🎬', label: 'Movies' }, { icon: '⚽', label: 'Sports' },
]

const ALL_COUNTRIES = [
  { code: 'IN', name: 'India' },       { code: 'US', name: 'United States' },
  { code: 'BR', name: 'Brazil' },      { code: 'DE', name: 'Germany' },
  { code: 'JP', name: 'Japan' },       { code: 'KR', name: 'South Korea' },
  { code: 'FR', name: 'France' },      { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },      { code: 'AU', name: 'Australia' },
  { code: 'MX', name: 'Mexico' },      { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },       { code: 'RU', name: 'Russia' },
  { code: 'CN', name: 'China' },       { code: 'TR', name: 'Turkey' },
  { code: 'SA', name: 'Saudi Arabia' },{ code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },     { code: 'AR', name: 'Argentina' },
  { code: 'PH', name: 'Philippines' }, { code: 'ID', name: 'Indonesia' },
  { code: 'PK', name: 'Pakistan' },    { code: 'EG', name: 'Egypt' },
]

const LANGUAGES = [
  { code: 'en', label: 'English',    flag: 'GB' },
  { code: 'hi', label: 'Hindi',      flag: 'IN' },
  { code: 'es', label: 'Spanish',    flag: 'ES' },
  { code: 'fr', label: 'French',     flag: 'FR' },
  { code: 'de', label: 'German',     flag: 'DE' },
  { code: 'pt', label: 'Portuguese', flag: 'BR' },
  { code: 'ja', label: 'Japanese',   flag: 'JP' },
  { code: 'ko', label: 'Korean',     flag: 'KR' },
  { code: 'zh', label: 'Chinese',    flag: 'CN' },
  { code: 'ar', label: 'Arabic',     flag: 'SA' },
  { code: 'ru', label: 'Russian',    flag: 'RU' },
  { code: 'tr', label: 'Turkish',    flag: 'TR' },
  { code: 'it', label: 'Italian',    flag: 'IT' },
  { code: 'id', label: 'Indonesian', flag: 'ID' },
]

const DEFAULT_FILTERS = {
  gender: 'any',
  countries: [],
  languages: ['en'],
  interests: ['Anime', 'Tech'],
  smartMatch: true,
  duoMode: false,
}

// ── Sub-components ────────────────────────────────────
function Toggle({ on, onToggle, color = 'teal' }) {
  return (
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${
        on ? color === 'teal' ? 'bg-teal-500' : 'bg-violet-500' : 'bg-gray-600'
      }`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
        on ? 'left-6' : 'left-0.5'
      }`} />
    </button>
  )
}

function SectionLabel({ children, count, onClear }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">{children}</p>
      <div className="flex items-center gap-2">
        {count !== undefined && count > 0 && (
          <span className="text-xs text-teal-400 font-semibold">{count} selected</span>
        )}
        {onClear && count > 0 && (
          <button onClick={onClear} className="text-xs text-red-400 hover:text-red-300 transition-colors">
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

// ── Chat Box ──────────────────────────────────────────
function ChatBox({ messages, chatReady, isConnected, onSend }) {
  const [input, setInput] = useState('')
  const messagesEndRef = useCallback(node => { if (node) node.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    onSend(input)
    setInput('')
  }

  return (
    <div className="glass rounded-2xl border border-white/6 p-3 md:p-4 flex flex-col gap-2 h-[130px] sm:h-[160px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">Chat</p>
        {isConnected && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
            chatReady
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
          }`}>
            {chatReady ? '⚡ P2P' : '↗ Relay'}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 text-xs md:text-sm">
              {isConnected ? 'Say hello!' : 'Connect to start chatting...'}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
            >
              <span className={`max-w-[75%] px-2.5 py-1.5 rounded-xl text-xs break-words ${
                msg.fromMe
                  ? 'bg-teal-500/20 border border-teal-500/30 text-teal-100'
                  : 'bg-violet-500/20 border border-violet-500/30 text-violet-100'
              }`}>
                {msg.text}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 flex-shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={!isConnected}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-600 outline-none focus:border-teal-500/50 transition-all min-w-0 disabled:opacity-40 disabled:cursor-not-allowed"
          placeholder={isConnected ? 'Type a message...' : 'Connect first...'}
        />
        <button
          onClick={handleSend}
          disabled={!isConnected || !input.trim()}
          className="gradient-btn px-3 md:px-4 py-2 rounded-xl text-white text-xs md:text-sm font-semibold flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <Send size={12} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────
export default function Home() {
  const [mode, setMode] = useState('video')
  const [filterOpen, setFilterOpen] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  // ── WebRTC hook ──────────────────────────────────────
  const {
    localStream,
    remoteStream,
    status,
    isMuted,
    isCamOff,
    messages,
    chatReady,
    sendMessage,
    findStranger,
    cancelSearch,
    skipStranger,
    toggleMute,
    toggleCamera,
  } = useWebRTC(mode)

  const isSearching  = status === 'waiting' || status === 'connecting'
  const isConnected  = status === 'connected'

  // Draft filters (inside sheet — not committed until Apply)
  const [draft, setDraft] = useState({ ...DEFAULT_FILTERS })
  const [appliedFilters, setAppliedFilters] = useState({ ...DEFAULT_FILTERS })
  const [countrySearch, setCountrySearch] = useState('')

  const setDraftField = (key, val) => setDraft(p => ({ ...p, [key]: val }))

  const toggleDraftArray = (key, val) =>
    setDraft(p => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val],
    }))

  const filteredCountries = useMemo(() =>
    ALL_COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
    ), [countrySearch]
  )

  const draftFilterCount =
    (draft.gender !== 'any' ? 1 : 0) +
    draft.countries.length +
    draft.languages.length +
    draft.interests.length

  const appliedFilterCount =
    (appliedFilters.gender !== 'any' ? 1 : 0) +
    appliedFilters.countries.length +
    appliedFilters.languages.length +
    appliedFilters.interests.length

  const openFilter = () => {
    setDraft({ ...appliedFilters })
    setCountrySearch('')
    setFilterOpen(true)
  }

  const handleApply = useCallback(async () => {
    setIsApplying(true)
    setAppliedFilters({ ...draft })
    try {
    const res = await fetch('https://localhost:3001/api/match/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gender:     draft.gender,
        countries:  draft.countries,
        languages:  draft.languages,
        interests:  draft.interests,
        smartMatch: draft.smartMatch,
        duoMode:    draft.duoMode,
      }),
})

if (!res.ok) throw new Error(`Server error: ${res.status}`)

const data = await res.json()
console.log('✅ Filters applied:', data)


    } catch (err) {
      console.error('Filter API error:', err)
    } finally {
      setIsApplying(false)
      setFilterOpen(false)
    }
  }, [draft])

  const handleReset = () => {
    setDraft({ ...DEFAULT_FILTERS })
    setCountrySearch('')
  }

  return (
    <main className="min-h-screen bg-[#080C18] relative overflow-x-hidden">
      {/* Orbs */}
      <div className="orb w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-teal-500 top-20 -left-16 md:-left-32" />
      <div className="orb w-40 h-40 sm:w-56 sm:h-56 md:w-80 md:h-80 bg-violet-600 top-40 -right-8 md:right-0" style={{ animationDelay: '3s' }} />
      <div className="orb w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-blue-600 bottom-20 left-1/3" style={{ animationDelay: '5s' }} />

      <Navbar />

      <div className="relative z-10 pt-14 sm:pt-16 md:pt-20 px-3 sm:px-4 md:px-6 pb-24 md:pb-6 max-w-[1400px] mx-auto">

        {/* Hero Tag */}
        <div className="flex justify-center mt-3 mb-3 md:mt-4 md:mb-4">
          <div className="flex items-center gap-2 glass border border-teal-500/20 px-3 py-1.5 rounded-full text-xs text-teal-300">
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse flex-shrink-0" />
            <span className="hidden sm:inline">2.4M people online —</span> Start a random chat now
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="glass border border-white/10 rounded-2xl p-1 flex gap-1">
            <button
              onClick={() => setMode('video')}
              className={`flex items-center gap-1.5 px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ${
                mode === 'video' ? 'gradient-btn text-white glow-teal' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Video size={13} /> Video Chat
            </button>
            <button
              onClick={() => setMode('audio')}
              className={`flex items-center gap-1.5 px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ${
                mode === 'audio' ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Mic size={13} /> Voice Chat
            </button>
          </div>
        </div>

        {/* Applied Filters Summary Bar */}
        {appliedFilterCount > 0 && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs text-gray-500">Active filters:</span>
            {appliedFilters.gender !== 'any' && (
              <span className="px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs capitalize">
                {appliedFilters.gender === 'male' ? '👨' : '👩'} {appliedFilters.gender}
              </span>
            )}
            {appliedFilters.countries.slice(0, 2).map(code => {
              const Flag = Flags[code]
              return (
                <span key={code} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs">
                  {Flag && <Flag className="w-3.5 h-2.5 rounded-sm" />}
                  {ALL_COUNTRIES.find(c => c.code === code)?.name}
                </span>
              )
            })}
            {appliedFilters.countries.length > 2 && (
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs">
                +{appliedFilters.countries.length - 2} countries
              </span>
            )}
            {appliedFilters.interests.slice(0, 2).map(i => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs">{i}</span>
            ))}
            {appliedFilters.interests.length > 2 && (
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs">
                +{appliedFilters.interests.length - 2} more
              </span>
            )}
            <button
              onClick={() => { setAppliedFilters({ ...DEFAULT_FILTERS }); setDraft({ ...DEFAULT_FILTERS }) }}
              className="text-xs text-red-400 hover:text-red-300 transition-colors ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Three-Column Layout */}
        <div className="flex gap-3 md:gap-4 items-start">

          {/* Left Sidebar */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <InterestSidebar />
          </div>

          {/* Center */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">

            {/* ── Video Cards ── */}
            <div className="flex gap-2 md:gap-3 flex-col sm:flex-row">
              <VideoCard
                label="You"
                stream={localStream}
                isYou={true}
                mode={mode}
                isMuted={isMuted}
                isCamOff={isCamOff}
              />
              <VideoCard
                label="Stranger"
                stream={remoteStream}
                isSearching={isSearching}
                isYou={false}
                mode={mode}
                isMuted={false}
                isCamOff={false}
              />
            </div>

            {/* ── Control Bar ── */}
            <div className="glass rounded-2xl border border-white/6 px-1 sm:px-2 md:px-4">
              <ControlBar
                mode={mode}
                status={status}
                isMuted={isMuted}
                isCamOff={isCamOff}
                onFind={findStranger}
                onCancel={cancelSearch}
                onSkip={skipStranger}
                onToggleMute={toggleMute}
                onToggleCamera={toggleCamera}
                onFilterClick={openFilter}
              />
            </div>

            {/* Mobile Quick Stats */}
            <div className="grid grid-cols-3 gap-2 lg:hidden">
              {[
                { icon: <Users size={13} className="text-green-400" />, val: '2.4M', sub: 'Online', border: 'border-green-500/10' },
                { icon: <Flame size={13} className="text-orange-400" />, val: 'Gaming', sub: 'Trending 🔥', border: 'border-orange-500/10' },
                { icon: <Globe size={13} className="text-blue-400" />, val: '190+', sub: 'Countries', border: 'border-blue-500/10' },
              ].map(({ icon, val, sub, border }) => (
                <div key={sub} className={`glass border ${border} rounded-xl p-2.5 flex items-center gap-1.5`}>
                  {icon}
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold leading-none truncate">{val}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5 truncate">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Chat Box ── */}
            <ChatBox
              messages={messages}
              chatReady={chatReady}
              isConnected={isConnected}
              onSend={sendMessage}
            />

          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <StatsSidebar />
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-dark border-t border-white/6 px-1 py-2 flex items-center justify-around safe-area-bottom">
        {[
          { icon: Video,         label: 'Video',   action: () => setMode('video'),                                              active: mode === 'video' },
          { icon: Mic,           label: 'Voice',   action: () => setMode('audio'),                                             active: mode === 'audio' },
          { icon: SlidersHorizontal, label: 'Filters', action: openFilter,                                                     active: false, badge: appliedFilterCount },
          { icon: UserPlus,      label: 'Duo',     action: () => setAppliedFilters(p => ({ ...p, duoMode: !p.duoMode })),      active: appliedFilters.duoMode },
        ].map(({ icon: Icon, label, action, active, badge }) => (
          <button
            key={label}
            onClick={action}
            className={`flex flex-col items-center gap-0.5 px-3 sm:px-4 py-1 rounded-xl transition-all min-w-[56px] ${
              active ? 'text-teal-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="relative">
              <Icon size={19} />
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-teal-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Filter Bottom Sheet ── */}
      {filterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={() => setFilterOpen(false)}
          />
          <div
            className="fixed z-50 w-full md:w-[480px] rounded-t-3xl md:rounded-2xl flex flex-col"
            style={{
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(8, 12, 24, 0.99)',
              backdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.08)',
              maxHeight: '92vh',
            }}
          >
            <div className="overflow-y-auto flex flex-col gap-4 p-4 sm:p-5">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto md:hidden flex-shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <SlidersHorizontal size={17} className="text-teal-400" />
                  <h2 className="text-white font-bold text-sm sm:text-base">Filters & Preferences</h2>
                  {draftFilterCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold">
                      {draftFilterCount} active
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="p-1.5 glass rounded-xl border border-white/10 hover:bg-white/10 transition-all flex-shrink-0"
                >
                  <X size={15} className="text-gray-400" />
                </button>
              </div>

              {/* Smart Match */}
              <div className="glass border border-white/6 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={15} className="text-teal-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs sm:text-sm font-semibold">Smart Match</p>
                    <p className="text-gray-500 text-[10px] sm:text-xs">Match by shared interests</p>
                  </div>
                </div>
                <Toggle on={draft.smartMatch} onToggle={() => setDraftField('smartMatch', !draft.smartMatch)} />
              </div>

              {/* Gender */}
              <div>
                <SectionLabel>Match by Gender</SectionLabel>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'any', label: 'Anyone', emoji: '👥' },
                    { value: 'male', label: 'Male', emoji: '👨' },
                    { value: 'female', label: 'Female', emoji: '👩' },
                  ].map(({ value, label, emoji }) => (
                    <button
                      key={value}
                      onClick={() => setDraftField('gender', value)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border transition-all duration-200 ${
                        draft.gender === value
                          ? 'bg-teal-500/15 border-teal-500/50 text-teal-300'
                          : 'glass border-white/8 text-gray-400 hover:border-white/20 hover:text-gray-200'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl">{emoji}</span>
                      <span className="text-[10px] sm:text-xs font-semibold">{label}</span>
                      {draft.gender === value && <span className="w-1.5 h-1.5 bg-teal-400 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country */}
              <div>
                <SectionLabel count={draft.countries.length} onClear={() => setDraftField('countries', [])}>
                  Filter by Country
                </SectionLabel>
                <div className="relative mb-2.5">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="w-full glass border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm text-white placeholder-gray-600 outline-none focus:border-teal-500/50 transition-all"
                    placeholder="Search country or code..."
                  />
                  {countrySearch && (
                    <button onClick={() => setCountrySearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X size={12} className="text-gray-500 hover:text-gray-300" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                  {filteredCountries.length === 0 ? (
                    <p className="col-span-4 text-center text-gray-600 text-xs py-4">No countries found</p>
                  ) : filteredCountries.map(({ code, name }) => {
                    const Flag = Flags[code]
                    const isSelected = draft.countries.includes(code)
                    return (
                      <button
                        key={code}
                        onClick={() => toggleDraftArray('countries', code)}
                        className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200 ${
                          isSelected ? 'bg-teal-500/15 border-teal-500/50' : 'glass border-white/8 hover:border-white/20'
                        }`}
                      >
                        <div className="w-9 h-6 rounded-md overflow-hidden flex-shrink-0 bg-gray-800">
                          {Flag
                            ? <Flag className="w-full h-full object-cover" />
                            : <span className="text-[9px] text-gray-400 flex items-center justify-center h-full">{code}</span>
                          }
                        </div>
                        <span className={`text-[9px] sm:text-[10px] font-medium text-center leading-tight w-full truncate ${
                          isSelected ? 'text-teal-300' : 'text-gray-400'
                        }`}>
                          {name.length > 9 ? name.slice(0, 8) + '…' : name}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center">
                            <Check size={8} className="text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
                {draft.countries.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {draft.countries.map(code => {
                      const Flag = Flags[code]
                      const country = ALL_COUNTRIES.find(c => c.code === code)
                      return (
                        <div key={code} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[10px] sm:text-xs font-medium">
                          {Flag && <Flag className="w-4 h-2.5 rounded-sm flex-shrink-0" />}
                          <span className="max-w-[60px] truncate">{country?.name}</span>
                          <button onClick={() => toggleDraftArray('countries', code)}>
                            <X size={10} className="ml-0.5 hover:text-white flex-shrink-0" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Language */}
              <div>
                <SectionLabel count={draft.languages.length} onClear={() => setDraftField('languages', [])}>
                  Filter by Language
                </SectionLabel>
                <div className="grid grid-cols-2 gap-1.5">
                  {LANGUAGES.map(({ code, label, flag }) => {
                    const Flag = Flags[flag]
                    const isSelected = draft.languages.includes(code)
                    return (
                      <button
                        key={code}
                        onClick={() => toggleDraftArray('languages', code)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? 'bg-violet-500/15 border-violet-500/50 text-violet-300'
                            : 'glass border-white/8 text-gray-400 hover:border-white/20 hover:text-gray-200'
                        }`}
                      >
                        <div className="w-7 rounded-sm overflow-hidden flex-shrink-0 bg-gray-800" style={{ height: '18px' }}>
                          {Flag ? <Flag className="w-full h-full object-cover" /> : <span className="text-[9px] text-gray-400">{flag}</span>}
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium flex-1 text-left truncate">{label}</span>
                        {isSelected && <Check size={12} className="text-violet-400 flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Interests */}
              <div>
                <SectionLabel count={draft.interests.length} onClear={() => setDraftField('interests', [])}>
                  Your Interests
                </SectionLabel>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {INTERESTS.map(({ icon, label }) => (
                    <button
                      key={label}
                      onClick={() => toggleDraftArray('interests', label)}
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                        draft.interests.includes(label)
                          ? 'bg-teal-500/20 border border-teal-500/50 text-teal-300'
                          : 'glass border border-white/8 text-gray-400 hover:border-white/20 hover:text-gray-200'
                      }`}
                    >
                      <span>{icon}</span>{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duo Mode */}
              <div className="glass border border-white/6 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <UserPlus size={15} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs sm:text-sm font-semibold">Duo Mode</p>
                    <p className="text-gray-500 text-[10px] sm:text-xs">Chat with a friend together</p>
                  </div>
                </div>
                <Toggle on={draft.duoMode} onToggle={() => setDraftField('duoMode', !draft.duoMode)} color="violet" />
              </div>

              {/* Reset + Apply */}
              <div className="flex gap-2 pb-4 sm:pb-2 flex-shrink-0">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-2xl glass border border-white/10 text-gray-400 font-semibold text-xs sm:text-sm hover:text-white hover:border-white/20 transition-all"
                >
                  Reset All
                </button>
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="flex-[2] gradient-btn py-3 rounded-2xl text-white font-bold text-xs sm:text-sm glow-teal disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isApplying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Applying...
                    </>
                  ) : (
                    `Apply ${draftFilterCount > 0 ? `(${draftFilterCount} filters)` : 'Filters'}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
