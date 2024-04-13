import { createContext } from "react";
import { Socket } from "socket.io-client";

export const wsContext = createContext<Socket | undefined>(undefined);
