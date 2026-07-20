import {createContext,useCallback,useContext,useEffect,useRef,useState} from "react";
import {AlertTriangle,Info,X} from "lucide-react";

const Context=createContext(null);
const destructivePattern=/\b(delete|remove|disconnect|revoke|decline|cancel|discard|transfer)\b/i;

export function ThemedDialogProvider({children}){
 const [dialog,setDialog]=useState(null),resolver=useRef(null);
 const close=useCallback(value=>{setDialog(null);const resolve=resolver.current;resolver.current=null;resolve?.(value)},[]);
 const open=useCallback(config=>new Promise(resolve=>{resolver.current?.(false);resolver.current=resolve;setDialog(config)}),[]);
 const confirm=useCallback((message,options={})=>open({kind:"confirm",message,title:options.title||"Please confirm",confirmLabel:options.confirmLabel||"Confirm",destructive:options.destructive??destructivePattern.test(message)}),[open]);
 const alert=useCallback((message,options={})=>open({kind:"alert",message,title:options.title||"Notification",confirmLabel:options.confirmLabel||"OK",destructive:false}),[open]);
 const prompt=useCallback((message,options={})=>open({kind:"prompt",message,title:options.title||"Confirmation required",confirmLabel:options.confirmLabel||"Continue",destructive:options.destructive??true,placeholder:options.placeholder||"",initialValue:options.initialValue||""}),[open]);
 useEffect(()=>()=>resolver.current?.(false),[]);
 return <Context.Provider value={{confirm,alert,prompt}}>{children}{dialog&&<ThemedDialog dialog={dialog} close={close}/>}</Context.Provider>;
}

function ThemedDialog({dialog,close}){
 const [value,setValue]=useState(dialog.initialValue||"");
 useEffect(()=>{const key=event=>{if(event.key==="Escape")close(dialog.kind==="prompt"?null:false)};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[close,dialog.kind]);
 const Icon=dialog.destructive?AlertTriangle:Info;
 return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-[2px]" onMouseDown={event=>{if(event.target===event.currentTarget)close(dialog.kind==="prompt"?null:false)}}><section role="alertdialog" aria-modal="true" aria-labelledby="themed-dialog-title" aria-describedby="themed-dialog-message" className="w-full max-w-md border-2 border-zinc-900 bg-white p-6 text-zinc-900 shadow-[8px_8px_0_#18181b]"><div className="flex items-start gap-4"><span className={`flex h-11 w-11 shrink-0 items-center justify-center border-2 border-zinc-900 ${dialog.destructive?"bg-red-200":"bg-yellow-300"}`}><Icon size={22}/></span><div className="min-w-0 flex-1"><h2 id="themed-dialog-title" className="text-xl font-black">{dialog.title}</h2><p id="themed-dialog-message" className="mt-2 whitespace-pre-wrap text-sm font-medium text-zinc-600">{dialog.message}</p></div><button type="button" onClick={()=>close(dialog.kind==="prompt"?null:false)} aria-label="Close dialog" className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-transparent hover:border-zinc-900"><X size={19}/></button></div>{dialog.kind==="prompt"&&<input autoFocus value={value} onChange={event=>setValue(event.target.value)} placeholder={dialog.placeholder} className="brutal-field mt-5 w-full"/>}<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{dialog.kind!=="alert"&&<button type="button" onClick={()=>close(dialog.kind==="prompt"?null:false)} className="min-h-11 border-2 border-zinc-900 bg-white px-5 py-2 text-sm font-black">Cancel</button>}<button autoFocus={dialog.kind!=="prompt"} type="button" onClick={()=>close(dialog.kind==="prompt"?value:true)} className={`min-h-11 border-2 border-zinc-900 px-5 py-2 text-sm font-black shadow-[3px_3px_0_#18181b] ${dialog.destructive?"bg-red-300":"bg-yellow-300"}`}>{dialog.confirmLabel}</button></div></section></div>;
}

export function useThemedDialog(){const value=useContext(Context);if(!value)throw new Error("useThemedDialog must be used within ThemedDialogProvider");return value}
