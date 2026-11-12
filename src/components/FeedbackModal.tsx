// src/components/FeedbackModal.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  Bug,
  CheckCircle2,
  Crosshair,
  Layout,
  Lightbulb,
  MessageSquarePlus,
  Scale,
  Send,
  Star,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { getFactionTheme } from '../data/themeConfig';
import { FactionId } from '../types/game';

export type FeedbackCategory =
  | 'combate'
  | 'balance'
  | 'interfaz'
  | 'bug'
  | 'sugerencia';

export interface TesterFeedbackItem {
  id: string;
  author: string;
  factionId: string;
  factionName: string;
  category: FeedbackCategory;
  rating: number;
  message: string;
  locationName?: string;
  characterLevel?: number;
  createdAt: string;
}

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  factionId: FactionId;
  factionName: string;
  playerName: string;
  characterLevel: number;
  locationName: string;
}

const LOCAL_FEEDBACK_STORAGE_KEY = 'vanguard_tester_feedback_v1';

const CATEGORY_CONFIG: {
  id: FeedbackCategory;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
  badgeClass: string;
}[] = [
  {
    id: 'combate',
    label: 'Combate y Efectos',
    shortLabel: 'Combate',
    icon: Crosshair,
    badgeClass: 'bg-amber-500/15 border-amber-400/40 text-amber-200',
  },
  {
    id: 'balance',
    label: 'Balance y Economía',
    shortLabel: 'Balance',
    icon: Scale,
    badgeClass: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200',
  },
  {
    id: 'interfaz',
    label: 'Interfaz / Usabilidad',
    shortLabel: 'Interfaz',
    icon: Layout,
    badgeClass: 'bg-sky-500/15 border-sky-400/40 text-sky-200',
  },
  {
    id: 'bug',
    label: 'Reporte de Error',
    shortLabel: 'Bug / Error',
    icon: Bug,
    badgeClass: 'bg-rose-500/15 border-rose-400/40 text-rose-200',
  },
  {
    id: 'sugerencia',
    label: 'Idea / Sugerencia',
    shortLabel: 'Sugerencia',
    icon: Lightbulb,
    badgeClass: 'bg-violet-500/15 border-violet-400/40 text-violet-200',
  },
];

function readLocalFallbackFeedback(): TesterFeedbackItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalFallbackFeedback(items: TesterFeedbackItem[]): void {
  try {
    localStorage.setItem(LOCAL_FEEDBACK_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  factionId,
  factionName,
  playerName,
  characterLevel,
  locationName,
}) => {
  const [authorDraft, setAuthorDraft] = useState<string>(playerName || '');
  const [selectedCategory, setSelectedCategory] =
    useState<FeedbackCategory>('combate');
  const [rating, setRating] = useState<number>(5);
  const [messageDraft, setMessageDraft] = useState<string>('');
  const [comments, setComments] = useState<TesterFeedbackItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<
    'ALL' | FeedbackCategory
  >('ALL');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const theme = getFactionTheme(factionName);

  const fetchFeedbackList = useCallback(async () => {
    setIsLoadingFeed(true);
    try {
      const response = await fetch('/api/feedback');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.comments)) {
          setComments(data.comments);
          saveLocalFallbackFeedback(data.comments);
          setIsLoadingFeed(false);
          return;
        }
      }
      setComments(readLocalFallbackFeedback());
    } catch {
      setComments(readLocalFallbackFeedback());
    } finally {
      setIsLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (!authorDraft && playerName && playerName !== 'Comandante') {
        setAuthorDraft(playerName);
      }
      fetchFeedbackList();
      setStatusNotice(null);
    }
  }, [isOpen, playerName, authorDraft, fetchFeedbackList]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = messageDraft.trim();
    if (!trimmedMessage) {
      setStatusNotice({
        type: 'error',
        text: 'Escribe tu comentario o sugerencia antes de enviar.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusNotice(null);

    const payload = {
      author: authorDraft.trim() || playerName || 'Tester Anónimo',
      factionId,
      factionName,
      category: selectedCategory,
      rating,
      message: trimmedMessage,
      locationName,
      characterLevel,
    };

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.comments)) {
          setComments(data.comments);
          saveLocalFallbackFeedback(data.comments);
        }
      } else {
        throw new Error('Fallback local');
      }
    } catch {
      const fallbackEntry: TesterFeedbackItem = {
        id: `local-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      const next = [fallbackEntry, ...readLocalFallbackFeedback()];
      setComments(next);
      saveLocalFallbackFeedback(next);
    } finally {
      setIsSubmitting(false);
      setMessageDraft('');
      setStatusNotice({
        type: 'success',
        text: '¡Gracias! Tu comentario quedó registrado en el buzón del proyecto.',
      });
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      const response = await fetch(`/api/feedback/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.comments)) {
          setComments(data.comments);
          saveLocalFallbackFeedback(data.comments);
          setConfirmDeleteId(null);
          return;
        }
      }
    } catch {
      // Fallback local delete
    }
    const next = comments.filter((c) => c.id !== id);
    setComments(next);
    saveLocalFallbackFeedback(next);
    setConfirmDeleteId(null);
  };

  const visibleComments =
    filterCategory === 'ALL'
      ? comments
      : comments.filter((c) => c.category === filterCategory);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#0B111D]/98 border border-sky-400/35 shadow-[0_24px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
      >
        {/* Barra superior de acento */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
          style={{
            background:
              'linear-gradient(90deg, transparent, #38BDF8, #F59E0B, transparent)',
          }}
        />

        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#070B13]/90 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
              <MessageSquarePlus className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-sky-300">
                  Canal de Pruebas · Feedback Directo
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
                  {comments.length} {comments.length === 1 ? 'registro' : 'registros'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-white tracking-wide">
                Comentarios y Observaciones de Prueba
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo dividido: Formulario a la izquierda + Muro de comentarios a la derecha */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COLUMNA IZQUIERDA: FORMULARIO DE ENVÍO */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-5 flex flex-col gap-4 bg-[#101827]/90 border border-white/10 rounded-2xl p-4 sm:p-5 self-start"
          >
            <div className="flex flex-col gap-1 border-b border-white/10 pb-3">
              <h3 className="text-sm font-display font-bold text-slate-100 uppercase tracking-wider">
                Dejar un Comentario
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tus observaciones sobre efectos de combate, balance, interfaz o errores quedan guardadas directamente para revisión del creador.
              </p>
            </div>

            {/* Contexto automático de la sesión */}
            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-slate-400">Sesión actual:</span>
              <span className={`font-bold ${theme.accentText}`}>
                {factionName} · Nv.{characterLevel} · {locationName}
              </span>
            </div>

            {/* Nombre o Alias */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>Tu Nombre o Alias (opcional)</span>
              </label>
              <input
                type="text"
                value={authorDraft}
                onChange={(e) => setAuthorDraft(e.target.value)}
                maxLength={40}
                placeholder="Ej. Tester_01 o tu nombre"
                className="w-full px-3.5 py-2 rounded-xl bg-[#080D16] border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60"
              />
            </div>

            {/* Categoría del comentario */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                Área o Categoría
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5">
                {CATEGORY_CONFIG.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-2 rounded-xl border text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer text-left ${
                        isSelected
                          ? cat.badgeClass + ' shadow-sm'
                          : 'bg-[#080D16]/70 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{cat.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Valoración rápida 1-5 */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#080D16]/80 border border-white/10">
              <span className="text-xs font-mono font-semibold text-slate-300">
                Valoración general:
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title={`${starValue} de 5 estrellas`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        starValue <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Texto del comentario */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                Tu Comentario o Reporte
              </label>
              <textarea
                rows={4}
                value={messageDraft}
                onChange={(e) => setMessageDraft(e.target.value)}
                maxLength={1500}
                placeholder="Describe qué te parecieron los efectos, qué ajustarías, o si encontraste algún detalle a mejorar..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D16] border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 resize-y leading-relaxed select-text"
              />
              <div className="flex justify-end text-[11px] font-mono text-slate-500">
                {messageDraft.length}/1500
              </div>
            </div>

            {statusNotice && (
              <div
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                  statusNotice.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-400/40 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-400/40 text-rose-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusNotice.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-500/25 hover:bg-sky-500/35 border border-sky-400/60 text-sky-100 hover:text-white font-display font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(56,189,248,0.2)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting ? 'Enviando Comentario...' : 'Enviar Comentario'}
              </span>
            </button>
          </form>

          {/* COLUMNA DERECHA: HISTORIAL DE COMENTARIOS DE PRUEBA */}
          <div className="lg:col-span-7 flex flex-col gap-3.5 min-h-[320px]">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Comentarios Registrados ({visibleComments.length})
              </span>

              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFilterCategory('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-colors cursor-pointer ${
                    filterCategory === 'ALL'
                      ? 'bg-white/15 border-white/30 text-white'
                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Todos
                </button>
                {CATEGORY_CONFIG.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilterCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-colors cursor-pointer ${
                      filterCategory === cat.id
                        ? cat.badgeClass
                        : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingFeed ? (
              <div className="flex-1 flex items-center justify-center py-12 text-sm font-mono text-slate-400">
                Cargando comentarios de prueba...
              </div>
            ) : visibleComments.length === 0 ? (
              <div className="flex-1 rounded-2xl bg-[#101827]/55 border border-white/10 p-8 flex flex-col items-center justify-center text-center gap-2">
                <MessageSquarePlus className="w-8 h-8 text-slate-500" />
                <p className="text-sm font-display font-semibold text-slate-300">
                  Aún no hay comentarios en esta categoría
                </p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Sé el primero en dejar tus impresiones usando el formulario de la izquierda.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[54vh] overflow-y-auto pr-1">
                {visibleComments.map((item) => {
                  const catMeta =
                    CATEGORY_CONFIG.find((c) => c.id === item.category) ||
                    CATEGORY_CONFIG[4];
                  const CatIcon = catMeta.icon;
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl bg-[#101827]/90 border border-white/12 p-4 flex flex-col gap-2.5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-display font-bold text-white">
                            {item.author}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-semibold inline-flex items-center gap-1 ${catMeta.badgeClass}`}
                          >
                            <CatIcon className="w-3 h-3" />
                            <span>{catMeta.shortLabel}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
                            {item.factionName} · Nv.{item.characterLevel || 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= item.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {item.createdAt}
                          </span>

                          {confirmDeleteId === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(item.id)}
                                className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-mono font-bold cursor-pointer"
                              >
                                Borrar
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 text-[10px] font-mono cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(item.id)}
                              className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-300 transition-colors cursor-pointer"
                              title="Eliminar comentario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
                        {item.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
