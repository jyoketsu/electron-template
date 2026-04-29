import { useState } from 'react'
import { useSettingsStore } from '@/store/settings'
import { Button } from '@/components/ui/button'

export default function Settings() {
  const { outputDir, pollInterval, apiHost, apiKey, apiMode, setOutputDir, setPollInterval, setApiHost, setApiKey, setApiMode } = useSettingsStore()
  const [showKey, setShowKey] = useState(false)

  const handleSelectDir = async () => {
    const dir = await window.api.openDirectory()
    if (dir) setOutputDir(dir)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
      <div className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-4 max-w-2xl">
        <div>
          <div className="text-sm font-semibold text-stone-800">API 配置</div>
          <div className="text-xs text-stone-400 mt-1">配置图片生成服务的接入地址和密钥。</div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-700">API 模式</label>
          <div className="flex gap-2">
            {(['grsai', 'openai'] as const).map((mode) => (
              <button key={mode} onClick={() => setApiMode(mode)}
                className={`px-4 py-1.5 rounded-lg text-xs border transition-colors ${apiMode === mode ? 'bg-[#3d5a3e] text-white border-[#3d5a3e]' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}>
                {mode === 'openai' ? 'OpenAI 官方' : 'Grsai'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-700">API Host</label>
          <input type="text" value={apiHost} onChange={(e) => setApiHost(e.target.value)}
            className="h-9 px-3 text-sm border border-stone-200 rounded-lg bg-stone-50 outline-none focus:border-stone-400 w-full"
            placeholder={apiMode === 'grsai' ? 'https://api.grsai.com' : 'https://api.openai.com'} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-700">API Key</label>
          <div className="flex gap-2">
            <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 h-9 px-3 text-sm border border-stone-200 rounded-lg bg-stone-50 outline-none focus:border-stone-400"
              placeholder="sk-..." />
            <Button variant="outline" size="sm" onClick={() => setShowKey(!showKey)}>
              {showKey ? '隐藏' : '显示'}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-4 max-w-2xl">
        <div>
          <div className="text-sm font-semibold text-stone-800">输出策略</div>
          <div className="text-xs text-stone-400 mt-1">设置结果图片的落盘位置，以及应用轮询远程任务结果的频率。</div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-700">默认输出目录</label>
          <div className="flex gap-2">
            <input type="text" value={outputDir} onChange={(e) => setOutputDir(e.target.value)}
              className="flex-1 h-9 px-3 text-sm border border-stone-200 rounded-lg bg-stone-50 outline-none focus:border-stone-400"
              placeholder="请选择输出目录" />
            <Button variant="outline" size="sm" onClick={handleSelectDir}>选择文件夹</Button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-700">轮询间隔（毫秒）</label>
          <input type="number" value={pollInterval} onChange={(e) => setPollInterval(Number(e.target.value))}
            className="h-9 px-3 text-sm border border-stone-200 rounded-lg bg-stone-50 outline-none focus:border-stone-400 w-full"
            min={500} />
        </div>
      </div>
    </div>
  )
}
