import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ permittedRole }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const user = JSON.parse(localStorage.getItem("user"));

  // If the user is not logged in
  if (!isLoggedIn || !user) {
    console.log("PrivateRoute: user is not logged in");
    return <Navigate to={"/login"} replace />;
  }

  // If there is a required role, but the user does not have the required role
  if( permittedRole && user.role !== permittedRole) {
     console.log("PrivateRoute: user is not permitted to access this route");
    return <Navigate to={'/unauthorized'} replace/>
  }

  // If the user is logged in and has the required role
  return <Outlet />;
};

export default PrivateRoute;
