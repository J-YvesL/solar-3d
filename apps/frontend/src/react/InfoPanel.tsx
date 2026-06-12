import { useEffect, useState } from "react";
import type { Body } from "../domain/types";
import type { SolarSystemModel } from "../domain/solarSystemModel";
import type { Locale } from "../domain/i18n/locale";
import { t } from "../domain/i18n/strings";
import type { BodyType } from "@solar/shared";

interface Props {
  body: Body;
  model: SolarSystemModel;
  locale: Locale;
}

const NARROW_NBSP = " ";

/** Integer with narrow no-break space grouping, e.g. 6371 → "6 371". */
function formatInteger(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n)).replace(/,/g, NARROW_NBSP);
}

function round1(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1);
}

/** Orbital period: < 2 days → hours, < 730 days → days, else years (doc 06). */
function humanizeOrbitalPeriod(days: number, locale: Locale): string {
  if (days < 2) return `${Math.round(days * 24)} ${t(locale, "hours")}`;
  if (days < 730) return `${Math.round(days)} ${t(locale, "days")}`;
  return `${round1(days / 365.25)} ${t(locale, "years")}`;
}

/** Rotation period: < 48 h → hours, else days (1 decimal) (doc 06). */
function humanizeRotation(hours: number, locale: Locale): string {
  if (hours < 48) return `${Math.round(hours)} ${t(locale, "hours")}`;
  return `${round1(hours / 24)} ${t(locale, "days")}`;
}

function typeLabel(type: BodyType, locale: Locale): string {
  if (type === "star") return t(locale, "typeStar");
  if (type === "planet") return t(locale, "typePlanet");
  return t(locale, "typeMoon");
}

/** Live clock row in the visitor's own time zone — shown for Earth only. */
function LocalTimeRow({ locale }: { locale: Locale }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const time = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return <FactRow label={t(locale, "localTime")} value={`${time} (${zone})`} />;
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact-row">
      <span className="fact-label">{label}</span>
      <span className="fact-value">{value}</span>
    </div>
  );
}

export function InfoPanel({ body, model, locale }: Props) {
  const moons = body.type === "planet" ? model.childrenOf(body.id) : [];
  const distanceLabel =
    body.type === "moon" && body.parentId !== null
      ? t(locale, "distanceFromParent", {
          parent: model.byId(body.parentId)?.name ?? body.parentId,
        })
      : t(locale, "distanceFromSun");

  return (
    <div className="info-panel">
      <div className="info-card">
        <header className="info-header">
          <h1 className="info-name">{body.name}</h1>
          <span className="info-badge" style={{ color: body.color }}>
            {typeLabel(body.type, locale)}
          </span>
        </header>

        <p className="info-description">{body.info.description}</p>

        <div className="fact-list">
          <FactRow label={t(locale, "composition")} value={body.info.composition} />
          <FactRow label={t(locale, "radius")} value={`${formatInteger(body.radiusKm)} km`} />
          {body.orbitalPeriodDays !== null && (
            <FactRow
              label={t(locale, "orbitalPeriod")}
              value={humanizeOrbitalPeriod(body.orbitalPeriodDays, locale)}
            />
          )}
          <FactRow
            label={t(locale, "dayLength")}
            value={humanizeRotation(body.rotationPeriodHours, locale)}
          />
          {body.semiMajorAxisKm !== null && (
            <FactRow
              label={distanceLabel}
              value={`${formatInteger(body.semiMajorAxisKm)} km`}
            />
          )}
          {moons.length > 0 && (
            <FactRow label={t(locale, "moons")} value={moons.map((m) => m.name).join(", ")} />
          )}
          {body.id === "earth" && <LocalTimeRow locale={locale} />}
        </div>

        <hr className="info-rule" />
        <p className="info-funfact">{body.info.funFact}</p>
      </div>
    </div>
  );
}
