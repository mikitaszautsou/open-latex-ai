import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { indexedDBPersister, queryClient } from "~/query-client";

export function QueryClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: indexedDBPersister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
