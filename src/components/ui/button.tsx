import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "inverse" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-black text-white border border-black hover:bg-neutral-800 active:bg-neutral-900 focus-visible:ring-black focus-visible:ring-offset-white",
  secondary:
    "bg-white text-black border border-black hover:bg-black hover:text-white focus-visible:ring-black focus-visible:ring-offset-white",
  ghost:
    "bg-transparent text-black hover:bg-neutral-100 focus-visible:ring-black focus-visible:ring-offset-white",
  inverse:
    "bg-white text-black border border-white hover:bg-neutral-200 active:bg-neutral-300 focus-visible:ring-white focus-visible:ring-offset-black",
  outline:
    "bg-transparent text-white border border-white hover:bg-white hover:text-black focus-visible:ring-white focus-visible:ring-offset-black",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-md",
  md: "h-11 px-5 text-[15px] rounded-md",
  lg: "h-12 px-7 text-base rounded-md sm:h-13",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    ...rest
  } = props;

  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in rest && rest.href) {
    const { href, ...anchorRest } = rest;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
