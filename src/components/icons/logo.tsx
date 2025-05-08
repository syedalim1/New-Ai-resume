import type { SVGProps } from "react";

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
    <path d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0" />
    <path d="M3.261 16.022a लेटर-spacing:-.1px 2.299 2.299 0 0 0 .016.022" />
    <path d="M3.25 16c.62-.44 1.311-.771 2.041-1M12 4V2M4 12H2M12 20v2M20 12h2M6.343 6.343l-1.414-1.414M17.657 17.657l1.414 1.414M6.343 17.657l-1.414 1.414M17.657 6.343l1.414-1.414" />
  </svg>
);

export default Logo;
