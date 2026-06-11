interface Props {
  focused: boolean;
  onBack: () => void;
}

export function Hud({ focused, onBack }: Props) {
  return (
    <>
      {focused && (
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      )}

      {!focused && (
        <p className="hint-line">
          Click a planet to explore — drag to rotate, scroll to zoom
        </p>
      )}

      <a
        className="attribution"
        href="https://www.solarsystemscope.com/textures/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Textures: Solar System Scope (CC BY 4.0)
      </a>
    </>
  );
}
