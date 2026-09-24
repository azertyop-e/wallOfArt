export const WALL_TITLE = "Wall of Art";

type WallTitleProps = {
  title?: string;
  align?: "spread" | "start";
  className?: string;
};

/**
 * The big « Wall of Art » title (or any other `title`), words spread across the
 * full width (or packed on the left with `align="start"`). Each letter
 * (`data-title-char`) sits in its own mask so it can slide in. The size can be
 * changed from a parent with the `--wall-title-size` CSS variable.
 */
export function WallTitle({
  title = WALL_TITLE,
  align = "spread",
  className,
}: WallTitleProps) {
  return (
    <span
      className={`block text-[length:var(--wall-title-size,14vw)] leading-[0.8] font-medium tracking-tight uppercase ${className ?? ""}`}
    >
      <span className="sr-only">{title}</span>
      <span
        aria-hidden
        className={`flex ${align === "spread" ? "justify-between" : "gap-[0.2em]"}`}
      >
        {title.split(" ").map((word) => (
          <span key={word} className="flex overflow-clip pt-[0.04em]">
            {[...word].map((char, index) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: letters of a static word never reorder.
                key={index}
                data-title-char
                className="inline-block"
              >
                {char}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}
