import React, { Children, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Roles } from "../../../constants/constant";
const OpenRoute = ({ children }) => {
  const { token, User } = useSelector((state) => state.Auth);

  if (token !== null) {
    return User.role === Roles.Admin ? (
      <Navigate to={"/admin/dashboard"} />
    ) : User.role === Roles.Student ? (
      <Navigate to={"/student/dashboard"} />
    ) : (
      <Navigate to={"/dashboard/overview"} />
    );
  }
  return children;
};

export default OpenRoute;
