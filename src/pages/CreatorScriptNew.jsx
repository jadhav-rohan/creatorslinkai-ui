import {useEffect,useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {ArrowLeft,Sparkles,X} from "lucide-react";
import {api} from "../api";
import {useAuth} from "../context/AuthContext";
import {useWorkspace} from "../context/WorkspaceContext";
import {SCRIPT_FORMATS,TONE_PRESETS,initialScriptDraft,scriptErrorMessage,serializeScriptDraft,validateScriptDraft} from "../scriptWriter";

const field="brutal-field mt-2 w-full";
function ErrorText({children}){return children?<span className="mt-1 block text-sm font-bold text-red-700">{children}</span>:null}

function TagInput({label,items,onChange,maxItems,maxLength,placeholder}){
  const [input,setInput]=useState("");
  const [error,setError]=useState("");
  function add(){
    const value=input.trim();
    if(!value)return;
    if(value.length>maxLength){setError(`Each item must be ${maxLength} characters or fewer.`);return}
    if(items.length>=maxItems){setError(`You can add up to ${maxItems} items.`);return}
    if(items.some(item=>item.toLowerCase()===value.toLowerCase())){setError("That item is already included.");return}
    onChange([...items,value]);setInput("");setError("");
  }
  return <label className="block font-bold">{label}<div className="mt-2 flex gap-2"><input value={input} maxLength={maxLength} placeholder={placeholder} onChange={event=>setInput(event.target.value)} onKeyDown={event=>{if(event.key==="Enter"||event.key===","){event.preventDefault();add()}}} className="brutal-field min-w-0 flex-1"/><button type="button" onClick={add} disabled={items.length>=maxItems} className="border-2 border-zinc-900 bg-white px-4 font-black disabled:opacity-40">Add</button></div><span className="mt-1 block text-xs font-normal text-zinc-500">Press Enter to add · {items.length}/{maxItems}</span>{error&&<span className="mt-1 block text-sm text-red-700">{error}</span>}<div className="mt-3 flex flex-wrap gap-2">{items.map(item=><span key={item} className="inline-flex max-w-full items-center border-2 border-zinc-900 bg-yellow-100 text-sm"><span className="break-words px-3 py-2">{item}</span><button type="button" onClick={()=>onChange(items.filter(value=>value!==item))} aria-label={`Remove ${item}`} className="self-stretch border-l-2 border-zinc-900 px-2"><X size={15}/></button></span>)}</div></label>;
}

export default function CreatorScriptNew(){
  const {token,logout}=useAuth();
  const {selectedWorkspace,selectedWorkspaceId:workspaceId,loading:workspaceLoading}=useWorkspace();
  const navigate=useNavigate();
  const [draft,setDraft]=useState(initialScriptDraft);
  const [usage,setUsage]=useState(null);
  const [errors,setErrors]=useState({});
  const [apiError,setApiError]=useState("");
  const [generating,setGenerating]=useState(false);
  const workspaceAllowed=["CREATOR","PERSONAL"].includes(selectedWorkspace?.type);
  const set=(key,value)=>setDraft(current=>({...current,[key]:value}));

  useEffect(()=>{
    if(!workspaceId||!workspaceAllowed)return;
    const controller=new AbortController();
    api.getCreatorScriptUsage(workspaceId,token,{signal:controller.signal}).then(setUsage).catch(error=>{if(error.name==="AbortError")return;if(error.status===401)logout();else setApiError(scriptErrorMessage(error))});
    return()=>controller.abort();
  },[workspaceId,workspaceAllowed,token,logout]);
  useEffect(()=>{
    if(!generating)return;
    const warn=event=>{event.preventDefault();event.returnValue=""};
    const blockLinks=event=>{if(event.target.closest?.("a")){event.preventDefault();event.stopPropagation();setApiError("Script generation is in progress. Please wait for it to finish before leaving this page.")}};
    window.addEventListener("beforeunload",warn);
    document.addEventListener("click",blockLinks,true);
    return()=>{window.removeEventListener("beforeunload",warn);document.removeEventListener("click",blockLinks,true)};
  },[generating]);

  async function submit(event){
    event.preventDefault();
    if(generating||!workspaceAllowed||Number(usage?.remaining)<=0)return;
    const next=validateScriptDraft(draft);
    setErrors(next);
    if(Object.keys(next).length)return;
    setGenerating(true);setApiError("");
    try{
      const project=await api.generateCreatorScript(workspaceId,serializeScriptDraft(draft),token);
      navigate(`/creator/scripts/${project.id}`,{replace:true,state:{notice:"Your script variations are ready."}});
    }catch(error){
      if(error.status===401)logout();
      else{
        setApiError(scriptErrorMessage(error));
        if(error.status===429)api.getCreatorScriptUsage(workspaceId,token).then(setUsage).catch(()=>{});
      }
    }finally{setGenerating(false)}
  }

  if(workspaceLoading)return <main className="brutal-page min-h-[calc(100vh-82px)] p-6"><div className="mx-auto max-w-5xl animate-pulse border-2 border-zinc-900 bg-zinc-200 p-10">Loading Script Writer…</div></main>;
  if(!workspaceAllowed)return <main className="brutal-page min-h-[calc(100vh-82px)] p-6"><div className="mx-auto max-w-3xl brutal-card p-8"><h1 className="text-3xl font-black">Creator workspace required</h1></div></main>;
  const exhausted=usage&&Number(usage.remaining)<=0;
  return <main className="brutal-page min-h-[calc(100vh-82px)] p-4 sm:p-6 md:p-8"><div className="mx-auto max-w-5xl">
    <Link to="/creator/scripts" className="inline-flex items-center gap-2 font-black"><ArrowLeft size={18}/> Script library</Link>
    <header className="mt-5 border-b-2 border-zinc-900 pb-6"><p className="brutal-overline">AI Script Writer</p><h1 className="mt-2 text-4xl font-black">Create a script</h1><p className="mt-2 max-w-2xl text-zinc-600">Give the AI enough campaign context to produce practical, editable scene directions.</p></header>
    {apiError&&<p role="alert" className="mt-5 border-2 border-red-700 bg-red-50 p-4 text-red-800">{apiError}</p>}
    {exhausted&&<p className="mt-5 border-2 border-zinc-900 bg-amber-100 p-4 font-bold">You have reached your monthly AI script generation limit. Your allowance resets {usage.resetsAt?new Date(usage.resetsAt).toLocaleDateString():"next month"}.</p>}
    <form onSubmit={submit} className="mt-7 space-y-7">
      <section className="brutal-card p-5 sm:p-7"><h2 className="text-2xl font-black">Brief</h2><div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="font-bold sm:col-span-2">Project title *<input value={draft.title} onChange={event=>set("title",event.target.value)} maxLength={160} className={field}/><ErrorText>{errors.title}</ErrorText></label>
        <label className="font-bold sm:col-span-2">Campaign brief *<textarea value={draft.campaignBrief} onChange={event=>set("campaignBrief",event.target.value)} maxLength={12000} rows={7} className={field}/><span className="mt-1 block text-right text-xs font-normal text-zinc-500">{draft.campaignBrief.length}/12,000</span><ErrorText>{errors.campaignBrief}</ErrorText></label>
        <label className="font-bold">Brand name<input value={draft.brandName} onChange={event=>set("brandName",event.target.value)} maxLength={160} className={field}/><ErrorText>{errors.brandName}</ErrorText></label>
        <label className="font-bold">Target audience<textarea value={draft.targetAudience} onChange={event=>set("targetAudience",event.target.value)} maxLength={4000} rows={4} className={field}/><ErrorText>{errors.targetAudience}</ErrorText></label>
        <label className="font-bold sm:col-span-2">Product description<textarea value={draft.productDescription} onChange={event=>set("productDescription",event.target.value)} maxLength={6000} rows={5} className={field}/><ErrorText>{errors.productDescription}</ErrorText></label>
      </div></section>
      <section className="brutal-card p-5 sm:p-7"><h2 className="text-2xl font-black">Format and voice</h2><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <label className="font-bold">Content format *<select value={draft.contentFormat} onChange={event=>set("contentFormat",event.target.value)} className={field}>{SCRIPT_FORMATS.map(format=><option key={format}>{format}</option>)}</select><ErrorText>{errors.contentFormat}</ErrorText></label>
        <label className="font-bold">Duration in seconds<input type="number" min="5" max="3600" value={draft.durationSeconds} onChange={event=>set("durationSeconds",event.target.value)} className={field}/><ErrorText>{errors.durationSeconds}</ErrorText></label>
        <label className="font-bold">Variations<select value={draft.variationCount} onChange={event=>set("variationCount",event.target.value)} className={field}><option value="1">1</option><option value="2">2</option><option value="3">3</option></select><ErrorText>{errors.variationCount}</ErrorText></label>
        <label className="font-bold">Tone<input value={draft.tone} onChange={event=>set("tone",event.target.value)} list="script-tones" maxLength={80} className={field}/><datalist id="script-tones">{TONE_PRESETS.map(tone=><option value={tone} key={tone}/>)}</datalist><ErrorText>{errors.tone}</ErrorText></label>
        <label className="font-bold">Language<input value={draft.language} onChange={event=>set("language",event.target.value)} maxLength={80} className={field}/><ErrorText>{errors.language}</ErrorText></label>
        <label className="font-bold sm:col-span-2 lg:col-span-3">Requested CTA<textarea value={draft.requestedCta} onChange={event=>set("requestedCta",event.target.value)} maxLength={1000} rows={3} className={field}/><ErrorText>{errors.requestedCta}</ErrorText></label>
      </div></section>
      <section className="brutal-card space-y-6 p-5 sm:p-7"><h2 className="text-2xl font-black">Creative guardrails</h2><TagInput label="Key points" items={draft.keyPoints} onChange={value=>set("keyPoints",value)} maxItems={20} maxLength={500} placeholder="A key message to include"/><TagInput label="Mandatory points" items={draft.mandatoryPoints} onChange={value=>set("mandatoryPoints",value)} maxItems={20} maxLength={500} placeholder="A required claim or disclosure"/><TagInput label="Terms to avoid" items={draft.avoidTerms} onChange={value=>set("avoidTerms",value)} maxItems={20} maxLength={200} placeholder="A word or phrase to avoid"/></section>
      <section className="sticky bottom-0 z-20 border-2 border-zinc-900 bg-white p-4 shadow-[5px_5px_0_#18181b]"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-2xl text-sm"><p className="font-bold">Your brief is sent to our AI provider to generate script suggestions. Review all claims and disclosures before publishing.</p><p className="mt-1 text-zinc-600">AI-generated content may be inaccurate. You are responsible for validating product claims, advertising disclosures and brand requirements.</p></div><button disabled={generating||exhausted||!usage} className="brutal-button flex shrink-0 items-center justify-center gap-2 disabled:opacity-50"><Sparkles size={18}/>{generating?"Generating… this may take up to 45 seconds":"Generate scripts"}</button></div></section>
    </form>
  </div></main>;
}
