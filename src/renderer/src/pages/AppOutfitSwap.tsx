import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/store/settings'
import { useTasksStore } from '@/store/tasks'

const PROMPT = '将图二中的人物换上图一中的衣服，保持人物比例不变，其他不变'

const GRSAI_RATIOS = ['auto', '16:9', '9:16', '1:1', '4:3', '3:4', '3:2', '2:3']
const OPENAI_RATIOS = [{ label: 'auto', value: 'auto' }, { label: '1:1', value: '1024x1024' }, { label: '横向', value: '1536x1024' }, { label: '纵向', value: '1024x1536' }]

export default function AppOutfitSwap() {
  const navigate = useNavigate()
  const [clothImg, setClothImg] = useState<string | null>(null)
  const [personImg, setPersonImg] = useState<string | null>(null)
  const [ratio, setRatio] = useState('auto')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [resultImg, setResultImg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const clothRef = useRef<HTMLInputElement>(null)
  const personRef = useRef<HTMLInputElement>(null)
  const { apiHost, apiKey, apiMode, outputDir } = useSettingsStore()
  const { submitGenerate } = useTasksStore()

  const ratios = apiMode === 'grsai' ? GRSAI_RATIOS.map(r => ({ label: r, value: r })) : OPENAI_RATIOS

  const readFile = (file: File): Promise<string> =>
    new Promise((res) => { const r = new FileReader(); r.onload = (e) => res(e.target!.result as string); r.readAsDataURL(file) })

  const handleGenerate = async () => {
    if (!clothImg || !personImg) { setErrorMsg('请上传衣服和人物图片'); setStatus('error'); return }
    if (!apiKey) { setErrorMsg('请先在设置中配置 API Key'); setStatus('error'); return }
    if (!outputDir) { setErrorMsg('请先在设置中配置输出目录'); setStatus('error'); return }
    setStatus('loading'); setErrorMsg(''); setResultImg(null)

    const res = await submitGenerate({
      apiHost, apiKey, apiMode, prompt: PROMPT, ratio, outputDir,
      images: [clothImg, personImg],
    })

    if (!res) { setErrorMsg('生成失败'); setStatus('error'); return }
    if (res.b64) setResultImg(`data:image/png;base64,${res.b64}`)
    setStatus('success')
  }

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <div className="w-[420px] shrink-0 overflow-y-auto p-5 flex flex-col gap-4 border-r border-stone-200">
        <button onClick={() => navigate('/apps')} className="text-xs text-stone-500 hover:text-stone-800 w-fit border border-stone-200 rounded-lg px-3 py-1.5">返回应用</button>
        <h1 className="text-2xl font-bold text-stone-800">换衣服</h1>

        {/* 衣服 */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-stone-700">衣服</span>
            {clothImg && <button className="text-xs text-stone-400 hover:text-red-500" onClick={() => setClothImg(null)}>单图</button>}
          </div>
          <input ref={clothRef} type="file" accept="image/*" className="hidden" onChange={async (e) => { if (e.target.files?.[0]) setClothImg(await readFile(e.target.files[0])) }} />
          {clothImg ? (
            <img src={clothImg} className="w-full rounded-lg object-cover max-h-48 cursor-pointer" onClick={() => clothRef.current?.click()} />
          ) : (
            <div className="border-2 border-dashed border-stone-200 rounded-lg p-8 flex flex-col items-center gap-2 cursor-pointer hover:border-stone-400 transition-colors" onClick={() => clothRef.current?.click()}>
              <span className="text-2xl text-stone-300">+</span>
              <span className="text-sm text-stone-400">衣服</span>
            </div>
          )}
        </div>

        {/* 人物 */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-stone-700">人物</span>
            {personImg && <button className="text-xs text-stone-400 hover:text-red-500" onClick={() => setPersonImg(null)}>单图</button>}
          </div>
          <input ref={personRef} type="file" accept="image/*" className="hidden" onChange={async (e) => { if (e.target.files?.[0]) setPersonImg(await readFile(e.target.files[0])) }} />
          {personImg ? (
            <img src={personImg} className="w-full rounded-lg object-cover max-h-48 cursor-pointer" onClick={() => personRef.current?.click()} />
          ) : (
            <div className="border-2 border-dashed border-stone-200 rounded-lg p-8 flex flex-col items-center gap-2 cursor-pointer hover:border-stone-400 transition-colors" onClick={() => personRef.current?.click()}>
              <span className="text-2xl text-stone-300">+</span>
              <span className="text-sm text-stone-400">人物</span>
            </div>
          )}
        </div>

        {/* 比例 */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-3">
          <span className="text-sm font-semibold text-stone-700">画面比例</span>
          <p className="text-xs text-stone-400">Grsai 使用比例参数，最终像素尺寸由渠道生成。</p>
          <div className="flex flex-wrap gap-2">
            {ratios.map((r) => (
              <button key={r.value} onClick={() => setRatio(r.value)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${ratio === r.value ? 'bg-[#3d5a3e] text-white border-[#3d5a3e]' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 bg-[#3d5a3e] text-white hover:bg-[#2e4530]" onClick={handleGenerate} disabled={status === 'loading'}>
            {status === 'loading' ? '生成中...' : '开始生成'}
          </Button>
          <Button variant="outline" onClick={() => { setClothImg(null); setPersonImg(null); setResultImg(null); setStatus('idle') }}>清空</Button>
        </div>
      </div>

      {/* 结果区 */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-stone-700">结果</span>
          <span className="text-xs text-stone-400 ml-auto">{apiMode === 'grsai' ? 'Grsai' : 'OpenAI'}</span>
        </div>
        <div className="flex-1 bg-white border border-stone-200 rounded-xl flex items-center justify-center min-h-64 overflow-hidden">
          {resultImg ? (
            <img src={resultImg} className="w-full h-full object-contain" />
          ) : status === 'error' ? (
            <span className="text-xs text-red-400 px-4 text-center">{errorMsg}</span>
          ) : (
            <span className="text-sm text-stone-300">生成后在这里查看结果。</span>
          )}
        </div>
      </div>
    </div>
  )
}
