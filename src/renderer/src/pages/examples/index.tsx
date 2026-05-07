import { Routes, Route, Navigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import Components from '@renderer/pages/examples/Components'
import ChooseImage from '@renderer/pages/examples/ChooseImage'

export default function Examples() {

  return (
    <div className="size-full flex overflow-hidden">
      <Sidebar />
      <div className="flex-1">
        <Routes>
          {/* 默认重定向到第一个子路由 */}
          <Route index element={<Navigate to="components" replace />} />
          <Route path="components" element={<Components />} />
          <Route path="choose-image" element={<ChooseImage />} />
        </Routes>
      </div>
    </div>
  )
}
