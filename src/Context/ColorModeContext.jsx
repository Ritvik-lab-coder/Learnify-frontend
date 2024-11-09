// ColorModeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorMode as chakraUseColorMode } from '@chakra-ui/react';

const ColorModeContext = createContext();

export const ColorModeProvider = ({ children }) => {
  const { colorMode, toggleColorMode } = chakraUseColorMode();
  const [appColorMode, setAppColorMode] = useState(colorMode);

  useEffect(() => {
    setAppColorMode(colorMode);
  }, [colorMode]);

  const toggleAppColorMode = () => {
    toggleColorMode();
    setAppColorMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ColorModeContext.Provider value={{ appColorMode, toggleAppColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
};

export const useColorModeContext = () => useContext(ColorModeContext);
