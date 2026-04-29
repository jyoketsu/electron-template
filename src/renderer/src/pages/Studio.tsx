import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useSettingsStore } from '@/store/settings'
import { useTasksStore } from '@/store/tasks'

const GRSAI_RATIOS: { label: string; value: string }[] = [
  { label: 'auto', value: 'auto' },
  { label: '1:1', value: '1:1' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
  { label: '3:2', value: '3:2' },
  { label: '2:3', value: '2:3' },
]

const OPENAI_RATIOS: { label: string; value: string }[] = [
  { label: 'auto', value: 'auto' },
  { label: '1:1', value: '1024x1024' },
  { label: '横向', value: '1536x1024' },
  { label: '纵向', value: '1024x1536' },
]

interface RefImage { dataUrl: string; name: string }
type Status = 'idle' | 'loading' | 'success' | 'error'

export default function Studio() {
  const [prompt, setPrompt] = useState('')
  const [ratio, setRatio] = useState('auto')
  const [refImages, setRefImages] = useState<RefImage[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [resultImg, setResultImg] = useState<string | null>(null) // url or data:image
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { submitGenerate } = useTasksStore()
  const { apiHost, apiKey, apiMode, outputDir } = useSettingsStore()

  const RATIOS = apiMode === 'grsai' ? GRSAI_RATIOS : OPENAI_RATIOS

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
    if (!prompt.trim()) return
    if (!apiKey) { setErrorMsg('请先在设置中配置 API Key'); setStatus('error'); return }
    if (!outputDir) { setErrorMsg('请先在设置中配置输出目录'); setStatus('error'); return }
    setStatus('loading')
    setErrorMsg('')
    setResultImg(null)

    const res = await submitGenerate({
      apiHost, apiKey, apiMode, prompt, ratio, outputDir,
      images: refImages.length > 0 ? refImages.map((r) => r.dataUrl) : undefined,
    })

    if (!res) {
      setErrorMsg('生成失败')
      setStatus('error')
      return
    }

    if (res.b64) {
      setResultImg(`data:image/png;base64,${res.b64}`)
    }
    setStatus('success')
  }

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-stone-50">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">创作台</h1>
          <p className="text-sm text-stone-500 mt-1">用统一的自由模式完成商业图像创作：组织提示词、补充参考图，并在同一界面里完成生成、审片和输出。</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-2">
          <div className="text-sm font-semibold text-stone-700">自由模式</div>
          <p className="text-xs text-stone-400 leading-relaxed">
            不上传参考图时按文生图处理，上传参考图后按图像编辑处理。<br />
            当前模式：{refImages.length > 0 ? '图像编辑' : '文生图'}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-3">
          <div className="text-sm font-semibold text-stone-700">参考图来源</div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => handleFiles(e.target.files)} />
          <div
            className="border-2 border-dashed border-stone-200 rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-stone-400 transition-colors bg-stone-50"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
            onDragOver={(e) => e.preventDefault()}
          >
            <span className="text-3xl text-stone-300">+</span>
            <span className="text-sm font-medium text-stone-500">添加参考图</span>
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
        </div>
      </main>

      <aside className="w-96 shrink-0 flex flex-col border-l border-stone-200 bg-stone-50 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="text-sm font-semibold text-stone-700">提示词构图区</div>
            <Textarea
              placeholder="描述你想生成或编辑的图片效果"
              className="min-h-32 resize-none bg-stone-50 border-stone-200 text-sm"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="text-sm font-semibold text-stone-700">画面比例</div>
            <div className="flex flex-wrap gap-2">
              {RATIOS.map((r) => (
                <button key={r.value} onClick={() => setRatio(r.value)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${ratio === r.value ? 'bg-[#3d5a3e] text-white border-[#3d5a3e]' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
                >{r.label}</button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 bg-[#3d5a3e] text-white hover:bg-[#2e4530]"
              onClick={handleGenerate} disabled={status === 'loading'}>
              {status === 'loading' ? '生成中...' : '开始生成'}
            </Button>
            <Button variant="outline" onClick={() => setPrompt('')}>清空提示词</Button>
          </div>
        </div>

        <div className="border-t border-stone-200 p-4 flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-700">最新结果</span>
            {status === 'success' && <span className="text-xs text-green-600">● succeeded</span>}
            {status === 'error' && <span className="text-xs text-red-500">● failed</span>}
            {status === 'loading' && <span className="text-xs text-stone-400">● 生成中...</span>}
          </div>
          <div className="flex-1 bg-white border border-stone-200 rounded-xl flex items-center justify-center min-h-48 overflow-hidden">
            {resultImg ? (
              <img src={resultImg} className="w-full h-full object-contain" />
            ) : status === 'error' ? (
              <span className="text-xs text-red-400 px-4 text-center">{errorMsg}</span>
            ) : (
              <span className="text-sm text-stone-300">生成结果将显示在这里</span>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
