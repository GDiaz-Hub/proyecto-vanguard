// src/components/FaccionesView.tsx
import React from 'react';
import {
  ArrowRight,
  Building2,
  Cpu,
  Hexagon,
  Shield,
  Swords,
  UserCheck,
} from 'lucide-react';
import { FACTION_SHOWCASE_CARDS } from '../data/factionIdentityCatalog';
import { FACTIONS } from '../data/gameData';
import { getFactionTheme } from '../data/themeConfig';
import { FactionId, FactionInfo } from '../types/game';

export interface FaccionesViewProps {
  factionId: FactionId;
  currentFaction: FactionInfo;
  onSelectFaction: (id: FactionId, startWithTutorial?: boolean) => void;
}

const FACTION_ORDER: FactionId[] = ['valari', 'skithid', 'cygnus'];

export const FaccionesView: React.FC<FaccionesViewProps> = ({
  factionId,
  onSelectFaction,
}) => {
  const renderFactionEmblem = (facId: FactionId) => {
    if (facId === 'valari')
      return <Shield className="w-5 h-5 text-amber-300 shrink-0" />;
    if (facId === 'skithid')
      return <Hexagon className="w-5 h-5 text-emerald-300 shrink-0" />;
    return <Cpu className="w-5 h-5 text-blue-300 shrink-0" />;
  };

  const renderPillarIcon = (idx: number, accentClass: string) => {
    if (idx === 0) return <Swords className={`w-4 h-4 shrink-0 ${accentClass}`} />;
    if (idx === 1)
      return <Building2 className={`w-4 h-4 shrink-0 ${accentClass}`} />;
    return <UserCheck className={`w-4 h-4 shrink-0 ${accentClass}`} />;
  };

  return (
    <div className="min-h-screen w-full relative isolate bg-[#0B101A] text-slate-200 flex flex-col justify-center overflow-x-hidden select-none">
      {/* FONDO ATMOSFÉRICO SUTIL */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[620px] h-[620px] rounded-full bg-amber-500/8 blur-[150px]" />
        <div className="absolute top-1/3 right-1/4 w-[620px] h-[620px] rounded-full bg-emerald-500/8 blur-[150px]" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[720px] h-[520px] rounded-full bg-blue-500/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0.25),#0B101A_82%)]" />
      </div>

      <div className="w-full max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col justify-center gap-4">
        {/* PRESENTACIÓN CENTRAL COMPACTA (SIN BARRA SUPERIOR NI BOTÓN REDUNDANTE) */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-1">
          <span className="text-xs font-mono font-bold uppercase tracking-[0.22em] text-amber-300">
            TRES CIVILIZACIONES · TRES FORMAS DE DOMINAR EL SECTOR
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-wide text-white">
            Elige tu Doctrina de Mando
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
            En <strong className="text-slate-100">Vanguard</strong> lideras a un{' '}
            <strong className="text-slate-100">Héroe Comandante</strong> con estilo de combate,
            instalaciones orbitales y equipamiento propios.
          </p>
        </div>

        {/* LÁMINAS DE LAS 3 FACCIONES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 xl:gap-6 items-stretch">
          {FACTION_ORDER.map((id) => {
            const fac = FACTIONS[id];
            const card = FACTION_SHOWCASE_CARDS[id];
            const facTheme = getFactionTheme(fac.name);
            const isSelected = fac.id === factionId;

            const topBorderColor =
              fac.id === 'valari'
                ? 'rgba(245, 158, 11, 0.7)'
                : fac.id === 'skithid'
                  ? 'rgba(16, 185, 129, 0.7)'
                  : 'rgba(59, 130, 246, 0.7)';

            return (
              <article
                key={fac.id}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between bg-[#121926]/85 backdrop-blur-2xl border ${
                  isSelected
                    ? `${facTheme.accentBorder} shadow-[0_14px_40px_rgba(0,0,0,0.85)]`
                    : 'border-slate-300/[0.14] hover:border-slate-200/30 shadow-[0_10px_28px_rgba(0,0,0,0.65)]'
                }`}
              >
                {/* Filete luminoso superior */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2px] z-20"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${topBorderColor}, transparent)`,
                  }}
                />

                <div className="flex flex-col flex-1">
                  {/* RETRATO DEL HÉROE ENCUADRADO DESDE EL BORDE SUPERIOR DEL CASCO/CORONA */}
                  <div className="relative h-60 xl:h-64 w-full bg-[#090D15] overflow-hidden border-b border-slate-300/[0.12]">
                    <img
                      src={fac.portraitPath}
                      alt={fac.portraitAlt}
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${
                        fac.id === 'valari'
                          ? 'object-[50%_7%]'
                          : fac.id === 'skithid'
                            ? 'object-[50%_5%]'
                            : 'object-[50%_3%]'
                      }`}
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#121926] via-[#121926]/75 to-transparent" />

                    {/* Etiqueta unificada: Sector · Mundo Natal */}
                    <div className="absolute top-3 left-3.5 right-3.5 flex items-center justify-end">
                      <span className="px-2.5 py-1 rounded-lg bg-[#0B101A]/90 backdrop-blur-md border border-slate-300/[0.18] text-xs font-mono font-semibold text-slate-100 shadow-md">
                        {card.homeworldLabel}
                      </span>
                    </div>

                    {/* Nombre de la Facción y Arquetipo */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-mono font-semibold uppercase tracking-wider ${facTheme.accentText}`}
                        >
                          {card.archetypeTitle}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-white tracking-wide leading-tight drop-shadow">
                          {fac.name}
                        </h2>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-[#0B101A]/85 backdrop-blur-md border border-slate-300/[0.18] flex items-center justify-center shrink-0 shadow-lg">
                        {renderFactionEmblem(fac.id)}
                      </div>
                    </div>
                  </div>

                  {/* CUERPO NARRATIVO CON ALINEACIÓN HORIZONTAL DE PILARES */}
                  <div className="p-4 xl:p-5 flex flex-col gap-3 flex-1">
                    <blockquote className="px-3.5 py-2 rounded-xl bg-[#182234]/75 border-l-2 border-slate-300/35 text-xs sm:text-[13px] italic text-slate-100 leading-snug">
                      {card.quote}
                    </blockquote>

                    <p className="min-h-[60px] text-xs sm:text-[13px] text-slate-200 leading-relaxed">
                      {card.fantasyPitch}
                    </p>

                    {/* 3 PILARES DE JUEGO ALINEADOS ENTRE LAS 3 TARJETAS */}
                    <div className="grid grid-cols-1 gap-2.5 mt-auto">
                      {card.pillars.map((pillar, idx) => (
                        <div
                          key={pillar.label}
                          className="min-h-[82px] p-3 rounded-xl bg-[#172131]/75 border border-slate-300/[0.12] flex flex-col justify-center gap-1"
                        >
                          <div className="flex items-center gap-2">
                            {renderPillarIcon(idx, facTheme.accentText)}
                            <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
                              {pillar.label}
                            </span>
                            <span className="text-slate-500">·</span>
                            <span className="text-xs sm:text-[13px] font-bold text-slate-100 truncate">
                              {pillar.title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 leading-snug pl-6">
                            {pillar.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BOTÓN ÚNICO DE INICIO */}
                <div className="px-4 pb-4 xl:px-5 xl:pb-5 pt-1">
                  <button
                    type="button"
                    onClick={() => onSelectFaction(fac.id, true)}
                    className={`w-full py-3 px-4 rounded-xl border font-display text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] ${facTheme.primaryButton}`}
                  >
                    <span>Iniciar con {fac.shortName}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};