import { cn } from "@/lib/cn";

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  id?: string;
  bordered?: boolean;
};

export function Section({
  id,
  bordered = true,
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 sm:py-28",
        bordered && "border-t border-[color:var(--border)]",
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "",
      )}
    >
      {eyebrow ? (
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-black sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-lg leading-relaxed text-[color:var(--muted-foreground)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
