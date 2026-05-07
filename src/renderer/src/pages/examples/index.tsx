import { Routes, Route } from "react-router-dom"
import Sidebar from "./Sidebar"
import Components from '@renderer/pages/examples/Components'
import ChooseImage from '@renderer/pages/examples/ChooseImage'

export default function Examples() {

  return (
    <div className="size-full flex overflow-hidden">
      <Sidebar />
      <div className="flex-1">
        <Routes>
          {/* 嵌套路由使用相对路径 */}
          <Route path="components" element={<Components />} />
          <Route path="choose-image" element={<ChooseImage />} />
        </Routes>
      </div>
    </div>
  )
}
