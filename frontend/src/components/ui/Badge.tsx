interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline";
}

export default function Badge({ children, className = "", variant = "default" }: BadgeProps) {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variants = {
    default: "",
    outline: "border border-current bg-transparent",
  };
  return (
    <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>
  );
}
