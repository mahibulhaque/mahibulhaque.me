import type { IconProps } from ".";

export const IconArrowUpRight = (props: IconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
      {...props}
    >
      <title>Arrow Up Right</title>
      <path d="M7 17 17 7"></path>
      <path d="M7 7h10v10"></path>
    </svg>
  );
};
