/** <AppBar> — DESIGN.md §5.3. Brand bar, optional back + trailing actions, transparent variant. */
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "../../lib/icons";

export function AppBar({
  title,
  back,
  transparent,
  trailing,
}: {
  title?: string;
  back?: boolean;
  transparent?: boolean;
  trailing?: React.ReactNode;
}) {
  const nav = useNavigate();
  return (
    <header
      className={[
        "z-[200] flex h-14 items-center gap-1 px-2",
        transparent ? "bg-transparent text-white" : "bg-brand text-white shadow-e4",
      ].join(" ")}
    >
      {back && (
        <button
          onClick={() => nav(-1)}
          aria-label="Back"
          className="grid h-12 w-12 place-items-center rounded-full hover:bg-white/10"
        >
          <ArrowLeft size={24} />
        </button>
      )}
      {title && <h1 className="t-title flex-1 truncate px-1">{title}</h1>}
      {!title && <span className="flex-1" />}
      <div className="flex items-center gap-1">{trailing}</div>
    </header>
  );
}
