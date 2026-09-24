import { WallTitle } from "@/components/wall-title";

type AuthPageProps = {
  title: string;
  intro: string;
  /** Muted line under the intro. */
  hint: string;
  /** The form, centred on the screen. */
  children: React.ReactNode;
};

/** Shared layout of the login and sign-up pages. */
export function AuthPage({ title, intro, hint, children }: AuthPageProps) {
  return (
    // One screen on desktop, the form on the left half.
    <main className="grid min-h-svh grid-cols-1 px-gutter md:h-svh md:grid-cols-6 md:gap-x-gutter md:overflow-clip">
      {/* Equal top and bottom rows: the form sits in the middle of the screen,
          whatever the intro and the title take. */}
      <div className="grid min-h-svh grid-rows-[1fr_auto_1fr] gap-y-[6vh] md:col-span-3">
        <p className="self-start pt-page-top text-[10px] leading-3 font-medium uppercase">
          {intro}
          <br />
          <span className="text-muted">{hint}</span>
        </p>

        <div className="md:span-w-2">{children}</div>

        {/* Sized to fit the left half, pinned to its bottom-left corner. */}
        <h1 className="self-end pb-gutter [--wall-title-size:18vw] md:[--wall-title-size:10vw]">
          <WallTitle title={title} align="start" />
        </h1>
      </div>
    </main>
  );
}
