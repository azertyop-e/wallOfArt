export const WALL_TITLE = "Wall of Art";

type WallTitleProps = {
  title?: string;
  className?: string;
};

/**
 * The big « Wall of Art » title (or any other `title`), words spread across the
 * full width. Each letter (`data-title-char`) sits in its own mask so it can
 * slide in.
 */
export function WallTitle({ title = WALL_TITLE, className }: WallTitleProps) {
  return (
    <span
      className={`block text-[14vw] leading-[0.8] font-medium tracking-tight uppercase ${className ?? ""}`}
    >
      <span className="sr-only">{title}</span>
      <span aria-hidden className="flex justify-between">
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
