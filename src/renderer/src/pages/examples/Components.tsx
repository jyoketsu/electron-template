import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

export default function Components() {
  const [prompt, setPrompt] = useState('')

  return (
    <div className="w-full bg-white p-4 flex flex-col gap-3">
      <div className="text-sm font-semibold text-stone-700">文本域</div>
      <Textarea
        placeholder="请输入..."
        className="min-h-32 resize-none bg-stone-50 border-stone-200 text-sm"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
    </div>
  )
}