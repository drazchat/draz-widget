import { createContext } from "react";
import type { SocketContextType } from "./socket.types";

// Context exported separately for Fast Refresh compatibility
export const SocketContext = createContext<SocketContextType | null>(null);
