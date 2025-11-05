import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/auth-context";

export function RouteProtection({
  children,
  allowedRoles = [],
  requireAuth = true,
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [mounted, setMounted] = useState(false);

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/campus/register",
    "/auth/callback",
    "/forgot-password",
    "/verify-email",
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    // If route doesn't require auth and it's a public route, allow access
    if (!requireAuth || isPublicRoute) {
      return;
    }

    // If user is not authenticated and route requires auth, redirect to login
    if (!isAuthenticated) {
      const currentPath = encodeURIComponent(pathname);
      navigate(`/login?redirect=${currentPath}`, { replace: true });
      return;
    }

    // Redirect campus partners away from student-only routes
    const studentOnlyRoutes = [
      "/profile",
      "/orders",
      "/quickbite",
      "/student/dashboard",
    ];
    if (
      user &&
      (user.role === "campus" || user.role === "canteen") &&
      studentOnlyRoutes.some((route) => pathname.startsWith(route))
    ) {
      navigate("/campus/dashboard", { replace: true });
      return;
    }

    // If user is authenticated but doesn't have required role
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      switch (user.role) {
        case "student":
          navigate("/student/dashboard", { replace: true });
          break;
        case "campus":
        case "canteen":
          navigate("/campus/dashboard", { replace: true });
          break;
        case "admin":
          navigate("/admin/dashboard", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
          break;
      }
      return;
    }

    // Additional check: redirect authenticated users away from auth pages
    if (
      isAuthenticated &&
      (pathname === "/login" || pathname === "/register")
    ) {
      switch (user?.role) {
        case "student":
          navigate("/student/dashboard", { replace: true });
          break;
        case "campus":
        case "canteen":
          navigate("/campus/dashboard/overview", { replace: true });
          break;
        case "admin":
          navigate("/admin/dashboard", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
          break;
      }
      return;
    }
  }, [
    isAuthenticated,
    user,
    pathname,
    navigate,
    mounted,
    isLoading,
    allowedRoles,
    requireAuth,
    isPublicRoute,
  ]);

  // Show loading while checking authentication
  if (isLoading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If route requires auth but user is not authenticated, show nothing (redirecting)
  if (requireAuth && !isAuthenticated && !isPublicRoute) {
    return null;
  }

  // If user doesn't have required role, show nothing (redirecting)
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

// Convenience components for role-based routes
export function StudentOnlyRoute({ children }) {
  return (
    <RouteProtection allowedRoles={["student"]}>{children}</RouteProtection>
  );
}

export function CampusOnlyRoute({ children }) {
  return (
    <RouteProtection allowedRoles={["campus", "canteen"]}>
      {children}
    </RouteProtection>
  );
}

export function AdminOnlyRoute({ children }) {
  return <RouteProtection allowedRoles={["admin"]}>{children}</RouteProtection>;
}
