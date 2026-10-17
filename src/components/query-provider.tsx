"use client";

import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
  DehydratedState,
} from "@tanstack/react-query";
import { useState, ReactNode } from "react";

interface ReactQueryProviderProps {
  children: ReactNode;
  dehydratedState?: DehydratedState;
}

export default function ReactQueryProvider({
  children,
  dehydratedState,
}: ReactQueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({}));

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
}
