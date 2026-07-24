import {Navigate,useLocation} from "react-router-dom";
import {featureFlags} from "../config/featureFlags";

export default function BrandPortalRouteGuard({children}){
 const location=useLocation();
 if(!featureFlags.brandPortalEnabled){
  return <Navigate to="/brand/coming-soon" replace state={{from:location.pathname+location.search}}/>;
 }
 return children;
}
