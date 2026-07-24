import {Navigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {featureFlags} from "../config/featureFlags";

export default function PortalHomeRedirect(){
 const {isAuthenticated,activePersona,restoringSession,hasDisabledBrandSession}=useAuth();
 if(restoringSession)return <main className="brutal-page flex min-h-screen items-center justify-center p-6"><p className="brutal-card p-8 font-black">Restoring your session…</p></main>;
 if(hasDisabledBrandSession&&!featureFlags.brandPortalEnabled)return <Navigate to="/brand/coming-soon" replace/>;
 if(!isAuthenticated)return <Navigate to="/login" replace/>;
 return <Navigate to={activePersona==="CREATOR"?"/creator/dashboard":featureFlags.brandPortalEnabled?"/brand/discovery":"/brand/coming-soon"} replace/>;
}
