import { revalidatePath } from "next/cache";

/** Bust ISR for public pages after admin publishes or edits listings. */
export const revalidatePublicPages = (slug?: string) => {
  revalidatePath("/");
  revalidatePath("/sitemap.xml");

  if (slug) {
    revalidatePath(`/sites/${slug}`);
  }
};
