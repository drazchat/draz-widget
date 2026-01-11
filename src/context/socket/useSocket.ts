import { useContext } from "react";
import { SocketContext } from "./socket.context";
import type { SocketContextType } from "./socket.types";

// Hook to use socket context
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === null) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context as SocketContextType;
};
