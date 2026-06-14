import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Get a website like this",
  description: "Hire BestSites Studio to design a high-converting website for your business.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Get a website like this</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Tell us about your business and the websites that inspire you. BestSites Studio will design
        a high-converting site built on what already works in your industry.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="mailto:studio@bestsites.io" size="lg">Book a Discovery Call</ButtonLink>
        <ButtonLink href="/browse" variant="outline" size="lg">Keep browsing</ButtonLink>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        A full enquiry form lands in a later phase — for now, email{" "}
        <a className="underline" href="mailto:studio@bestsites.io">studio@bestsites.io</a>.
      </p>
    </div>
  );
}
