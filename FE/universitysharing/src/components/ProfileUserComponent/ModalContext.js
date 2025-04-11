// contexts/ModalContext.js
import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [focusField, setFocusField] = useState(null);

  return (
    <ModalContext.Provider
      value={{ isModalOpen, setIsModalOpen, focusField, setFocusField }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
