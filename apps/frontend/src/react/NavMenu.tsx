import type { SolarSystemModel } from "../domain/solarSystemModel";
import { isPlanetLike } from "../domain/types";

interface Props {
  model: SolarSystemModel;
  selectedBodyId: string | null;
  focus: (id: string) => void;
}

export function NavMenu({ model, selectedBodyId, focus }: Props) {
  // Sun + the 8 planets + Pluto (dwarf planet, S28); moons and satellites never appear.
  const items = model.bodies.filter((b) => b.type === "star" || isPlanetLike(b.type));

  // Highlighted item: the selected body itself, or its parent planet for moons/satellites.
  let activeId: string | null = null;
  if (selectedBodyId !== null) {
    const body = model.byId(selectedBodyId);
    activeId =
      (body?.type === "moon" || body?.type === "satellite") && body.parentId !== null
        ? body.parentId
        : selectedBodyId;
  }

  return (
    <nav className="nav-menu">
      <div className="nav-items">
        {items.map((body) => (
          <button
            key={body.id}
            className={`nav-item${activeId === body.id ? " nav-item--active" : ""}`}
            style={{ "--body-color": body.color } as React.CSSProperties}
            onClick={() => focus(body.id)}
          >
            {body.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
