/** <BottomNavigationBar> — DESIGN.md §5.3. 5 items, active pill, role=navigation. */
import { NavLink } from "react-router-dom";
import { PhIcon } from "../../lib/icons";

const ITEMS = [
  { to: "/app/home", icon: "House", label: "Home" },
  { to: "/app/pay", icon: "ArrowsLeftRight", label: "Pay" },
  { to: "/app/invest", icon: "TrendUp", label: "Invest" },
  { to: "/app/marketplace", icon: "Gift", label: "Shop" },
  { to: "/app/profile", icon: "DotsThree", label: "More" },
];

export function BottomNavigationBar() {
  return (
    <nav
      aria-label="Main navigation"
      className="absolute inset-x-0 bottom-0 z-[300] flex items-stretch border-t border-line bg-bg-surface shadow-e4"
      style={{ height: 60 }}
    >
      {ITEMS.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          aria-label={it.label}
          className={({ isActive }) =>
            [
              "relative flex flex-1 flex-col items-center justify-center gap-1",
              isActive ? "text-brand" : "text-content-tertiary",
            ].join(" ")
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute top-2 h-8 w-16 rounded-full bg-brand-50" aria-hidden />
              )}
              <span className="relative">
                <PhIcon name={it.icon} size={22} weight={isActive ? "fill" : "regular"} />
              </span>
              <span className="relative t-label-sm">{it.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
