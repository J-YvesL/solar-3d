import type { Locale } from "../domain/i18n/locale";
import { t } from "../domain/i18n/strings";

interface Props {
  focused: boolean;
  onBack: () => void;
  locale: Locale;
}

/** "2.0.0" → "v2.0" */
function displayVersion(raw: string): string {
  const parts = raw.split(".");
  return `v${parts[0] ?? "0"}.${parts[1] ?? "0"}`;
}

export function Hud({ focused, onBack, locale }: Props) {
  const madeByTemplate = t(locale, "madeBy");
  const [beforeAuthor, afterAuthor] = madeByTemplate.split("{author}") as [string, string];

  return (
    <>
      {focused && (
        <button className="back-btn" onClick={onBack}>
          {t(locale, "back")}
        </button>
      )}

      {!focused && (
        <p className="hint-line">{t(locale, "hint")}</p>
      )}

      <footer className="footer">
        <span>{displayVersion(__APP_VERSION__)}</span>
        {" · "}
        <span>
          {beforeAuthor}
          <a href="https://jynfra.com" target="_blank" rel="noopener noreferrer">
            Jynfra
          </a>
          {afterAuthor}
        </span>
        {" · "}
        <a
          href="https://www.solarsystemscope.com/textures/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Textures: Solar System Scope (CC BY 4.0)
        </a>
      </footer>
    </>
  );
}
