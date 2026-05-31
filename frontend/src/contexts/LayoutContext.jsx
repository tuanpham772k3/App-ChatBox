import { createContext, useContext } from "react";

const LayoutContext = createContext(null);

export const LayoutProvider = ({ children, value }) => (
  <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within MainLayout");
  }
  return context;
};
