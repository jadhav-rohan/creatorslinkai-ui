import {api} from "../api";import {creatorDashboardKey} from "../creatorDashboardTypes";
const cache=new Map(),key=(w,i)=>JSON.stringify(creatorDashboardKey(w,i));
export const creatorDashboardService={cached:(w,i)=>cache.get(key(w,i)),get:async(w,i,t,s)=>{const x=await api.getCreatorDashboard(w,i,t,{signal:s});cache.set(key(w,i),x);return x},invalidate:w=>{for(const k of cache.keys())if(JSON.parse(k)[1]===w)cache.delete(k)},clear:()=>cache.clear()};
