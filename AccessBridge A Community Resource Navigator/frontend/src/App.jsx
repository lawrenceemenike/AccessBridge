import { useState, useEffect, useRef } from 'react'
import CanvasPanel from './CanvasPanel'

function App() {
  const [chatHistory, setChatHistory] = useState([])
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [threadId, setThreadId] = useState('')
  const [activeCanvas, setActiveCanvas] = useState(null)
  
  const chatEndRef = useRef(null)

  useEffect(() => {
    setThreadId(crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2))
    setChatHistory([
      { role: 'agent', content: "Hello. I am AccessBridge. Describe the user's situation, and I will securely query the registry to build a verified Action Plan.", isClarification: false }
    ])
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleSubmit = async (textToSubmit) => {
    if (!textToSubmit.trim()) return;
    
    const newChat = [...chatHistory, { role: 'user', content: textToSubmit }];
    setChatHistory(newChat)
    setPrompt('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8002/api/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSubmit, thread_id: threadId })
      })
      const data = await res.json()
      
      setActiveCanvas(data)

      if (data.security_flag) {
         setChatHistory([...newChat, { role: 'agent', content: `Security Blocked: ${data.security_message}`, isClarification: false }])
      } else if (data.clarification_needed) {
         setChatHistory([...newChat, { role: 'agent', content: data.clarification_message, isClarification: true }])
      } else {
         setChatHistory([...newChat, { role: 'agent', content: `Action Plan generated: ${data.action_plan?.summary}`, isClarification: false }])
      }

    } catch (err) {
      console.error(err)
      setChatHistory([...newChat, { role: 'agent', content: "An error occurred connecting to the backend. Is the server running?", isClarification: false }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#191a1a] overflow-hidden text-zinc-300 font-sans selection:bg-zinc-700">
      {/* Subtle Header */}
      <header className="px-6 py-4 flex items-center justify-between shrink-0 z-10 border-b border-[#2f3032]">
        <div className="flex items-center gap-3">
           <svg className="w-6 h-6 text-zinc-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
           </svg>
           <h1 className="text-lg font-medium text-zinc-100 tracking-tight">AccessBridge</h1>
        </div>
        <div className="text-[11px] text-zinc-500 tracking-wider">
          THREAD: {threadId.substring(0,8)}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Pane: Chat Stream (50%) */}
        <div className="w-[50%] min-w-[400px] flex flex-col border-r border-[#2f3032] bg-[#191a1a]">
          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {msg.role === 'user' ? (
                  <div className="max-w-[75%] p-4 bg-[#2f3032] text-zinc-200 rounded-2xl text-[15px] leading-relaxed shadow-sm">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full max-w-[85%] pr-4">
                    <div className="flex items-center gap-3 mb-2 text-zinc-100">
                      <div className="w-6 h-6 rounded bg-[#2f3032] flex items-center justify-center border border-zinc-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      </div>
                      <span className="font-medium text-[15px]">Answer</span>
                    </div>
                    
                    <div className="pl-9 font-serif text-[1.05rem] text-zinc-300 leading-relaxed">
                      {msg.content}
                      
                      {msg.isClarification && idx === chatHistory.length - 1 && (
                         <form 
                           className="mt-6 flex gap-3 w-full"
                           onSubmit={(e) => { e.preventDefault(); handleSubmit(prompt); }}
                         >
                            <input 
                              autoFocus
                              type="text"
                              className="flex-1 bg-[#202222] border border-[#2f3032] rounded-full px-5 py-3 text-[15px] text-zinc-200 focus:border-zinc-500 focus:outline-none transition-colors shadow-sm font-sans"
                              placeholder="Ask a follow-up..."
                              value={prompt}
                              onChange={e => setPrompt(e.target.value)}
                              disabled={loading}
                            />
                            <button 
                              type="submit"
                              disabled={loading || !prompt.trim()}
                              className="w-12 h-12 flex items-center justify-center bg-[#2f3032] hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 rounded-full transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                            </button>
                         </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start w-full pr-4">
                <div className="flex items-center gap-3 mb-2 text-zinc-100">
                  <div className="w-6 h-6 rounded bg-[#2f3032] flex items-center justify-center border border-zinc-700">
                    <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <span className="font-medium text-[15px] animate-pulse text-zinc-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-4" />
          </div>

          {/* Persistent Bottom Input */}
          {(!chatHistory.length || !chatHistory[chatHistory.length - 1].isClarification) && (
            <div className="p-6 bg-[#191a1a]">
               <form 
                 onSubmit={(e) => { e.preventDefault(); handleSubmit(prompt); }}
                 className="relative max-w-3xl mx-auto"
               >
                 <textarea 
                   className="w-full bg-[#202222] border border-[#2f3032] rounded-2xl p-4 pr-14 text-[15px] text-zinc-200 focus:border-zinc-500 focus:outline-none resize-none shadow-sm transition-colors"
                   placeholder="Ask anything..."
                   rows="2"
                   value={prompt}
                   onChange={e => setPrompt(e.target.value)}
                   disabled={loading}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleSubmit(prompt);
                     }
                   }}
                 />
                 <button 
                   type="submit" 
                   disabled={loading || !prompt.trim()}
                   className="absolute bottom-3 right-3 p-2 bg-[#2f3032] hover:bg-zinc-700 text-zinc-300 disabled:opacity-50 rounded-xl transition-colors"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                 </button>
               </form>
            </div>
          )}
        </div>

        {/* Right Pane: Interactive Canvas (50%) */}
        <div className="w-[50%] bg-[#191a1a] p-6">
          <div className="w-full h-full bg-[#202222] border border-[#2f3032] rounded-3xl overflow-hidden flex flex-col shadow-lg">
            <div className="px-6 py-4 shrink-0 flex items-center justify-between border-b border-[#2f3032]">
               <div className="flex items-center gap-2 text-zinc-400">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                 <h2 className="text-[13px] font-medium tracking-wide uppercase">Canvas</h2>
               </div>
               {loading && <span className="text-zinc-500 text-[11px] uppercase tracking-wider animate-pulse">Updating</span>}
            </div>
            <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
               <CanvasPanel data={activeCanvas} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default App
