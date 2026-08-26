'use client';

import { createContext, useContext } from 'react';

export type AdminChromeValue = {
  navOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
};

const AdminChromeContext = createContext<AdminChromeValue>({
  navOpen: false,
  openNav: () => undefined,
  closeNav: () => undefined,
});

export function AdminChromeProvider({
  value,
  children,
}: {
  value: AdminChromeValue;
  children: React.ReactNode;
}) {
  return (
    <AdminChromeContext.Provider value={value}>
      {children}
    </AdminChromeContext.Provider>
  );
}

export function useAdminChrome(): AdminChromeValue {
  return useContext(AdminChromeContext);
}
