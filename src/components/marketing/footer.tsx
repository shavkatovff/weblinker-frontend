import { Container } from "@/components/ui/container";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-white">
      <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <Logo />
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Webgrade
          </p>
        </div>
        <nav className="flex gap-5 text-xs text-neutral-600" aria-label="Footer">
          <a href="#pricing" className="hover:text-black">
            Tariflar
          </a>
          <a
            href="https://t.me/weblinker_support"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black"
          >
            Yordam
          </a>
        </nav>
      </Container>
    </footer>
  );
}
