import { Button } from "@renderer/components/ui/button";
import { useState } from "react";

export default function IpcRenderer() {
  const [result, setResult] = useState('');

  const handlePing = async () => {
    const pong = await window.test.ping();
    setResult(result + (result ? '\r\n' : '') + pong);
  }

  return (
    <div className="w-full p-4 flex flex-col gap-3 overflow-auto">
      <div className="text-2xl font-semibold text-stone-700">在进程之间通信: ipcRenderer</div>
      <Button className="bg-primary text-white hover:bg-primary-hover"
        onClick={handlePing}>
        ping
      </Button>

      <div className="pt-2 text-lg font-semibold text-stone-700">响应结果</div>
      <div className="whitespace-pre-wrap">
        {result}
      </div>
    </div>
  )
}