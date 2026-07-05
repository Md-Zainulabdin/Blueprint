import Link from "next/link";
import { ArrowRight, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative flex flex-col items-center justify-center px-4 pt-28 pb-24 sm:pt-40 sm:pb-32 overflow-hidden">
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[640px] rounded-full bg-primary/[0.04] blur-3xl -z-10" />

        <div className="flex flex-col items-center gap-6 text-center max-w-2xl relative">
          <Badge variant="outline" className="motion-enter-up duration-700 text-[11px] font-semibold uppercase tracking-widest px-3.5 py-1 rounded-full">
            <span className="size-1.5 rounded-full bg-primary mr-1.5 inline-block" />
            Architect Workspace — V1
          </Badge>
          <h1 className="motion-enter-up duration-700 delay-100 text-[clamp(2rem,5.5vw,3.75rem)] font-bold tracking-tighter leading-[1.04]">
            The workflow architect<br />
            <span className="text-primary">your operations deserve.</span>
          </h1>
          <p className="motion-enter-up duration-700 delay-200 text-[15px] text-muted-foreground leading-relaxed max-w-lg">
            Upload your manual workflow and instantly generate a production-ready
            system architecture, complete data flow, and deployable agent configurations.
          </p>
          <div className="motion-enter-up duration-700 delay-300 flex items-center gap-3 pt-1">
            <Button asChild size="lg">
              <Link href="/workspace">
                Generate Blueprint
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/workspace/saved">
                <Bookmark className="mr-2 size-4" />
                Saved Plans
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
