import {useEffect,useState} from "react";
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

  return <div className="border-2 border-zinc-900 bg-emerald-100 px-4 py-2 text-sm" aria-live="polite">
    <span className="font-bold text-zinc-600">Delivered Auto-DMs</span>
    <strong className="ml-2 font-mono text-base text-zinc-900">{error?"—":count==null?"…":count.toLocaleString()}</strong>
  </div>;
}
