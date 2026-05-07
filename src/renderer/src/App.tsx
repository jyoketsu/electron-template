import { HashRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import Home from './pages/Home'
import Examples from '@renderer/pages/examples'
import Settings from '@/pages/Settings'


function App(): React.JSX.Element {
  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden bg-stone-50">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* /examples/*，告诉 React Router 这个路由还有子路径需要匹配 */}
          <Route path="/examples/*" element={<Examples />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </HashRouter>
  )
}

export default App
