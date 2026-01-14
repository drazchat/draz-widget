import { type ReactNode } from "react";
import { ShadowRootContext } from "./shadow-root-context";

export const ShadowRootProvider = ({
  children,
  shadowRoot,
}: {
  children: ReactNode;
  shadowRoot: ShadowRoot | null;
}) => {
  return (
    <ShadowRootContext.Provider value={{ shadowRoot }}>
      {children}
    </ShadowRootContext.Provider>
  );
};
