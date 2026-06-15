import { Suspense } from "react";
import { HomeExplorer } from "@/components/home-explorer";
import { publishedWebsites } from "@/lib/data";

export const revalidate = 60;

export default async function HomePage() {
  const sites = await publishedWebsites();

  return (
    <Suspense fallback={null}>
      <HomeExplorer sites={sites} />
    </Suspense>
  );
}
