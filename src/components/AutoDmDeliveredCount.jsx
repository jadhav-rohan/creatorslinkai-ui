import {useEffect,useState} from "react";
import {Check} from "lucide-react";
import {api} from "../api";

export default function AutoDmDeliveredCount({igUserId,ruleId,token,logout}){
  const [count,setCount]=useState(null);
  const [error,setError]=useState(false);

  useEffect(()=>{
    let active=true;
    setCount(null);
    setError(false);
    api.getRuleLogs(igUserId,ruleId,token)
      .then(result=>{
        if(!active)return;
        const logs=Array.isArray(result)?result:[];
        setCount(logs.filter(log=>(log.deliveryStatus||log.status)==="SENT").length);
      })
      .catch(requestError=>{
        if(!active)return;
        if(requestError.status===401)logout();
        else setError(true);
      });
    return()=>{active=false};
  },[igUserId,logout,ruleId,token]);

  return <div className="inline-flex items-center gap-1.5 text-sm font-black text-emerald-700" aria-live="polite">
    <span>Delivered</span>
    <Check size={16} strokeWidth={3} aria-hidden="true"/>
    <strong className="font-mono text-zinc-900">{error?"—":count==null?"…":count.toLocaleString()}</strong>
  </div>;
}
