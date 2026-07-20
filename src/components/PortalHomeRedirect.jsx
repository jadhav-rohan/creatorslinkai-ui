import {Navigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

export default function PortalHomeRedirect(){
 const {isAuthenticated,activePersona}=useAuth();
 if(!isAuthenticated)return <Navigate to="/login" replace/>;
 return <Navigate to={activePersona==="CREATOR"?"/creator/dashboard":"/brand/discovery"} replace/>;
}
