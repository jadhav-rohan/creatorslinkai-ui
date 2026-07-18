import {useState} from "react";
import {NavLink,Outlet} from "react-router-dom";
import {BarChart3,FileImage,FileText,LayoutDashboard,List,LogOut,Menu,MessageCircle,Search,X} from "lucide-react";
import {useAuth} from "../context/AuthContext";

const creatorLinks=[
  ["Dashboard","/creator/dashboard",LayoutDashboard],
  ["Media Kit","/creator/media-kit",FileImage],
  ["Invoices","/creator/invoices",FileText],
  ["Auto DM","/creator/auto-dm",MessageCircle],
];
const brandLinks=[
  ["Discovery","/brand/discovery",Search],
  ["Lists","/brand/lists",List],
  ["Campaigns","/brand/campaigns",FileText],
  ["Analytics","/brand/analytics",BarChart3],
];

export default function PortalShell({persona}){
  const {email,workspaceType,personas,logout}=useAuth();
  const [open,setOpen]=useState(false);
  const creator=persona==="CREATOR";
  const links=creator?creatorLinks:brandLinks;
  const name=email?.split("@")[0]||"Creator";

  return <div className="min-h-screen bg-bg-deep text-text-primary lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(82vw,280px)] flex-col border-r-2 border-zinc-900 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:translate-x-0 ${open?"translate-x-0":"-translate-x-full"}`} aria-label={`${persona} portal navigation`}>
      <div className="flex min-h-[82px] items-center justify-between border-b-2 border-zinc-900 px-5">
        <div><strong className="text-lg font-black tracking-tight">CreatorLinksAI</strong><span className="mt-2 block w-fit rounded-full border border-zinc-900 bg-emerald-200 px-3 py-1 text-[11px] font-black uppercase">{creator?"CREATOR":workspaceType||"BRAND"}</span></div>
        <button type="button" onClick={()=>setOpen(false)} aria-label="Close navigation" className="flex h-11 w-11 items-center justify-center lg:hidden"><X size={22}/></button>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {links.map(([label,to,Icon])=><NavLink key={to} to={to} onClick={()=>setOpen(false)} className={({isActive})=>`flex min-h-12 items-center gap-3 border-2 px-4 py-3 font-black transition-transform ${isActive?"border-zinc-900 bg-yellow-300 shadow-[4px_4px_0_#18181b]":"border-transparent bg-white hover:border-zinc-900 hover:bg-zinc-100"}`}><Icon size={19} strokeWidth={2.2}/><span>{label}</span></NavLink>)}
      </nav>
      <div className="border-t-2 border-zinc-900 p-5">
        <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-zinc-900 bg-sky-200 font-black">{name.slice(0,1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-black">{name}</p><p className="truncate text-xs text-zinc-500">{email}</p></div></div>
        {personas.length>1&&<NavLink to={creator?"/brand/login":"/creator/login"} state={{switching:true}} className="mt-4 flex items-center text-xs font-bold underline">Switch portal</NavLink>}
        <button onClick={logout} className="mt-4 flex min-h-11 items-center gap-2 font-black text-red-600"><LogOut size={17}/>Sign Out</button>
      </div>
    </aside>
    {open&&<button type="button" aria-label="Close navigation overlay" onClick={()=>setOpen(false)} className="fixed inset-0 z-40 min-h-0 bg-black/45 lg:hidden"/>}
    <div className="min-w-0">
      <header className="sticky top-0 z-30 flex min-h-[82px] items-center gap-4 border-b-2 border-zinc-900 bg-white px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={()=>setOpen(true)} aria-label="Open navigation" aria-expanded={open} className="flex h-11 w-11 items-center justify-center border-2 border-zinc-900 bg-yellow-300 lg:hidden"><Menu size={22}/></button>
        <div><p className="text-xs text-zinc-500">Welcome back,</p><p className="font-black">{name}</p></div>
      </header>
      <Outlet/>
    </div>
  </div>
}
