type InstagramIconProps = {
  className?: string;
};

export function InstagramIcon({ className }: InstagramIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.7" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}
