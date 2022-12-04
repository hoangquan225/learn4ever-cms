import { lazy } from "react";

const route = { 
    path: "/CATEGORY",
    label: "danh mục",
    exact : true, 
    public : true, 
    component: lazy(() => import(".")),
}; 

export default route;