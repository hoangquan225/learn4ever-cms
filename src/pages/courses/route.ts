import { lazy } from "react";

const route = { 
    path: "/COURSES",
    label: "khóa học",
    exact : true, 
    public : true, 
    component: lazy(() => import(".")),
}; 

export default route;