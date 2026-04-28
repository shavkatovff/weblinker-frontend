import { FeatureIconKind } from "@/lib/store/types";

export function FeatureIcon({
  kind,
  className,
}: {
  kind: FeatureIconKind;
  className?: string;
}) {
  const map: Record<FeatureIconKind, React.ReactNode> = {
    leaf: (
      <path
        d="M4 14C4 7 10 4 14 4C14 10 11 14 4 14Z M4 14L10 8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    fire: (
      <path
        d="M9 14.5C6 14.5 4 12.5 4 10C4 7 7 6 7 3.5C7 3 7.5 2.5 8 2.5C10 4 12 6.5 12 9C13 8.5 13.5 7.5 13.5 6.5C14 8 14.5 9.5 14 11C13.5 13 11.5 14.5 9 14.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    ),
    clock: (
      <>
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 5V9L12 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
    shield: (
      <path
        d="M9 2L15 4V8.5C15 12 12 14 9 15.5C6 14 3 12 3 8.5V4L9 2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    ),
    package: (
      <>
        <path
          d="M9 2L15 5V12L9 15L3 12V5L9 2Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M3 5L9 8L15 5M9 8V15" stroke="currentColor" strokeWidth="1.4" />
      </>
    ),
    star: (
      <path
        d="M9 2.5L11 7L15.5 7.5L12 10.5L13 15L9 12.5L5 15L6 10.5L2.5 7.5L7 7L9 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    ),
    users: (
      <>
        <circle cx="6.5" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="6.5" r="1.7" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M2.5 14c.6-2.3 2.2-3.5 4-3.5s3.4 1.2 4 3.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M10.5 13c.7-1.6 2-2.5 3-2.5 1.2 0 2.2.8 2.5 2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </>
    ),
    award: (
      <>
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M6.5 10L5 15.5L9 13.5L13 15.5L11.5 10"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </>
    ),
    spark: (
      <path
        d="M9 2V5M9 13V16M2 9H5M13 9H16M4 4L6 6M12 12L14 14M4 14L6 12M12 6L14 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    ),
    heart: (
      <path
        d="M9 14.5C9 14.5 2.5 11 2.5 6.5C2.5 4.5 4 3 5.8 3C7 3 8.2 3.8 9 4.8C9.8 3.8 11 3 12.2 3C14 3 15.5 4.5 15.5 6.5C15.5 11 9 14.5 9 14.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    ),
  };

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
      className={className}
    >
      {map[kind]}
    </svg>
  );
}

export const FEATURE_ICON_OPTIONS: FeatureIconKind[] = [
  "star",
  "clock",
  "shield",
  "users",
  "leaf",
  "fire",
  "package",
  "award",
  "spark",
  "heart",
];
