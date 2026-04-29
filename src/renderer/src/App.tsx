import { HashRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import Studio from '@/pages/Studio'
import Apps from '@/pages/Apps'
import AppOutfitSwap from '@/pages/AppOutfitSwap'
import Tasks from '@/pages/Tasks'
import History from '@/pages/History'
import Templates from '@/pages/Templates'
import Settings from '@/pages/Settings'
import Home from './pages/Home'

function App(): React.JSX.Element {
  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden bg-stone-50">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/apps/outfit-swap" element={<AppOutfitSwap />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/history" element={<History />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </HashRouter>
  )
}

export default App
