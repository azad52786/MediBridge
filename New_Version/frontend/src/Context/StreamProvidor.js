import { createContext, useContext } from "react";

export const StreamProvider = createContext(null);
export const useStreamContext = () => useContext(StreamProvider);