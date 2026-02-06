import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [expanded, setExpanded] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1280 : false
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setExpanded(false);
      } else {
        setExpanded(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setExpanded((curr) => !curr);

  return (
    <SidebarContext.Provider value={{ expanded, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);