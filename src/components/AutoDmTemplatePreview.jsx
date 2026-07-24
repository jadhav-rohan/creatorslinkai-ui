import {useState} from "react";
import {ChevronDown,ChevronUp,ExternalLink} from "lucide-react";

export default function AutoDmTemplatePreview({elements=[],collapsible=false}){
  const [open,setOpen]=useState(!collapsible);
  return <div className="mt-4">
    {collapsible&&<button type="button" onClick={()=>setOpen(value=>!value)} aria-expanded={open} className="flex w-full items-center justify-between border-2 border-zinc-900 bg-yellow-100 px-4 py-3 text-left font-black"><span>Preview carousel ({elements.length})</span>{open?<ChevronUp size={19}/>:<ChevronDown size={19}/>}</button>}
    {open&&<div className={`${collapsible?"border-x-2 border-b-2 border-zinc-900 p-4":"border-2 border-zinc-900 bg-zinc-50 p-4"}`}>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x" aria-label="Approximate Instagram generic template preview">{elements.map((element,index)=><article key={element.id||index} className="min-w-[240px] max-w-[280px] flex-1 snap-start overflow-hidden border-2 border-zinc-900 bg-white">
        {element.imageUrl&&<img src={element.imageUrl} alt="" loading="lazy" className="h-36 w-full border-b-2 border-zinc-900 object-cover"/>}
        <div className="p-4"><p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Element {index+1}</p><h5 className="mt-1 break-words text-lg font-black">{element.title||"Untitled element"}</h5>{element.subtitle&&<p className="mt-2 break-words text-sm text-zinc-600">{element.subtitle}</p>}{element.defaultActionUrl&&<p className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-600"><ExternalLink size={13}/> Card opens a link</p>}</div>
        {!!element.buttons?.length&&<div className="border-t-2 border-zinc-900">{element.buttons.slice(0,3).map((button,buttonIndex)=><div key={button.id||buttonIndex} className="border-b border-zinc-300 px-3 py-2 text-center text-sm font-black last:border-b-0">{button.title||"Untitled button"}</div>)}</div>}
      </article>)}</div>
      <p className="mt-2 text-xs text-zinc-600"><strong>Approximate preview:</strong> Instagram controls the final rendering. Generic templates are unavailable on Instagram desktop according to Meta.</p>
    </div>}
  </div>;
}
