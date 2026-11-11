// src/components/DirectivesView.tsx
import React from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Coins,
  Cpu,
  Hexagon,
  Shield,
  Target,
} from 'lucide-react';
import { FACTION_MENU_LABELS } from '../data/factionIdentityCatalog';
import { GLOBAL_UI, getFactionTheme } from '../data/themeConfig';
import {
  FactionId,
  FactionInfo,
  HardSciFiAchievement,
  ModuleTab,
  OperationalDirective,
} from '../types/game';
import { TutorialBeacon } from './OnboardingTutorialOverlay';

export interface DirectivesViewProps {
  factionId: FactionId;
  currentFaction: FactionInfo;
  directives: OperationalDirective[];
  achievements: HardSciFiAchievement[];
  onClaimDirective: (directiveId: string) => void;
  onNavigateTab: (tab: ModuleTab) => void;
  onOpenForgeChassis?: () => void;
  isTutorialActive?: boolean;
}

export const DirectivesView: React.FC<DirectivesViewProps> = ({
  factionId,
  currentFaction,
  directives,
  achievements,
  onClaimDirective,
  onNavigateTab,
  onOpenForgeChassis,
  isTutorialActive = false,
}) => {
  const theme = getFactionTheme(currentFaction.name);
  const menuLabels =
    FACTION_MENU_LABELS[factionId] || FACTION_MENU_LABELS.valari;

  const completedDirectivesCount = directives.filter((d) => d.isClaimed).length;
  const readyToClaimCount = directives.filter(
    (d) => d.isCompleted && !d.isClaimed
  ).length;
  const unlockedAchievementsCount = achievements.filter(
    (a) => a.unlocked
  ).length;

  const renderFactionIcon = (cls = 'w-5 h-5') => {
    if (factionId === 'valari') return <Shield className={cls} />;
    if (factionId === 'skithid') return <Hexagon className={cls} />;
    return <Cpu className={cls} />;
  };

  return (
    <section
      aria-label={menuLabels.directivesLabel}
      className="w-full flex flex-col gap-5 text-slate-200 select-none animate-in fade-in duration-300"
    >
      {/* CABECERA DE DIRECTIVAS E HITOS */}
      <header
        className={`p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${GLOBAL_UI.glass.panel}`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl bg-[#182232]/80 border ${theme.accentBorder} flex items-center justify-center shrink-0 shadow-md`}
          >
            {renderFactionIcon(`w-6 h-6 ${theme.accentText}`)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
              Misiones Guiadas y Telemetría de Progreso
            </span>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100 uppercase tracking-wide">
              {menuLabels.directivesLabel}
            </h1>
            <p className="text-[13px] sm:text-sm text-slate-300 mt-0.5">
              Completa encargos prioritarios para financiar la Ciudadela con
              Créditos (₡) y registra tus hitos tácticos de mando.
            </p>
          </div>
        </div>

        {/* TELEMETRÍA RESUMEN */}
        <div className="flex flex-wrap items-center gap-3">
          {readyToClaimCount > 0 && (
            <div className="px-4 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-400/50 flex flex-col items-end font-mono shadow-[0_0_16px_rgba(16,185,129,0.2)]">
              <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold">
                Recompensas Listas
              </span>
              <span className="text-base font-bold text-white tabular-nums">
                {readyToClaimCount}{' '}
                {readyToClaimCount === 1 ? 'Directiva' : 'Directivas'}
              </span>
            </div>
          )}

          <div
            className={`px-4 py-2.5 flex flex-col items-end font-mono ${GLOBAL_UI.glass.subcard}`}
          >
            <span className="text-xs uppercase tracking-wider text-slate-400">
              Directivas Completadas
            </span>
            <span className="text-base font-bold text-slate-100 tabular-nums">
              {completedDirectivesCount} / {directives.length}
            </span>
          </div>

          <div
            className={`px-4 py-2.5 flex flex-col items-end font-mono ${GLOBAL_UI.glass.subcard}`}
          >
            <span className="text-xs uppercase tracking-wider text-slate-400">
              Hitos Registrados
            </span>
            <span className="text-base font-bold text-slate-100 tabular-nums">
              {unlockedAchievementsCount} / {achievements.length}
            </span>
          </div>
        </div>
      </header>

      {/* GRILLA DE 12 COLUMNAS: 6 COLS DIRECTIVAS + 6 COLS HITOS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* COLUMNA 1 (6 COLS): DIRECTIVAS OPERATIVAS GUIADAS [BALIZA 1] */}
        <div
          className={`xl:col-span-6 p-5 flex flex-col justify-between gap-4 relative ${GLOBAL_UI.glass.panel}`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Target className={`w-5 h-5 ${theme.accentText}`} />
                <h2 className="text-[15px] sm:text-base font-display font-bold uppercase tracking-wider text-slate-100">
                  Directivas Operativas (Misiones Guiadas)
                </h2>
              </div>
              <TutorialBeacon
                stepNumber={1}
                label="Misiones Guiadas"
                isActive={isTutorialActive}
                factionId={factionId}
              />
            </div>

            <div className="flex flex-col gap-3">
              {directives.map((dir) => {
                const canClaim = dir.isCompleted && !dir.isClaimed;
                return (
                  <div
                    key={dir.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col gap-2.5 ${
                      canClaim
                        ? 'bg-emerald-950/30 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                        : dir.isClaimed
                          ? 'bg-[#141C2B]/45 border-white/8 opacity-75'
                          : 'bg-[#182232]/70 border-slate-300/[0.14]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-mono font-bold uppercase tracking-wider ${
                          dir.isClaimed
                            ? 'text-emerald-300'
                            : canClaim
                              ? 'text-emerald-200'
                              : 'text-slate-300'
                        }`}
                      >
                        {dir.code}
                      </span>

                      <span className="px-3 py-0.5 rounded-lg bg-black/50 border border-amber-400/30 font-mono text-[13px] font-bold text-amber-300 flex items-center gap-1.5 tabular-nums">
                        <Coins className="w-3.5 h-3.5 shrink-0" />+
                        {dir.rewardCredits} ₡
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-sm sm:text-base font-bold text-slate-100">
                          {dir.title}
                        </span>
                        <p className="text-[13px] text-slate-300 leading-relaxed">
                          {dir.description}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {dir.isClaimed ? (
                          <span className="px-3.5 py-2 rounded-lg bg-emerald-950/50 border border-emerald-500/30 font-mono text-[13px] font-bold text-emerald-200 flex items-center gap-1.5 whitespace-nowrap">
                            <CheckCircle2 className="w-4 h-4" />
                            Completada
                          </span>
                        ) : canClaim ? (
                          <button
                            type="button"
                            onClick={() => onClaimDirective(dir.id)}
                            className="px-4 py-2.5 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-400/60 font-mono text-[13px] font-bold text-emerald-100 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap shadow-md"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Reclamar +{dir.rewardCredits} ₡</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                dir.id === 'dir_upgrade_chassis' &&
                                onOpenForgeChassis
                              ) {
                                onOpenForgeChassis();
                              } else {
                                onNavigateTab(dir.targetTab);
                              }
                            }}
                            className="px-3.5 py-2 rounded-lg bg-[#121926]/95 hover:bg-white/10 border border-slate-300/[0.18] font-mono text-[13px] font-bold text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                          >
                            <span>{dir.actionLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMNA 2 (6 COLS): REGISTROS DE HITOS OPERATIVOS (LOGROS) [BALIZA 2] */}
        <div
          className={`xl:col-span-6 p-5 flex flex-col justify-between gap-4 relative ${GLOBAL_UI.glass.panel}`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Award className={`w-5 h-5 ${theme.accentText}`} />
                <h2 className="text-[15px] sm:text-base font-display font-bold uppercase tracking-wider text-slate-100">
                  Registros de Hitos Operativos (Logros)
                </h2>
              </div>
              <TutorialBeacon
                stepNumber={2}
                label="Hitos de Mando"
                isActive={isTutorialActive}
                factionId={factionId}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {achievements.map((ach) => {
                const pct = Math.min(
                  100,
                  Math.round((ach.progress / Math.max(1, ach.target)) * 100)
                );
                return (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                      ach.unlocked
                        ? `bg-[#162234]/90 ${theme.accentBorder}`
                        : 'bg-[#121926]/70 border-slate-300/[0.12]'
                    }`}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                          {ach.code} · {ach.categoryLabel}
                        </span>
                        {ach.unlocked ? (
                          <span
                            className={`px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono font-bold ${theme.accentText} flex items-center gap-1`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            ACTIVO
                          </span>
                        ) : (
                          <span className="text-[13px] font-mono font-bold text-slate-200 tabular-nums">
                            {ach.progress} / {ach.target}
                          </span>
                        )}
                      </div>

                      <span className="text-sm sm:text-[15px] font-bold text-slate-100">
                        {ach.title}
                      </span>

                      <p className="text-[13px] text-slate-300 leading-relaxed">
                        {ach.description}
                      </p>
                    </div>

                    <div className="w-full h-2 rounded-full bg-black/55 border border-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          ach.unlocked ? theme.barFill : 'bg-slate-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
