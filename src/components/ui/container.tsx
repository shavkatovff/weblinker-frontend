import { cn } from "@/lib/cn";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: keyof React.JSX.IntrinsicElements;
};

export function Container({
  as: Tag = "div",
  className,
  children,
  ...rest
}: ContainerProps) {
  const Component = Tag as React.ElementType;
  return (
    <Component
      className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
