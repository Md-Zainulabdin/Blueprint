import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-xl">
        <h1 className="motion-enter-up duration-700 text-4xl font-bold tracking-tight sm:text-5xl">
          Personalized Forward Deployed Engineering
        </h1>
        <p className="motion-enter-up duration-700 delay-150 text-base text-muted-foreground leading-relaxed max-w-lg">
          Describe your manual workflow and get a production-grade AI-agent
          automation blueprint with system architecture, data flow, and
          ready-to-deploy agent configurations.
        </p>
        <div className="motion-enter-up duration-700 delay-300">
          <Button asChild size="lg">
            <Link href="/workspace">Open Workspace</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
