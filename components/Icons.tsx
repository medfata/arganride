type P = { className?: string };
const base = (className = "h-5 w-5") => ({
  className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const IconPlane = ({ className }: P) => (
  <svg {...base(className)}><path d="M2.5 19h19M3.8 12.6l3.3 3.2a2 2 0 0 0 2 .5L20 13a1.8 1.8 0 0 0-1-3.5l-4 1-5.5-5.4-2 .6 3 5.8-3.6 1-2-1.7-1.6.5z" /></svg>
);
export const IconPin = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
export const IconUsers = ({ className }: P) => (
  <svg {...base(className)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" /></svg>
);
export const IconBag = ({ className }: P) => (
  <svg {...base(className)}><rect x="5" y="7" width="14" height="13" rx="2" /><path d="M9 7V4.5h6V7M9 11v5M15 11v5M7.5 20v1.5M16.5 20v1.5" /></svg>
);
export const IconBoard = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 2c3 4 4 9 3 14-.5 3-1.6 5-3 6-1.4-1-2.5-3-3-6-1-5 0-10 3-14z" /><path d="M12 6v12" /></svg>
);
export const IconSwap = ({ className }: P) => (
  <svg {...base(className)}><path d="M7 4v16M7 4L3.5 7.5M7 4l3.5 3.5M17 20V4M17 20l-3.5-3.5M17 20l3.5-3.5" /></svg>
);
export const IconCheck = ({ className }: P) => (
  <svg {...base(className)}><path d="M4.5 12.5l5 5 10-11" /></svg>
);
export const IconArrow = ({ className }: P) => (
  <svg {...base(className)}><path d="M4 12h16M14 6l6 6-6 6" /></svg>
);
export const IconClock = ({ className }: P) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IconRoad = ({ className }: P) => (
  <svg {...base(className)}><path d="M7 21L10 3M17 21L14 3M12 6v2M12 11v2M12 16v2" /></svg>
);
export const IconSign = ({ className }: P) => (
  <svg {...base(className)}><rect x="3" y="5" width="18" height="11" rx="1.5" /><path d="M7 9.5h10M7 12.5h6M12 16v5" /></svg>
);
export const IconRadar = ({ className }: P) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><path d="M12 12l6-6" /><circle cx="12" cy="12" r="1" /></svg>
);
export const IconTag = ({ className }: P) => (
  <svg {...base(className)}><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>
);
export const IconWhatsapp = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.2-1.36A9.9 9.9 0 1 0 12.04 2zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.08.8.82-3-.2-.31a8.2 8.2 0 1 1 6.94 3.84zm4.5-6.14c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.55.12-.17.25-.64.8-.78.97-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-3.32-2.9c-.25-.43.25-.4.71-1.33.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.85 2.04 4.76 4.76 0 0 0 1 2.53 10.9 10.9 0 0 0 4.17 3.68c1.55.67 2.16.73 2.94.61.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.15-1.17-.06-.11-.22-.17-.47-.29z" />
  </svg>
);
export const IconPhone = ({ className }: P) => (
  <svg {...base(className)}><path d="M5 3h3.5l1.5 5-2 1.5a12 12 0 0 0 6.5 6.5L16 14l5 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" /></svg>
);
export const IconMail = ({ className }: P) => (
  <svg {...base(className)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6.5L12 13l8.5-6.5" /></svg>
);
export const IconChild = ({ className }: P) => (
  <svg {...base(className)}><circle cx="12" cy="5" r="2.5" /><path d="M7 21v-6l-2-4h14l-2 4v6M9 21v-4h6v4" /></svg>
);
export const IconSim = ({ className }: P) => (
  <svg {...base(className)}><path d="M6 3.5h8.5L19 8v11.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z" /><rect x="8.5" y="11" width="7" height="6.5" rx="1" /><path d="M12 11v6.5M8.5 14.25h7" /></svg>
);
export const IconBasket = ({ className }: P) => (
  <svg {...base(className)}><path d="M3 9.5h18l-1.8 9.2a1.5 1.5 0 0 1-1.5 1.3H6.3a1.5 1.5 0 0 1-1.5-1.3zM8 9.5l3-6M16 9.5l-3-6M9 13v4M15 13v4" /></svg>
);
