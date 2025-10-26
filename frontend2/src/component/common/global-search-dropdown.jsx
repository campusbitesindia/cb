import React, { useState, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import apiConnector from "../../services/apiConnector";
import { SearchApi } from "../../services/api";
import { useSelector } from "react-redux";

export default function GlobalSearchDropdown({
  query,
  setQuery,
  open,
  setOpen,
  onSearch,
  navigate,
}) {
  const {token}=useSelector((state)=>state.Auth);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounce search
  useEffect(() => {
    if (!query) {
      setResults({});
      setError("");
      setOpen(false);
      return;
    }
    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await apiConnector(SearchApi.searchAll+`?q=${encodeURIComponent(query)}`,"GET",null,{Authorization:`Bearer ${token}`});
        setResults(res.data.results || {});
        setError("");
        setOpen(true);
      } catch (error) {
       
        setError("Something went wrong.");
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [query, setOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, setOpen]);

  const handleNavigation = (url) => {
    navigate(url);
  };

  const getResultLink = (item) => {
  
    if (item.type === "item" || item.type === "dish")
      return `/canteen/${item.canteen._id}`;
    if (item.type === "canteen") return `/canteen/${item._id}`;
    return "#";
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl px-5 py-2.5 shadow-lg">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setError("");
          }}
          placeholder="Search for items, dishes, or canteens..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-base outline-none px-3 py-1 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          onFocus={() => query && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // Try to find a matching result
              const allResults = Object.values(results).flat();
              const match = allResults.find(
                (item) => item.name.toLowerCase() === query.trim().toLowerCase()
              );
              if (match) {
                // Navigate to the matched item's page
                handleNavigation(getResultLink(match));
                setOpen(false);
              } else {
                // Show DNE result
                setError("No results found.");
                setOpen(true);
              }
            }
          }}
        />
      </div>
      {open && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 z-50 max-h-80 overflow-y-auto"
        >
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : query && Object.keys(results).length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No results found.
              </div>
            ) : (
              Object.entries(results).map(([type, items]) => (
                <div key={type} className="mb-6">
                  <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2 capitalize">
                    {type}s
                  </div>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item._id}>
                        <div
                          className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white cursor-pointer"
                          onMouseDown={() => {
                            setQuery(item.name);
                            setOpen(false);
                            if (typeof window !== "undefined") {
                              window.dispatchEvent(
                                new Event("closeMobileMenu")
                              );
                            }
                            handleNavigation(getResultLink(item));
                          }}
                        >
                          {item.name}
                          {item.type === "item" && item.price && (
                            <span className="ml-2 text-sm text-gray-400">
                              ₹{item.price}
                            </span>
                          )}
                          {item.type === "canteen" && item.location && (
                            <span className="ml-2 text-sm text-gray-400">
                              {item.location}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
