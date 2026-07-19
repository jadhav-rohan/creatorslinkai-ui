import {Navigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

export default function BrandCollaborationRoute({children}){
 const {activePersona}=useAuth();
 return activePersona==="CREATOR"?<Navigate to="/creator/dashboard" replace/>:children;
}
