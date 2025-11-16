import { createContext, useContext, useState } from "react";

const WindowNavbarContext = createContext(undefined);

export const useWindowNavbar = () => useContext(WindowNavbarContext);

export const WindowNavbarProvider = ({ children }) => {
  const [navbarChildren, setNavbarChildren] = useState(null);

  return (
    <WindowNavbarContext.Provider value={{ navbarChildren, setNavbarChildren }}>
      {children}
    </WindowNavbarContext.Provider>
  );
};
