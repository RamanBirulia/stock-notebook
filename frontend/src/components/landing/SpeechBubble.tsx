const colorClasses = {
  primary:
    "bg-primary-100 border-primary-300 text-primary-800 dark:bg-primary-900/30 dark:border-primary-600 dark:text-primary-200",
  secondary:
    "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-200",
  accent:
    "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-200",
};

export const SpeechBubble: React.FC<{
  children: React.ReactNode;
  direction?: "left" | "right";
  color?: "primary" | "secondary" | "accent";
  className?: string;
}> = ({ children, direction = "left", color = "primary", className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <div
        className={`
        relative p-4 rounded-2xl border-2 border-dashed
        ${colorClasses[color]}
        transform rotate-1 hover:rotate-0 transition-transform duration-300
        shadow-lg
      `}
      >
        {children}

        {/* Speech bubble tail */}
        <div
          className={`
          absolute ${direction === "left" ? "-left-2" : "-right-2"} top-6
          w-4 h-4 transform rotate-45
          ${colorClasses[color]}
          border-2 border-dashed border-l-0 border-t-0
          ${direction === "left" ? "border-r-0 border-b-0" : "border-l-0 border-b-0"}
        `}
        />
      </div>
    </div>
  );
};
