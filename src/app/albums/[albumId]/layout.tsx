import { QueryClient, dehydrate } from "@tanstack/react-query";
import { getAlbum } from "@/services/server/albums";
import QueryProvider from "@/components/query-provider";

export default async function AlbumLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["album", albumId],
    queryFn: () => getAlbum(albumId),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <QueryProvider dehydratedState={dehydratedState}>{children}</QueryProvider>
  );
}
