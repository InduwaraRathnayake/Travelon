"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  User,
  Calendar,
  LogOut,
  MapPin,
  BarChart,
  Plus,
  HelpCircle,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Zap,
} from "lucide-react";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar on mobile when path changes and set initial state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    // Set initial state
    handleResize();

    // Close sidebar when navigating on mobile
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }

    // Add resize listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pathname]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        router.push("/auth/login");
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black/4 lg:pt-20">
      {/* Decorative background pattern */}
      <div
        className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M0,0 C30,10 70,10 100,0 L100,100 C70,90 30,90 0,100 Z' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3Cpath d='M0,50 C30,40 70,60 100,50' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3Cpath d='M0,0 Q25,25 50,50 Q75,75 100,100' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3Cpath d='M100,0 Q75,25 50,50 Q25,75 0,100' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3C/svg%3E")`,
          backgroundSize: "300px 300px",
          backgroundPosition: "center",
          transform: "rotate(5deg) scale(1.5)",
        }}
      ></div>

      {/* Mobile overlay */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 z-40 md:hidden backdrop-blur-xs"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-black border-r border-gray-800 transform transition-all duration-300 ease-in-out ${
          isSidebarCollapsed
            ? "w-20 -translate-x-full md:translate-x-0"
            : "w-64 translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            {/* Logo - full size when expanded */}
            <Link
              href="/"
              className={`flex items-center ${
                isSidebarCollapsed ? "hidden md:flex" : ""
              }`}
            >
              <MapPin
                className={`h-6 w-6 text-white mr-2 ${
                  isSidebarCollapsed ? "hidden" : "block"
                }`}
              />
              <span
                className={`font-bold text-lg text-white ${
                  isSidebarCollapsed ? "hidden" : "block"
                }`}
              >
                Travelon
              </span>
            </Link>

            {/* Mobile close button - only shown when sidebar is open on mobile */}
            {!isSidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="block md:hidden p-2 rounded-md hover:bg-gray-800 transition-colors"
                aria-label="Close sidebar"
              >
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            {/* Icon only when collapsed */}
            <div
              className={`flex justify-center w-full ${
                !isSidebarCollapsed ? "hidden" : "block"
              }`}
            >
              <MapPin className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Navigation links */}
          <nav
            className={`flex-1 py-4 ${
              isSidebarCollapsed ? "px-0" : "px-2"
            } overflow-y-auto`}
          >
            <ul className="space-y-1">
              <li>
                <Link
                  href="/organizer/dashboard"
                  className={`flex items-center ${
                    isSidebarCollapsed ? "justify-center px-0" : "px-4"
                  } py-3 rounded-lg transition-colors ${
                    pathname === "/organizer/dashboard"
                      ? "bg-white text-black"
                      : "text-white hover:bg-gray-800"
                  }`}
                  title="Analytics Dashboard"
                >
                  <BarChart
                    className={`h-5 w-5 ${!isSidebarCollapsed && "mr-3"} ${
                      pathname === "/organizer/dashboard"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                  {!isSidebarCollapsed && "Dashboard"}
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/profile"
                  className={`flex items-center ${
                    isSidebarCollapsed ? "justify-center px-0" : "px-4"
                  } py-3 rounded-lg transition-colors ${
                    pathname === "/organizer/profile"
                      ? "bg-white text-black"
                      : "text-white hover:bg-gray-800"
                  }`}
                  title="Profile"
                >
                  <User
                    className={`h-5 w-5 ${!isSidebarCollapsed && "mr-3"} ${
                      pathname === "/organizer/profile"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                  {!isSidebarCollapsed && "Profile"}
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/events"
                  className={`flex items-center ${
                    isSidebarCollapsed ? "justify-center px-0" : "px-4"
                  } py-3 rounded-lg transition-colors ${
                    pathname === "/organizer/events"
                      ? "bg-white text-black"
                      : "text-white hover:bg-gray-800"
                  }`}
                  title="Events"
                >
                  <Calendar
                    className={`h-5 w-5 ${!isSidebarCollapsed && "mr-3"} ${
                      pathname === "/organizer/events"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                  {!isSidebarCollapsed && "Events"}
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/create-event"
                  className={`flex items-center ${
                    isSidebarCollapsed ? "justify-center px-0" : "px-4"
                  } py-3 rounded-lg transition-colors ${
                    pathname === "/organizer/create-event"
                      ? "bg-white text-black"
                      : "text-white hover:bg-gray-800"
                  }`}
                  title="Create Event"
                >
                  <Plus
                    className={`h-5 w-5 ${!isSidebarCollapsed && "mr-3"} ${
                      pathname === "/organizer/create-event"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                  {!isSidebarCollapsed && "Create Event"}
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/boost-events"
                  className={`flex items-center ${
                    isSidebarCollapsed ? "justify-center px-0" : "px-4"
                  } py-3 rounded-lg transition-colors ${
                    pathname === "/organizer/boost-events"
                      ? "bg-white text-black"
                      : "text-white hover:bg-gray-800"
                  }`}
                  title="Boost Events"
                >
                  <Zap
                    className={`h-5 w-5 ${!isSidebarCollapsed && "mr-3"} ${
                      pathname === "/organizer/boost-events"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                  {!isSidebarCollapsed && "Boost Events"}
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/payments"
                  className={`flex items-center ${
                    isSidebarCollapsed ? "justify-center px-0" : "px-4"
                  } py-3 rounded-lg transition-colors ${
                    pathname === "/organizer/payments"
                      ? "bg-white text-black"
                      : "text-white hover:bg-gray-800"
                  }`}
                  title="Payments"
                >
                  <CreditCard
                    className={`h-5 w-5 ${!isSidebarCollapsed && "mr-3"} ${
                      pathname === "/organizer/payments"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                  {!isSidebarCollapsed && "Payments"}
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/support"
                  className={`flex items-center ${
                    isSidebarCollapsed ? "justify-center px-0" : "px-4"
                  } py-3 rounded-lg transition-colors ${
                    pathname === "/organizer/support"
                      ? "bg-white text-black"
                      : "text-white hover:bg-gray-800"
                  }`}
                  title="Help & Support"
                >
                  <HelpCircle
                    className={`h-5 w-5 ${!isSidebarCollapsed && "mr-3"} ${
                      pathname === "/organizer/support"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                  {!isSidebarCollapsed && "Help & Support"}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Logout button */}
          <div
            className={`p-4 border-t border-gray-800 ${
              isSidebarCollapsed ? "px-0" : ""
            }`}
          >
            <button
              onClick={handleSignOut}
              className={`flex items-center ${
                isSidebarCollapsed
                  ? "justify-center w-full px-0"
                  : "w-full px-4"
              } py-3 text-left text-red-300 rounded-lg hover:bg-white hover:text-red-700 transition-colors`}
              title="Sign Out"
            >
              <LogOut className={`h-5 w-5 ${!isSidebarCollapsed && "mr-3"}`} />
              {!isSidebarCollapsed && "Sign Out"}
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Fixed header */}
        <header
          className={`fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 transition-all duration-300 ${
            isSidebarCollapsed ? "md:left-20" : "md:left-64"
          }`}
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  onClick={toggleSidebar}
                  className="block md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label={
                    isSidebarCollapsed ? "Open sidebar" : "Close sidebar"
                  }
                >
                  <Menu size={24} className="text-gray-700" />
                </button>

                <button
                  onClick={toggleSidebar}
                  className="hidden md:flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-all"
                  aria-label="Toggle sidebar"
                >
                  {isSidebarCollapsed ? (
                    <ChevronRight size={20} className="text-gray-500" />
                  ) : (
                    <ChevronLeft size={20} className="text-gray-500" />
                  )}
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {isSidebarCollapsed ? "Expand" : "Collapse"}
                  </span>
                </button>
              </div>
              <div className="flex items-center">
                {/* User profile info can go here */}
              </div>
            </div>
          </div>
        </header>

        {/* Content with proper padding for fixed header */}
        <main className="pt-20 p-4 sm:p-6 lg:p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
