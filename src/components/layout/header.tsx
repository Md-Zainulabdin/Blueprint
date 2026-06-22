import Link from "next/link";
import ThemeToggle from "@/components/shared/theme-toggle";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-3">
      <nav className="flex items-center gap-6">
        <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
          Blueprint
        </Link>
        <Link
          href="/workspace"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Workspace
        </Link>
      </nav>
      <ThemeToggle />
    </header>
  );
}
