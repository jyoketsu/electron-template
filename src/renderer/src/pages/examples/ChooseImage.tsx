import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

import { useSettingsStore } from '@/store/settings'
import { useTasksStore } from '@/store/tasks'

interface RefImage { dataUrl: string; name: string }

export default function ChooseImage() {
  const [refImages, setRefImages] = useState<RefImage[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { submitGenerate } = useTasksStore()
  const { outputDir } = useSettingsStore()

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) =>
        setRefImages((prev) => [...prev, { dataUrl: e.target!.result as string, name: file.name }])
      reader.readAsDataURL(file)
    })
  }

  const handleGenerate = async () => {
    if (refImages.length === 0) { setErrorMsg('请添加图片'); return }
    if (!outputDir) { setErrorMsg('请先在设置中配置输出目录'); return }
    setErrorMsg('')

    submitGenerate({
      outputDir,
      images: refImages.map((r) => r.dataUrl)
    })
  }

  return (
    <div className="w-full bg-white p-4 flex flex-col gap-3">
      <div className="text-sm font-semibold text-stone-700">添加图片</div>
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => handleFiles(e.target.files)} />
      <div
        className="border-2 border-dashed border-stone-200 rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-stone-400 transition-colors bg-stone-50"
        onClick={() => fileInputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        onDragOver={(e) => e.preventDefault()}
      >
        <span className="text-3xl text-stone-300">+</span>
        <span className="text-sm font-medium text-stone-500">选择图片</span>
        <span className="text-xs text-stone-400 text-center">点击选择图片，也可以把图片直接拖到这里。</span>
      </div>
      {refImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {refImages.map((img, i) => (
            <div key={i} className="relative group">
              <img src={img.dataUrl} className="w-20 h-20 object-cover rounded-lg border border-stone-200" />
              <button
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                onClick={() => setRefImages((prev) => prev.filter((_, j) => j !== i))}
              >×</button>
            </div>
          ))}
        </div>
      )}

      <Button className="bg-primary text-white hover:bg-primary-hover"
        onClick={handleGenerate}>
        保存到输出目录
      </Button>

      {
        errorMsg ? (
          <span className="text-xs text-red-400 px-4 text-center">{errorMsg}</span>
        ) : null
      }
    </div>
  )
}