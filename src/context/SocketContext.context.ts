import { createContext } from "react";
import type { SocketContextType } from "./socket.types";

// Context object in separate file for Fast Refresh compatibility
export const SocketContext = createContext<SocketContextType | null>(null);
