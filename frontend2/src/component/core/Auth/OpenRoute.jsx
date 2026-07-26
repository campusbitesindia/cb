import React, { Children, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Roles } from "../../../constants/constant";
const OpenRoute = ({ children }) => {
  const { token, User } = useSelector((state) => state.Auth);

  // A token can exist for a "partial" user (phone verified, profile not yet
  // completed). In that case we let them stay on open routes like
  // /login or /register instead of bouncing them to a dashboard they can't use yet.
  if (token !== null && User && User.role) {
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
