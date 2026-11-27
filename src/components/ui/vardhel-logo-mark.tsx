interface VardhelLogoMarkProps {
  className?: string;
}

/**
 * Clean transparent Vardhel V emblem (no dark squircle background),
 * adapting left stroke contrast automatically between Light and Dark modes.
 */
export function VardhelLogoMark({ className = "h-7 w-7" }: VardhelLogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="22 22 100 100"
      aria-hidden="true"
      className={className}
    >
      <rect
        className="fill-[#228870] dark:fill-[#34d399]"
        x="34.26"
        y="68.87"
        width="116.26"
        height="12.09"
        rx="6.04"
        transform="translate(197.38 19.01) rotate(112.94)"
      />
      <rect
        className="fill-[#0e192c] dark:fill-[#f4f2eb]"
        x="-6.42"
        y="69.12"
        width="116.26"
        height="12.09"
        rx="6.04"
        transform="translate(100.78 -1.75) rotate(67.06)"
      />
    </svg>
  );
}

