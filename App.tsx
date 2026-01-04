import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Gamepad2, ChevronRight, ChevronDown, Folder } from 'lucide-react';
import HomePage from './pages/Home';
import GameLevel from './pages/GameLevel';
import { levels } from './data/levels';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Get unique categories
  const categories = Array.from(new Set(levels.map(l => l.category)));
  
  // State for expanded categories in sidebar
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>(
    categories.reduce((acc, cat) => ({...acc, [cat]: true}), {})
  );

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  
  const toggleCategory = (cat: string) => {
    setExpandedCats(prev => ({...prev, [cat]: !prev[cat]}));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-slate-800 z-50 px-4 py-3 flex justify-between items-center shadow-md">
        <span className="font-tech text-yellow-400 font-bold">RoboLogic</span>
        <button onClick={toggleSidebar} className="text-white">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 font-tech text-xl font-bold text-yellow-400 border-b border-slate-700">
            RoboLogic
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <Link 
              to="/" 
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-4 ${location.pathname === '/' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
            >
              <Home size={20} />
              <span>Beranda</span>
            </Link>
            
            <div className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Kurikulum
            </div>
            
            {categories.map((cat, catIdx) => {
                const catLevels = levels.filter(l => l.category === cat);
                const isExpanded = expandedCats[cat];
                const isActive = catLevels.some(l => location.pathname === `/level/${l.id}`);

                return (
                    <div key={cat} className="mb-2">
                        <button 
                            onClick={() => toggleCategory(cat)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-colors ${isActive ? 'text-white bg-slate-700/50' : 'text-slate-400 hover:bg-slate-800'}`}
                        >
                           <div className="flex items-center gap-2">
                               <Folder size={16} className={isActive ? 'text-yellow-400' : 'text-slate-500'} />
                               <span>{cat}</span>
                           </div>
                           {isExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                        </button>
                        
                        {isExpanded && (
                            <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-2">
                                {catLevels.map((level, idx) => (
                                    <Link 
                                        key={level.id}
                                        to={`/level/${level.id}`}
                                        onClick={closeSidebar}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${location.pathname === `/level/${level.id}` ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
                                    >
                                        <span className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono ${location.pathname === `/level/${level.id}` ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                            {idx + 1}
                                        </span>
                                        <span className="truncate">{level.title.split(':')[1] || level.title}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
          </nav>
          <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
            &copy; 2026 Malabi Wibowo Susanto
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 scroll-smooth bg-slate-900">
        {children}
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/level/:id" element={<GameLevel />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;