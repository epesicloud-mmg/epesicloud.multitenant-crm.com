import { createContext, useContext, useState, ReactNode } from "react";

interface TenantContextType {
  tenantId: number;
  tenantName: string;
  setTenant: (id: number, name: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState(1); // Default tenant
  const [tenantName, setTenantName] = useState("Acme Corp");

  const setTenant = (id: number, name: string) => {
    setTenantId(id);
    setTenantName(name);
  };

  return (
    <TenantContext.Provider value={{ tenantId, tenantName, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

// Custom fetch function that includes tenant header
export function tenantFetch(url: string, options: RequestInit = {}) {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("tenantFetch must be used within a TenantProvider");
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-Tenant-Id': context.tenantId.toString(),
    },
    credentials: "include",
  });
}
