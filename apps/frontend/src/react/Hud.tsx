import type { Locale } from "../domain/i18n/locale";
import { t } from "../domain/i18n/strings";

interface Props {
  focused: boolean;
  onBack: () => void;
  locale: Locale;
}

export function Hud({ focused, onBack, locale }: Props) {
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
