import React from "react";

import { GlobalRouteProtection } from "./GlobalRouteProtection";
import Footer from "./footer";
import Navbar from "./navbar";

export default function RootLayout({ children }) {
  return (
    <GlobalRouteProtection>
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Background */}
        <div className="absolute inset-0 w-full min-h-screen transition-all duration-1000 ease-in-out -z-10">
          {/* Light mode background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:opacity-0 opacity-100 transition-opacity duration-1000">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>
          {/* Dark mode background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f] via-[#1e3a5f] to-[#2d4a6b] opacity-0 dark:opacity-100 transition-opacity duration-1000 overflow-x-hidden">
            <div className="absolute top-0 left-0 w-60 h-60 sm:left-1/4 sm:w-96 sm:h-96 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 left-0 w-64 h-64 bg-cyan-600/10 rounded-full filter blur-2xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>
        </div>

        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <main className="flex-1 pt-20">{children}</main>

        {/* Footer */}
        <Footer />
      </div>
    </GlobalRouteProtection>
  );
}
