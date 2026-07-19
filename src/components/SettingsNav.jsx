import {Link} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {useWorkspaceAuthorization} from "../context/WorkspaceAuthorizationContext";

export default function SettingsNav(){
 const {activePersona}=useAuth(),{hasPermission}=useWorkspaceAuthorization();
 const links=activePersona==="CREATOR"?[["Your profile","/profile",null]]:[["Your profile","/profile",null],["Workspace profile","/settings/workspace","WORKSPACE_VIEW"],["Members","/settings/members","MEMBER_VIEW"],["Your invitations","/invitations",null],["Outreach templates","/settings/outreach-templates","OUTREACH_TEMPLATE_VIEW"]];
 return <nav aria-label="Settings" className="flex flex-wrap gap-2">{links.filter(([, ,permission])=>!permission||hasPermission(permission)).map(([label,to])=><Link key={to} className="rounded-full border border-panel-border bg-panel px-4 py-2 text-sm" to={to}>{label}</Link>)}</nav>;
}
