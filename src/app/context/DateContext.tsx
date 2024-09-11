import { createContext, useState, useContext, ReactNode } from "react";

interface DateContextProps {
  selectedDate: string; // Usamos string (YYYY-MM-DD) aqui
  setSelectedDate: (date: string) => void;
}

const DateContext = createContext<DateContextProps | undefined>(undefined);

export const useDate = () => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error("useDate deve ser usado dentro de um DateProvider");
  }
  return context;
};

export const DateProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // Data atual como padrão

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateContext.Provider>
  );
};