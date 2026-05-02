import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";

export function Header() {
  return (
    <header className="border-b border-[color:var(--border)] bg-white">
      <Container className="flex h-16 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <a
            href="#pricing"
            className="hidden text-sm text-neutral-700 transition-colors hover:text-black sm:inline-flex sm:px-3"
          >
            Tariflar
          </a>
          <Button href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Kirish
          </Button>
        </div>
      </Container>
    </header>
  );
}
