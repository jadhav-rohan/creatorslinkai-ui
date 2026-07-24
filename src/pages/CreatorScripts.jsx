import {useCallback,useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {FilePenLine,Plus,Sparkles,Trash2} from "lucide-react";
import {api} from "../api";
import {useAuth} from "../context/AuthContext";
import {useWorkspace} from "../context/WorkspaceContext";
import {useThemedDialog} from "../context/ThemedDialogContext";
import {scriptErrorMessage} from "../scriptWriter";

function Usage({usage}){
  if(!usage)return <div className="h-32 animate-pulse border-2 border-zinc-900 bg-zinc-200"/>;
  const limit=Math.max(0,Number(usage.limit)||0),used=Math.max(0,Number(usage.used)||0);
  const percentage=limit?Math.min(100,used/limit*100):100;
  return <section className="brutal-card bg-sky-100 p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="brutal-overline">Monthly usage</p><h2 className="mt-2 text-2xl font-black">{used} of {limit} generations used</h2></div><span className="border-2 border-zinc-900 bg-white px-3 py-2 font-black">{Math.max(0,Number(usage.remaining)||0)} remaining</span></div>
    <div className="mt-5 h-4 overflow-hidden border-2 border-zinc-900 bg-white" role="progressbar" aria-valuemin="0" aria-valuemax={limit} aria-valuenow={used}><div className="h-full bg-yellow-300" style={{width:`${percentage}%`}}/></div>
    <p className="mt-3 text-sm text-zinc-600">Resets {usage.resetsAt?new Date(usage.resetsAt).toLocaleDateString():"on your next billing cycle"}.</p>
  </section>;
}

export default function CreatorScripts(){
  const {token,logout}=useAuth();
  const {selectedWorkspace,selectedWorkspaceId:workspaceId,loading:workspaceLoading}=useWorkspace();
  const {confirm}=useThemedDialog();
  const [projects,setProjects]=useState([]);
  const [usage,setUsage]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [deleting,setDeleting]=useState("");
  const workspaceAllowed=["CREATOR","PERSONAL"].includes(selectedWorkspace?.type);

  const load=useCallback(async signal=>{
    if(!workspaceId||!workspaceAllowed)return;
    setLoading(true);setError("");
    try{
      const [projectResult,usageResult]=await Promise.all([
        api.listCreatorScripts(workspaceId,token,{signal}),
        api.getCreatorScriptUsage(workspaceId,token,{signal}),
      ]);
      setProjects(Array.isArray(projectResult)?projectResult:[]);
      setUsage(usageResult);
    }catch(err){
      if(err.name==="AbortError")return;
      if(err.status===401)logout();
      else setError(scriptErrorMessage(err));
    }finally{if(!signal?.aborted)setLoading(false)}
  },[workspaceId,workspaceAllowed,token,logout]);

  useEffect(()=>{const controller=new AbortController();load(controller.signal);return()=>controller.abort()},[load]);

  async function remove(project){
    if(deleting||!await confirm(`Delete “${project.title}”? This cannot be undone, and the generation will remain counted.`,{title:"Delete script project",confirmLabel:"Delete"}))return;
    setDeleting(project.id);setError("");
    try{
      await api.deleteCreatorScript(workspaceId,project.id,token);
      setProjects(current=>current.filter(item=>item.id!==project.id));
    }catch(err){if(err.status===401)logout();else setError(scriptErrorMessage(err))}
    finally{setDeleting("")}
  }

  if(workspaceLoading)return <main className="brutal-page min-h-[calc(100vh-82px)] p-6"><div className="mx-auto max-w-6xl animate-pulse border-2 border-zinc-900 bg-zinc-200 p-10">Restoring Script Writer…</div></main>;
  if(!workspaceAllowed)return <main className="brutal-page min-h-[calc(100vh-82px)] p-6"><div className="mx-auto max-w-3xl brutal-card p-8"><h1 className="text-3xl font-black">Creator workspace required</h1><p className="mt-3">AI Script Writer is available only inside your private Creator workspace.</p></div></main>;

  const exhausted=usage&&Number(usage.remaining)<=0;
  return <main className="brutal-page min-h-[calc(100vh-82px)] p-4 sm:p-6 md:p-8"><div className="mx-auto max-w-6xl">
    <header className="flex flex-col gap-5 border-b-2 border-zinc-900 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="brutal-overline">Creator workspace</p><h1 className="mt-2 flex items-center gap-3 text-4xl font-black"><Sparkles className="text-yellow-500"/> AI Script Writer</h1><p className="mt-2 max-w-2xl text-zinc-600">Turn campaign briefs into structured creator scripts, then edit, compare, and save your preferred variation.</p></div>{exhausted?<button disabled className="brutal-button opacity-50">Monthly limit reached</button>:<Link to="/creator/scripts/new" className="brutal-button inline-flex items-center gap-2"><Plus size={19}/> Create Script</Link>}</header>
    {error&&<div role="alert" className="mt-5 border-2 border-red-700 bg-red-50 p-4 text-red-800">{error}<button type="button" onClick={()=>load()} className="ml-3 font-black underline">Retry</button></div>}
    <div className="mt-7"><Usage usage={usage}/></div>
    <section className="mt-8"><div><p className="brutal-overline">Library</p><h2 className="mt-2 text-2xl font-black">Saved script projects</h2></div>
      {loading?<div className="mt-5 grid gap-5 md:grid-cols-2">{[1,2,3,4].map(item=><div key={item} className="h-52 animate-pulse border-2 border-zinc-900 bg-zinc-200"/>)}</div>
        :!projects.length?<div className="brutal-card mt-5 p-10 text-center"><FilePenLine className="mx-auto" size={38}/><h3 className="mt-4 text-2xl font-black">No script projects yet.</h3><p className="mt-2 text-zinc-600">Create your first brief and generate up to three script directions.</p>{!exhausted&&<Link to="/creator/scripts/new" className="brutal-button mt-6 inline-flex">Create Script</Link>}</div>
        :<div className="mt-5 grid gap-5 md:grid-cols-2">{projects.map(project=><article key={project.id} className="brutal-card flex flex-col p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="brutal-overline">{project.contentFormat||"SCRIPT"}</p><h3 className="mt-2 break-words text-xl font-black">{project.title}</h3></div><span className="border border-zinc-900 bg-emerald-100 px-2 py-1 text-xs font-black">{project.status||"READY"}</span></div><dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-zinc-500">Brand</dt><dd className="mt-1 font-bold">{project.brandName||"Independent"}</dd></div><div><dt className="text-zinc-500">Language</dt><dd className="mt-1 font-bold">{project.language||"English"}</dd></div><div><dt className="text-zinc-500">Variations</dt><dd className="mt-1 font-bold">{project.variationCount??0}</dd></div><div><dt className="text-zinc-500">Updated</dt><dd className="mt-1 font-bold">{project.updatedAt?new Date(project.updatedAt).toLocaleDateString():"-"}</dd></div></dl><div className="mt-auto flex flex-wrap gap-3 border-t-2 border-zinc-900 pt-4"><Link to={`/creator/scripts/${project.id}`} className="brutal-button px-4 py-2">Open</Link><button type="button" disabled={deleting===project.id} onClick={()=>remove(project)} className="flex items-center gap-2 border-2 border-red-700 px-4 py-2 font-black text-red-700 disabled:opacity-50"><Trash2 size={17}/>{deleting===project.id?"Deleting…":"Delete"}</button></div></article>)}</div>}
    </section>
  </div></main>;
}
