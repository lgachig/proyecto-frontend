import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [expanded, setExpanded] = useState(window.innerWidth > 1024);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
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

// Hook personalizado para usarlo fácil
export const useSidebar = () => useContext(SidebarContext);