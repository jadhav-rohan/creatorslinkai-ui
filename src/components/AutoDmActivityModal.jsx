import {useEffect,useRef,useState} from "react";
import {X} from "lucide-react";
import {api} from "../api";

const support=error=>error?.requestId?` Support ID: ${error.requestId}`:"";

export default function AutoDmActivityModal({igUserId,rule,token,logout}){
  const [open,setOpen]=useState(false);
  const [logs,setLogs]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const closeRef=useRef(null);

  async function load(){setLoading(true);setError(null);try{const result=await api.getRuleLogs(igUserId,rule.id,token);setLogs(Array.isArray(result)?result:[])}catch(err){if(err.status===401)logout();else setError(err)}finally{setLoading(false)}}
  function show(){setOpen(true);if(logs===null)load()}
  function close(){setOpen(false)}

  useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow="hidden";const onKeyDown=event=>{if(event.key==="Escape")close()};window.addEventListener("keydown",onKeyDown);requestAnimationFrame(()=>closeRef.current?.focus());return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",onKeyDown)}},[open]);

  return <><button type="button" onClick={show} className="border-2 border-zinc-900 bg-white px-4 py-2 text-sm font-black">View delivery activity</button>{open&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)close()}}><section role="dialog" aria-modal="true" aria-labelledby={`activity-title-${rule.id}`} className="flex max-h-[88vh] w-full max-w-4xl flex-col border-2 border-zinc-900 bg-white shadow-[8px_8px_0_#18181b]"><header className="flex items-start justify-between gap-4 border-b-2 border-zinc-900 bg-yellow-300 p-4 sm:p-5"><div><p className="brutal-overline">Comment Auto-DM</p><h2 id={`activity-title-${rule.id}`} className="mt-1 text-2xl font-black">Delivery activity</h2><p className="mt-1 text-sm">Keyword “{rule.keyword}” · Target {rule.mediaId}</p></div><button ref={closeRef} type="button" onClick={close} aria-label="Close delivery activity" className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-zinc-900 bg-white"><X size={22}/></button></header><div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{loading?<div aria-busy="true" className="py-16 text-center font-bold">Loading delivery activity…</div>:error?<div role="alert" className="border-2 border-red-700 bg-red-50 p-4 text-red-800"><p>Delivery activity could not be loaded.{support(error)}</p><button type="button" onClick={load} className="mt-3 font-black underline">Retry</button></div>:!logs?.length?<div className="border-2 border-dashed border-zinc-400 p-10 text-center"><h3 className="text-xl font-black">No delivery attempts yet.</h3><p className="mt-2 text-zinc-600">Matching comment attempts will appear here.</p></div>:<div className="space-y-3">{logs.map((log,index)=><article key={log.id||log.commentId||index} className="border-2 border-zinc-900 bg-zinc-50 p-4"><dl className="grid gap-4 text-sm sm:grid-cols-2"><div><dt className="font-bold text-zinc-500">Comment ID</dt><dd className="break-all font-mono">{log.commentId||"—"}</dd></div><div><dt className="font-bold text-zinc-500">Commenter scoped ID</dt><dd className="break-all font-mono">{log.commenterScopedId||log.commenterId||"—"}</dd></div><div><dt className="font-bold text-zinc-500">Delivery status</dt><dd className="font-black">{log.deliveryStatus||log.status||"—"}</dd></div><div><dt className="font-bold text-zinc-500">Sent / attempted</dt><dd>{log.sentAt||log.attemptedAt||log.createdAt?new Date(log.sentAt||log.attemptedAt||log.createdAt).toLocaleString():"—"}</dd></div></dl>{log.errorMessage&&<p className="mt-3 border-t border-zinc-300 pt-3 text-sm text-red-700">{log.errorMessage}</p>}</article>)}</div>}</div><footer className="flex justify-end border-t-2 border-zinc-900 p-4"><button type="button" onClick={close} className="border-2 border-zinc-900 bg-white px-5 py-2 font-black">Close</button></footer></section></div>}</>;
}
