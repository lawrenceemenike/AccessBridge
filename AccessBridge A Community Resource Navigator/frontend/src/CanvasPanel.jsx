import { useState, useRef } from 'react';

export default function CanvasPanel({ data }) {
  const [checkedSteps, setCheckedSteps] = useState({});
  const canvasRef = useRef(null);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 font-sans text-sm">
        System Idle. Awaiting user context to generate canvas...
      </div>
    );
  }

  if (data.security_flag) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 font-sans text-center">
        <div className="bg-[#2f3032] border border-red-900/50 p-6 rounded-xl shadow-lg">
           <div className="text-3xl mb-3">🛡️</div>
           <h3 className="font-semibold mb-2 text-red-300">Security Violation Prevented</h3>
           <p className="text-zinc-400 text-sm max-w-sm mx-auto">{data.security_message}</p>
        </div>
      </div>
    );
  }

  const { action_plan } = data;

  if (data.clarification_needed || !action_plan || !action_plan.summary) {
     return (
        <div className="flex flex-col items-center justify-center h-full text-zinc-400 font-sans text-center px-8 space-y-4">
           <div className="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
           <p>Awaiting clarification to generate Action Plan...</p>
        </div>
     );
  }

  const toggleStep = (idx) => {
    setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyPhone = (phone) => {
    navigator.clipboard.writeText(phone);
  };

  const handleExport = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set({filename: 'accessbridge-action-plan.pdf', margin: 10}).from(canvasRef.current).save();
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/?text=' + encodeURIComponent('My AccessBridge Action Plan... ' + data.action_plan.summary), '_blank');
  };

  return (
    <div ref={canvasRef} className="flex flex-col gap-8 h-full font-serif text-zinc-300 pb-10">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[1.05rem] leading-relaxed text-zinc-200">{action_plan.summary}</p>
        <div className="flex flex-col gap-2 shrink-0 items-end">
          {action_plan.trust_badge && (
            <span className="px-3 py-1 bg-[#2f3032] text-zinc-300 border border-zinc-700 rounded-full text-[11px] font-sans font-medium tracking-wide shadow-sm whitespace-nowrap">
              ✓ {action_plan.trust_badge}
            </span>
          )}
          <div className="flex items-center gap-2 mt-2 font-sans" data-html2canvas-ignore>
            <button onClick={handleExport} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors shadow-sm">
              Export PDF
            </button>
            <button onClick={handleWhatsApp} className="px-3 py-1 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded text-xs font-medium transition-colors shadow-sm flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.001 22A9.957 9.957 0 017 20.65l-.364-.216-3.705.972.99-3.61-.237-.378A9.96 9.96 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm0-22C5.383 0 0 5.383 0 12c0 2.125.553 4.128 1.536 5.869L0 24l6.305-1.65A11.942 11.942 0 0012 24c6.617 0 12-5.383 12-12S18.617 0 12 0z"/></svg>
              Share
            </button>
          </div>
        </div>
      </div>

      {/* METRIC DASHBOARD */}
      {action_plan.quantitative_metrics && Object.keys(action_plan.quantitative_metrics).length > 0 && (
         <div className="grid grid-cols-3 gap-4 mt-2 font-sans">
            <div className="bg-[#202222] border border-[#2f3032] p-4 rounded-xl flex flex-col items-center justify-center text-center">
               <span className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Grant Value</span>
               <span className="text-zinc-200 font-bold text-lg">{action_plan.quantitative_metrics.grant_amount || "N/A"}</span>
            </div>
            <div className="bg-[#202222] border border-[#2f3032] p-4 rounded-xl flex flex-col items-center justify-center text-center">
               <span className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Approval Rate</span>
               <span className="text-zinc-200 font-bold text-lg">{action_plan.quantitative_metrics.historical_approval_rate || "N/A"}</span>
            </div>
            <div className="bg-[#202222] border border-blue-900/50 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">
               <span className="text-blue-400/80 text-[10px] uppercase tracking-widest mb-1">Match Score</span>
               <span className="text-blue-400 font-bold text-xl">{action_plan.quantitative_metrics.match_confidence_score || "N/A"}</span>
            </div>
         </div>
      )}

      {action_plan.required_documents?.length > 0 && (
        <div className="mt-2 font-sans">
          <h3 className="text-zinc-500 font-medium text-xs tracking-wide mb-3">Required Documents</h3>
          <ul className="list-none space-y-2 bg-[#202222] p-5 rounded-xl border border-[#2f3032]">
            {action_plan.required_documents.map((doc, idx) => (
              <li key={idx} className="flex items-center text-zinc-300 text-sm">
                <svg className="w-4 h-4 mr-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CONTACT CARD */}
      {action_plan.local_contact && action_plan.local_contact.officer && (
         <div className="mt-2 font-sans">
          <h3 className="text-zinc-500 font-medium text-xs tracking-wide mb-3">Local Point of Contact</h3>
          <div className="bg-[#202222] p-5 rounded-xl border border-[#2f3032] flex items-center justify-between">
             <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-[#2f3032] border border-zinc-700 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
               </div>
               <div>
                 <h4 className="font-semibold text-zinc-200 text-sm">{action_plan.local_contact.officer}</h4>
                 <p className="text-zinc-400 text-xs mt-1 max-w-sm">{action_plan.local_contact.address}</p>
                 <p className="text-zinc-400 text-xs mt-0.5">{action_plan.local_contact.phone}</p>
               </div>
             </div>
             {action_plan.local_contact.phone && (
               <button 
                 onClick={() => copyPhone(action_plan.local_contact.phone)}
                 className="px-3 py-1.5 bg-[#2f3032] hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 border border-zinc-700"
               >
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                 Copy
               </button>
             )}
          </div>
         </div>
      )}

      {/* IMPLEMENTATION STEPS (Interactive) */}
      {action_plan.steps?.length > 0 && (
        <div className="mt-2 flex-1 font-sans">
          <h3 className="text-zinc-500 font-medium text-xs tracking-wide mb-5">Actionable Workflow</h3>
          <div className="flex flex-col gap-4">
            {action_plan.steps.map((step, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-xl border transition-all ${
                  checkedSteps[idx] 
                    ? 'bg-[#191a1a] border-[#2f3032] opacity-60' 
                    : 'bg-[#202222] border-[#3f4042] shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="pt-0.5">
                     <button 
                       onClick={() => toggleStep(idx)}
                       className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                         checkedSteps[idx] ? 'bg-blue-600 border-blue-600' : 'bg-[#191a1a] border-zinc-500 hover:border-zinc-300'
                       }`}
                     >
                        {checkedSteps[idx] && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                     </button>
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${checkedSteps[idx] ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{step.title}</h4>
                    <p className={`text-sm mt-1.5 leading-relaxed ${checkedSteps[idx] ? 'text-zinc-600' : 'text-zinc-400'}`}>{step.description}</p>
                    
                    <div className="flex items-center justify-between mt-4">
                      {step.deadline ? (
                        <p className={`text-xs font-medium ${checkedSteps[idx] ? 'text-zinc-600' : 'text-orange-400/80'}`}>Deadline: {step.deadline}</p>
                      ) : <span/>}
                      
                      {step.is_clickable && step.action_url && (
                         <a 
                           href={step.action_url} 
                           target="_blank" 
                           rel="noreferrer"
                           className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
                             checkedSteps[idx] ? 'bg-zinc-800 text-zinc-500 pointer-events-none' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                           }`}
                         >
                           Apply Now
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                         </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {action_plan.reasoning_trace && (
        <div className="mt-4 pt-6 border-t border-[#2f3032] font-sans">
          <h3 className="text-zinc-500 font-medium text-xs tracking-wide mb-3">Reasoning Trace</h3>
          <p className="text-sm text-zinc-400 leading-relaxed pl-3 border-l-2 border-zinc-700">{action_plan.reasoning_trace}</p>
        </div>
      )}
    </div>
  );
}
