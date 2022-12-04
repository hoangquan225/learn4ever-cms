import { lazy } from "react";

const route = { 
    path: "/",
    label: "",
    exact : false, 
    public : true, 
    component: lazy(() => import(".")),
}; 

export default route;