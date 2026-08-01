type CategoryIconProps = {
  icon: "fuel" | "mobile" | "driver" | "books" | "professional";
  color: string;
};

export function CategoryIcon({ icon, color }: CategoryIconProps) {
  switch (icon) {
    case "fuel":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4.5 19.5V6.2c0-.94.76-1.7 1.7-1.7h7.1c.94 0 1.7.76 1.7 1.7v13.3"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 19.5h12.5"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M7.2 8.2h5.1v4.2H7.2V8.2Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M15 10.5h1.4c.9 0 1.6.7 1.6 1.6v4.2a1.7 1.7 0 0 0 3.4 0V9.8l-2.2-2.3"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "mobile":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="7"
            y="3.5"
            width="10"
            height="17"
            rx="2"
            stroke={color}
            strokeWidth="1.5"
          />
          <path
            d="M10.5 17.5h3"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "driver":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="3.25" stroke={color} strokeWidth="1.5" />
          <path
            d="M5.5 19.5c.9-3.2 3.3-4.8 6.5-4.8s5.6 1.6 6.5 4.8"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "books":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 5.5A1.5 1.5 0 0 1 6.5 4H18v14.5H6.5A1.5 1.5 0 0 0 5 20V5.5Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M5 18.5h13"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "professional":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3.5 9.5h17v8.5a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 18V9.5Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M8 9.5V7.2A1.7 1.7 0 0 1 9.7 5.5h4.6A1.7 1.7 0 0 1 16 7.2v2.3"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M3.5 13.5h17"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}
