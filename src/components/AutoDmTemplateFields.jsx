import {ChevronDown,ChevronUp,Plus,Trash2} from "lucide-react";

let nextKey=0;
const clientKey=()=>`auto-dm-field-${Date.now()}-${nextKey++}`;

export const createTemplateButton=()=>({clientKey:clientKey(),type:"WEB_URL",title:"",url:""});
export const createTemplateElement=()=>({
  clientKey:clientKey(),
  title:"",
  subtitle:"",
  imageUrl:"",
  defaultActionUrl:"",
  buttons:[],
});

export function isHttpsUrl(value){
  try{return new URL(value).protocol==="https:"}catch{return false}
}

export function validateTemplate(elements){
  if(!Array.isArray(elements)||elements.length<1||elements.length>10)return "Generic templates require between 1 and 10 elements.";
  for(let index=0;index<elements.length;index++){
    const element=elements[index];
    const label=`Element ${index+1}`;
    if(!element.title.trim())return `${label} needs a title.`;
    if(element.title.trim().length>80)return `${label} title must be 80 characters or fewer.`;
    if(element.subtitle.trim().length>80)return `${label} subtitle must be 80 characters or fewer.`;
    if(element.imageUrl.trim()&&!isHttpsUrl(element.imageUrl.trim()))return `${label} image URL must be a valid HTTPS URL.`;
    if(element.defaultActionUrl.trim()&&!isHttpsUrl(element.defaultActionUrl.trim()))return `${label} default action URL must be a valid HTTPS URL.`;
    if(!Array.isArray(element.buttons)||element.buttons.length>3)return `${label} can have no more than three buttons.`;
    if(!element.subtitle.trim()&&!element.imageUrl.trim()&&!element.defaultActionUrl.trim()&&!element.buttons.length)return `${label} needs a subtitle, image, default action, or button in addition to its title.`;
    for(let buttonIndex=0;buttonIndex<element.buttons.length;buttonIndex++){
      const button=element.buttons[buttonIndex];
      const buttonLabel=`${label}, button ${buttonIndex+1}`;
      if(!["WEB_URL","POSTBACK"].includes(button.type))return `${buttonLabel} has an unsupported type.`;
      if(!button.title.trim())return `${buttonLabel} needs a title.`;
      if(button.title.trim().length>80)return `${buttonLabel} title must be 80 characters or fewer.`;
      if(button.type==="WEB_URL"&&!isHttpsUrl(button.url.trim()))return `${buttonLabel} requires a valid HTTPS URL.`;
    }
  }
  return "";
}

export function serializeTemplate(elements){
  return elements.map(element=>({
    title:element.title.trim(),
    ...(element.subtitle.trim()?{subtitle:element.subtitle.trim()}:{}),
    ...(element.imageUrl.trim()?{imageUrl:element.imageUrl.trim()}:{}),
    ...(element.defaultActionUrl.trim()?{defaultActionUrl:element.defaultActionUrl.trim()}:{}),
    buttons:element.buttons.map(button=>button.type==="WEB_URL"
      ?{type:"WEB_URL",title:button.title.trim(),url:button.url.trim()}
      :{type:"POSTBACK",title:button.title.trim()}),
  }));
}

function move(items,index,direction){
  const target=index+direction;
  if(target<0||target>=items.length)return items;
  const next=[...items];
  [next[index],next[target]]=[next[target],next[index]];
  return next;
}

export default function AutoDmTemplateFields({elements,onChange}){
  const updateElement=(index,patch)=>onChange(elements.map((element,current)=>current===index?{...element,...patch}:element));
  const updateButton=(elementIndex,buttonIndex,patch)=>updateElement(elementIndex,{
    buttons:elements[elementIndex].buttons.map((button,current)=>current===buttonIndex?{...button,...patch}:button),
  });
  return <div className="mt-6 space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h3 className="text-xl font-black">Template elements</h3><p className="mt-1 text-sm text-zinc-600">Add 1–10 carousel cards in the order recipients should see them.</p></div>
      <button type="button" disabled={elements.length>=10} onClick={()=>onChange([...elements,createTemplateElement()])} className="flex items-center gap-2 border-2 border-zinc-900 bg-sky-200 px-4 py-2 font-black disabled:cursor-not-allowed disabled:opacity-50"><Plus size={17}/> Add element</button>
    </div>
    {elements.map((element,index)=><section key={element.clientKey||element.id||index} className="border-2 border-zinc-900 bg-white p-4 sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-zinc-900 pb-3">
        <h4 className="text-lg font-black">Element {index+1}</h4>
        <div className="flex items-center gap-2">
          <button type="button" aria-label={`Move element ${index+1} up`} disabled={index===0} onClick={()=>onChange(move(elements,index,-1))} className="border-2 border-zinc-900 p-2 disabled:opacity-30"><ChevronUp size={17}/></button>
          <button type="button" aria-label={`Move element ${index+1} down`} disabled={index===elements.length-1} onClick={()=>onChange(move(elements,index,1))} className="border-2 border-zinc-900 p-2 disabled:opacity-30"><ChevronDown size={17}/></button>
          <button type="button" disabled={elements.length===1} onClick={()=>onChange(elements.filter((_,current)=>current!==index))} className="flex items-center gap-1 border-2 border-red-700 px-3 py-2 text-sm font-black text-red-800 disabled:opacity-30"><Trash2 size={16}/> Remove</button>
        </div>
      </header>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="font-bold">Title * <span className="font-normal text-zinc-500">({element.title.length}/80)</span><input maxLength={80} value={element.title} onChange={event=>updateElement(index,{title:event.target.value})} className="brutal-field mt-2 w-full"/></label>
        <label className="font-bold">Subtitle <span className="font-normal text-zinc-500">({element.subtitle.length}/80)</span><input maxLength={80} value={element.subtitle} onChange={event=>updateElement(index,{subtitle:event.target.value})} className="brutal-field mt-2 w-full"/></label>
        <label className="font-bold">Image URL (HTTPS)<input type="url" inputMode="url" placeholder="https://…" value={element.imageUrl} onChange={event=>updateElement(index,{imageUrl:event.target.value})} className="brutal-field mt-2 w-full"/></label>
        <label className="font-bold">Default action URL (HTTPS)<input type="url" inputMode="url" placeholder="https://…" value={element.defaultActionUrl} onChange={event=>updateElement(index,{defaultActionUrl:event.target.value})} className="brutal-field mt-2 w-full"/></label>
      </div>
      <div className="mt-5 border-t-2 border-zinc-900 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><h5 className="font-black">Buttons ({element.buttons.length}/3)</h5><button type="button" disabled={element.buttons.length>=3} onClick={()=>updateElement(index,{buttons:[...element.buttons,createTemplateButton()]})} className="flex items-center gap-1 border-2 border-zinc-900 px-3 py-2 text-sm font-black disabled:opacity-40"><Plus size={15}/> Add button</button></div>
        {!element.buttons.length&&<p className="mt-3 text-sm text-zinc-500">No buttons added.</p>}
        <div className="mt-3 space-y-3">{element.buttons.map((button,buttonIndex)=><div key={button.clientKey||button.id||buttonIndex} className="grid gap-3 border-2 border-zinc-300 bg-zinc-50 p-3 sm:grid-cols-[150px_1fr_auto]">
          <label className="font-bold">Type<select value={button.type} onChange={event=>updateButton(index,buttonIndex,{type:event.target.value,url:""})} className="brutal-field mt-1 w-full"><option value="WEB_URL">Web URL</option><option value="POSTBACK">Postback</option></select></label>
          <div className="grid gap-3 md:grid-cols-2"><label className="font-bold">Button title *<input maxLength={80} value={button.title} onChange={event=>updateButton(index,buttonIndex,{title:event.target.value})} className="brutal-field mt-1 w-full"/></label>{button.type==="WEB_URL"&&<label className="font-bold">HTTPS URL *<input type="url" inputMode="url" placeholder="https://…" value={button.url} onChange={event=>updateButton(index,buttonIndex,{url:event.target.value})} className="brutal-field mt-1 w-full"/></label>}</div>
          <div className="flex items-end gap-1"><button type="button" aria-label={`Move button ${buttonIndex+1} up`} disabled={buttonIndex===0} onClick={()=>updateElement(index,{buttons:move(element.buttons,buttonIndex,-1)})} className="border-2 border-zinc-900 p-2 disabled:opacity-30"><ChevronUp size={16}/></button><button type="button" aria-label={`Move button ${buttonIndex+1} down`} disabled={buttonIndex===element.buttons.length-1} onClick={()=>updateElement(index,{buttons:move(element.buttons,buttonIndex,1)})} className="border-2 border-zinc-900 p-2 disabled:opacity-30"><ChevronDown size={16}/></button><button type="button" aria-label={`Remove button ${buttonIndex+1}`} onClick={()=>updateElement(index,{buttons:element.buttons.filter((_,current)=>current!==buttonIndex)})} className="border-2 border-red-700 p-2 text-red-800"><Trash2 size={16}/></button></div>
        </div>)}</div>
      </div>
    </section>)}
  </div>;
}
