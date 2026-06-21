import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <section className="flex flex-col items-center gap-6 px-4 text-center max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight">Blueprint</h1>
        <p className="text-lg text-muted-foreground max-w-lg">
          A tool that helps you figure out exactly how to integrate AI into your
          daily workflow.
        </p>
        <Button>Get Started</Button>
      </section>
    </div>
  );
}
