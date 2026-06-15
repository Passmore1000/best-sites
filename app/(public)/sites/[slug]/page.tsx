import { redirect } from "next/navigation";

type Params = Promise<{ slug: string }>;

export default async function SiteDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  redirect(`/?site=${slug}`);
}
