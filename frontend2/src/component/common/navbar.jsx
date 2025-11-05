import React from "react";
import { memo, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOutUser } from "../../services/operations/Auth";
import {
  Menu,
  ShoppingCart,
  User,
  X,
  Bell,
  Home,
  UtensilsCrossed,
  Package,
  LogOut,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";

import GlobalSearchDropdown from "./global-search-dropdown";
import { ThemeToggle } from "./theme-toggle";
import clickOutside from "../../hooks/clickOutside";
import { Download } from "lucide-react";

// Custom UI Components
const Button = ({
  variant = "default",
  size = "default",
  className = "",
  children,
  onClick,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
  };

  const sizes = {
    default: "h-10 py-2 px-4",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

// Fixed Dropdown Menu Components
const DropdownMenu = ({ children, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  clickOutside(menuRef, () => setIsOpen(false));

  // Clone children and pass props properly
  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={menuRef}
    >
      {React.Children.map(children, (child) => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, {
            ...child.props,
            onClick: () => setIsOpen(!isOpen),
          });
        }
        if (child.type === DropdownMenuContent && isOpen) {
          return React.cloneElement(child, {
            ...child.props,
            onClose: () => setIsOpen(false),
          });
        }
        return null;
      })}
    </div>
  );
};

const DropdownMenuTrigger = ({ children, onClick }) => (
  <div onClick={onClick} className="cursor-pointer">
    {children}
  </div>
);

const DropdownMenuContent = ({
  align = "end",
  className = "",
  children,
  onClose,
}) => {
  return (
    <div
      className={`dropdown-content absolute ${
        align === "end" ? "right-0" : "left-0"
      } mt-2 z-50 ${className}`}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick, className = "" }) => (
  <div onClick={onClick} className={`cursor-pointer ${className}`}>
    {children}
  </div>
);

const DropdownMenuSeparator = ({ className = "" }) => (
  <div className={`h-px bg-gray-200 dark:bg-gray-700 ${className}`} />
);

// Fixed Sheet Components for Mobile Menu
const Sheet = ({ open, onOpenChange, children }) => {
  // Filter children properly
  const triggerChild = React.Children.toArray(children).find(
    (child) => child.type === SheetTrigger
  );
  const contentChild = React.Children.toArray(children).find(
    (child) => child.type === SheetContent
  );

  return (
    <>
      {triggerChild &&
        React.cloneElement(triggerChild, {
          ...triggerChild.props,
          onClick: () => onOpenChange(true),
        })}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          {contentChild}
        </div>
      )}
    </>
  );
};

const SheetTrigger = ({ children, className, onClick }) => (
  <div className={className} onClick={onClick}>
    {children}
  </div>
);

const SheetContent = ({ side = "right", className = "", children }) => (
  <motion.div
    initial={{ x: side === "right" ? "100%" : "-100%" }}
    animate={{ x: 0 }}
    exit={{ x: side === "right" ? "100%" : "-100%" }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className={`fixed ${
      side === "right" ? "right-0" : "left-0"
    } top-0 h-full z-50 ${className}`}
  >
    {children}
  </motion.div>
);

const Logo = ({ href = "/" }) => (
  <Link to={href}>
    <div className="flex items-center space-x-3">
      <img
        src="/logo.png"
        alt="Campus Bites Logo"
        width={40}
        height={40}
        className="transition-all duration-300 group-hover:brightness-110"
      />
      <div className="flex flex-col min-w-0 ml-2">
        <span className="truncate text-base md:text-xl font-bold text-gray-900 dark:text-white tracking-wide group-hover:text-red-500 transition-colors duration-300">
          Campus Bites
        </span>
        <span className="hidden md:block truncate text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium tracking-wider">
          Fast • Fresh • Delicious
        </span>
      </div>
    </div>
  </Link>
);

const ProfileAvatar = ({ src, name, onClick }) => (
  <Button
    variant="ghost"
    className="relative p-0 rounded-full h-10 w-10"
    onClick={onClick}
  >
    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
      <img
        src={src || "/placeholder-user.jpg"}
        alt={name || "User"}
        className="w-full h-full object-cover rounded-full"
        onError={(e) => {
          e.target.src = "/placeholder-user.jpg";
        }}
      />
    </div>
    <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
  </Button>
);

const getNavItems = (role) => {
  if (role === "student") {
    return [
      { name: "Home", href: "/student/dashboard", icon: Home },
      { name: "QuickBites", href: "/student/quickbite", icon: UtensilsCrossed },
      { name: "Orders", href: "/student/orders", icon: Package },
    ];
  }
  return [];
};

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.Auth);
  const { cart } = useSelector((state) => state.Cart);
  const { Profile: userProfile } = useSelector((state) => state.Profile);

  const isAuthenticated = Boolean(token);
  const displayUser = userProfile;
  const profileImageSrc = displayUser?.profileImage;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationListShow, setNotificationList] = useState(false);

  const pathname = location.pathname;
  const navItems = getNavItems(displayUser?.role);
  const cartItemsCount =
    cart?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  // Fixed hideNavbar logic
  const hideNavbar =
    pathname === "/campus/register" ||
    pathname === "/campus/dashboard" ||
    (["campus", "canteen"].includes(displayUser?.role) &&
      pathname !== "/profile");

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle navigation with proper SPA routing
  const handleNavigation = (href) => {
    navigate(href);
    setIsMenuOpen(false);
  };

  // Logout function
  const handleLogout = () => {
    dispatch(LogOutUser(dispatch, navigate));
  };

  if (hideNavbar) {
    return (
      <header className="fixed top-0 z-50 w-full bg-[#0a192f] shadow-lg border-b border-gray-200/50 dark:border-white/10 transition-all duration-500">
        <div className="w-full px-4">
          <div className="flex h-20 items-center justify-between">
            <Logo
              href={
                pathname === "/campus/dashboard"
                  ? "/campus/dashboard"
                  : "/dashboard/overview"
              }
            />

            {pathname === "/campus/dashboard" && (
              <div className="flex items-center space-x-4">
                {/* Notification Icon */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNotificationList(!notificationListShow)}
                    className="relative rounded-full h-10 w-10 bg-gray-100/70 dark:bg-gray-900/50 border border-gray-300/50 dark:border-white/10 hover:bg-gray-200/70 dark:hover:bg-gray-800/70 transition-colors duration-300"
                  >
                    <Bell className="h-5 w-5 text-gray-700 dark:text-white" />
                    {notificationCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs font-bold rounded-full border-2 border-white dark:border-black/50">
                        {notificationCount}
                      </Badge>
                    )}
                  </Button>
                </div>

                {/* Profile Dropdown */}
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <ProfileAvatar
                        src={profileImageSrc}
                        name={displayUser?.name}
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-64 bg-white/90 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-white/10 shadow-2xl rounded-2xl mt-2 p-2 text-gray-900 dark:text-white"
                    >
                      <div className="p-2 border-b border-gray-200/50 dark:border-white/10 ">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
                            <img
                              src={profileImageSrc || "/placeholder-user.jpg"}
                              alt={displayUser?.name || "User"}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.target.src = "/placeholder-user.jpg";
                              }}
                            />
                          </div>
                          <div className="flex flex-col">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {displayUser?.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[180px]">
                              {displayUser?.email}
                            </p>
                            {displayUser?.role && (
                              <p className="text-xs text-red-500 dark:text-red-400 capitalize">
                                {displayUser.role}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <DropdownMenuItem
                        onClick={() =>
                          handleNavigation(
                            displayUser?.role === "campus" ||
                              displayUser?.role === "canteen"
                              ? "/campus/dashboard?tab=profile"
                              : "/profile"
                          )
                        }
                        className="mt-2 focus:bg-gray-100 dark:focus:bg-gray-800/80 focus:text-gray-900 dark:focus:text-white"
                      >
                        <div className="flex items-center space-x-3 w-full p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white transition-all duration-200">
                          <User className="h-5 w-5" />
                          <span>View Profile</span>
                        </div>
                      </DropdownMenuItem>

                      {displayUser?.role === "student" && (
                        <DropdownMenuItem
                          onClick={() => handleNavigation("/student/orders")}
                          className="focus:bg-gray-100 dark:focus:bg-gray-800/80 focus:text-gray-900 dark:focus:text-white"
                        >
                          <div className="flex items-center space-x-3 w-full p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white transition-all duration-200">
                            <Package className="h-5 w-5" />
                            <span>My Orders</span>
                          </div>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator className="my-2 bg-gray-200/50 dark:bg-white/10" />

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 focus:bg-red-50 dark:focus:bg-red-500/20 focus:text-red-600 dark:focus:text-red-400"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full h-10 w-10 bg-gray-100/70 dark:bg-gray-900/50 border border-gray-300/50 dark:border-white/10 hover:bg-gray-200/70 dark:hover:bg-gray-800/70 transition-colors duration-300"
                  >
                    <User className="h-5 w-5 text-gray-700 dark:text-white" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 z-50 w-full bg-[#0a192f] shadow-lg border-b border-gray-200/50 dark:border-white/10 transition-all duration-500">
      <div className="w-full px-4">
        <div className="flex h-20 items-center justify-between">
          <Logo />

          {/* Global Search Bar (Desktop) - only show when authenticated */}
          {isAuthenticated && (
            <div className="hidden lg:block relative w-96 mr-6">
              <GlobalSearchDropdown
                query={searchQuery}
                setQuery={setSearchQuery}
                open={searchDropdownOpen}
                setOpen={setSearchDropdownOpen}
                navigate={navigate}
              />
            </div>
          )}

          {/* Desktop Navigation - only show when authenticated */}
          {isAuthenticated && (
            <nav className="hidden md:flex">
              <div className="relative flex items-center bg-gray-100/70 dark:bg-gray-900/50 backdrop-blur-lg rounded-full p-1 border border-gray-300/50 dark:border-white/10">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={`relative px-6 py-2 text-sm font-medium transition-colors duration-300 rounded-full ${
                      pathname === item.href
                        ? "text-white"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="relative z-10">{item.name}</span>
                    {pathname === item.href && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 z-0 rounded-full bg-red-600"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </nav>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle - only show on desktop */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* Cart - only show for students */}
            {isAuthenticated && displayUser?.role === "student" && (
              <button
                onClick={() => handleNavigation("/cart")}
                className="relative group"
              >
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100/70 dark:bg-gray-900/50 border border-gray-300/50 dark:border-white/10 hover:bg-gray-200/70 dark:hover:bg-gray-800/70 transition-colors duration-300">
                  <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-white" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs font-bold rounded-full border-2 border-white dark:border-black/50">
                      {cartItemsCount}
                    </Badge>
                  )}
                </div>
              </button>
            )}

            {/* Authentication */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <ProfileAvatar
                    src={profileImageSrc}
                    name={displayUser?.name}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-white/90 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-white/10 shadow-2xl rounded-2xl mt-2 p-2 text-gray-900 dark:text-white"
                >
                  <div className="p-2 border-b border-gray-200/50 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
                        <img
                          src={profileImageSrc || "/placeholder-user.jpg"}
                          alt={displayUser?.name || "User"}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.target.src = "/placeholder-user.jpg";
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {displayUser?.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[180px]">
                          {displayUser?.email}
                        </p>
                        {displayUser?.role && (
                          <p className="text-xs text-red-500 dark:text-red-400 capitalize">
                            {displayUser.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenuItem
                    onClick={() =>
                      handleNavigation(
                        displayUser?.role === "campus-partner"
                          ? "/campus/dashboard?tab=profile"
                          : "/profile"
                      )
                    }
                    className="mt-2 focus:bg-gray-100 dark:focus:bg-gray-800/80 focus:text-gray-900 dark:focus:text-white"
                  >
                    <div className="flex items-center space-x-3 w-full p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white transition-all duration-200">
                      <User className="h-5 w-5" />
                      <span>View Profile</span>
                    </div>
                  </DropdownMenuItem>

                  {displayUser?.role === "student" && (
                    <DropdownMenuItem
                      onClick={() => handleNavigation("/student/orders")}
                      className="focus:bg-gray-100 dark:focus:bg-gray-800/80 focus:text-gray-900 dark:focus:text-white"
                    >
                      <div className="flex items-center space-x-3 w-full p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white transition-all duration-200">
                        <Package className="h-5 w-5" />
                        <span>My Orders</span>
                      </div>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="my-2 bg-gray-200/50 dark:bg-white/10" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 focus:bg-red-50 dark:focus:bg-red-500/20 focus:text-red-600 dark:focus:text-red-400"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Login/Signup buttons
              <div className="hidden sm:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation("/login")}
                  className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50"
                >
                  Login
                </Button>
                <Button
                  onClick={() => handleNavigation("/register")}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full px-5 py-2"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full max-w-sm bg-[#0a192f] border-l border-slate-700 text-white p-0"
              >
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header with Logo */}
                  <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700 bg-[#0a192f]">
                    <div className="flex items-center space-x-3">
                      {/* Red Square Logo with CB */}
                      <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">CB</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-white">
                          Campus Bites
                        </span>
                        <span className="text-xs text-slate-300 font-light tracking-wider">
                          Fast • Fresh • Delicious
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-full text-white hover:bg-slate-800"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* Mobile Search Bar for Authenticated Users */}
                  {isAuthenticated && (
                    <div className="my-4 px-4">
                      <GlobalSearchDropdown
                        query={searchQuery}
                        setQuery={setSearchQuery}
                        open={searchDropdownOpen}
                        setOpen={setSearchDropdownOpen}
                        navigate={navigate}
                      />
                    </div>
                  )}

                  {/* Navigation items */}
                  <nav className="flex-1 p-6 space-y-2">
                    {isAuthenticated &&
                      navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.href}
                            onClick={() => {
                              handleNavigation(item.href);
                              setIsMenuOpen(false);
                            }}
                            className={`w-full flex items-center space-x-4 px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium ${
                              pathname === item.href
                                ? "bg-red-600 text-white"
                                : "text-white hover:bg-slate-800"
                            }`}
                          >
                            <Icon className="h-6 w-6" />
                            <span>{item.name}</span>
                          </button>
                        );
                      })}

                    {/* Show welcome message for unauthenticated users */}
                    {!isAuthenticated && (
                      <div className="text-center py-16">
                        <p className="text-slate-200 text-2xl mb-4 font-light">
                          Welcome to Campus Bites
                        </p>
                        <p className="text-slate-400 text-sm">
                          Please login to access all features
                        </p>
                      </div>
                    )}
                  </nav>

                  {/* Login/Signup buttons for unauthenticated users */}
                  {!isAuthenticated && (
                    <div className="p-6 space-y-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleNavigation("/login");
                          setIsMenuOpen(false);
                        }}
                        className="w-full bg-black text-white border-black font-bold rounded-xl py-4 shadow-md transition-all duration-300 hover:scale-105 hover:bg-gray-800"
                      >
                        Login
                      </Button>
                      <Button
                        onClick={() => {
                          handleNavigation("/register");
                          setIsMenuOpen(false);
                        }}
                        className="w-full h-12 bottom-5 bg-red-600 hover:bg-red-700 rounded-xl text-lg font-bold"
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                  <div className="bottom-0 right-0 left-0 w-full p-9 bg-[#0a192f] border-t border-slate-700">
                    <Button
                      onClick={() => {
                        const apkUrl = `${window.location.origin}/campus-bites.apk`;

                        const link = document.createElement("a");
                        link.href = apkUrl;
                        link.download = "campus-bites.apk"; // triggers actual download
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-lg shadow-lg flex items-center justify-center space-x-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download APK</span>
                    </Button>
                  </div>

                  {/* Theme Toggle at bottom */}
                  <div className="mt-auto p-6 flex justify-center">
                    {/* <div className="w-12 h-12 rounded-full bg-yellow-400 border-2 border-yellow-400 flex items-center justify-center shadow-lg">
                      <ThemeToggle />
                    </div> */}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export default memo(Navbar);
