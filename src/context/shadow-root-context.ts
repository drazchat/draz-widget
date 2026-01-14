import { createContext, useContext } from "react";

interface ShadowRootContextType {
  shadowRoot: ShadowRoot | null;
}

export const ShadowRootContext = createContext<ShadowRootContextType>({
  shadowRoot: null,
});

export const useShadowRoot = () => useContext(ShadowRootContext);
