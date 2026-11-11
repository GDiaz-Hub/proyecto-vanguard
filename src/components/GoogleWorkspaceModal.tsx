// src/components/GoogleWorkspaceModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Cloud,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Upload,
  RefreshCw,
  ExternalLink,
  X,
  FilePlus,
  HelpCircle,
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  logoutWorkspace,
  getCachedAccessToken,
} from '../services/workspaceAuth';
import {
  uploadSaveToDrive,
  listVanguardDriveFiles,
  createVanguardIntelDoc,
  createVanguardFeedbackForm,
  type DriveFileItem,
} from '../services/workspaceDriveDocsForms';
import { FactionId } from '../types/game';
import { getFactionTheme, GLOBAL_UI } from '../data/themeConfig';

export interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  factionId: FactionId;
  currentSaveJson: string;
  playerName: string;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  factionId,
  currentSaveJson,
  playerName,
}) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [createdDocLink, setCreatedDocLink] = useState<string | null>(null);
  const [createdFormLink, setCreatedFormLink] = useState<string | null>(null);

  const theme = getFactionTheme(factionId);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (user) => {
        setUserEmail(user.email);
        setUserName(user.displayName);
        loadDriveFiles();
      },
      () => {
        setUserEmail(null);
        setUserName(null);
        setDriveFiles([]);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  const loadDriveFiles = async () => {
    try {
      const files = await listVanguardDriveFiles();
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUserEmail(result.user.email);
        setUserName(result.user.displayName);
        setStatusMessage({ text: 'Conexión exitosa con Google Workspace', type: 'success' });
        await loadDriveFiles();
      }
    } catch (err: any) {
      setStatusMessage({ text: `Error al conectar: ${err.message || 'Operación cancelada'}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    const confirmed = window.confirm('¿Desconectar Google Workspace de Vanguard?');
    if (!confirmed) return;

    await logoutWorkspace();
    setUserEmail(null);
    setUserName(null);
    setDriveFiles([]);
    setStatusMessage({ text: 'Sesión de Workspace cerrada', type: 'info' });
  };

  const handleBackupToDrive = async () => {
    const confirmed = window.confirm(
      '¿Deseas respaldar tu partida actual de Vanguard en tu Google Drive?'
    );
    if (!confirmed) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Vanguard_Save_${playerName}_${factionId}_${timestamp}.json`;
      const uploaded = await uploadSaveToDrive(filename, currentSaveJson, `Copia de seguridad táctica de Vanguard - ${playerName}`);
      setStatusMessage({
        text: `Partida respaldada en Google Drive como "${uploaded.name}"`,
        type: 'success',
      });
      await loadDriveFiles();
    } catch (err: any) {
      setStatusMessage({ text: `Error al respaldar en Drive: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIntelDoc = async () => {
    const confirmed = window.confirm(
      '¿Generar un nuevo informe de inteligencia táctica en Google Docs con los datos actuales?'
    );
    if (!confirmed) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const title = `Informe Táctico Vanguard - Comandante ${playerName} (${factionId.toUpperCase()})`;
      const body = `REPORTE DE ESTADO MAYOR - PROYECTO VANGUARD\n` +
        `Fecha estelar: ${new Date().toLocaleString()}\n` +
        `Comandante: ${playerName}\n` +
        `Facción: ${factionId.toUpperCase()}\n` +
        `Plataforma: Nexus Orbital Vanguard\n\n` +
        `DOCUMENTACIÓN DE OPERACIONES:\n` +
        `- Estado de infraestructura sincronizado.\n` +
        `- Datos guardados en la nube institucional.\n\n` +
        `Fin de la transmisión clasificada.`;

      const doc = await createVanguardIntelDoc(title, body);
      const link = `https://docs.google.com/document/d/${doc.documentId}/edit`;
      setCreatedDocLink(link);
      setStatusMessage({
        text: `Documento de inteligencia creado con éxito: "${doc.title}"`,
        type: 'success',
      });
    } catch (err: any) {
      setStatusMessage({ text: `Error creando Google Doc: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFeedbackForm = async () => {
    const confirmed = window.confirm(
      '¿Crear un Formulario de Google Forms para recopilar feedback táctico e informes de combate?'
    );
    if (!confirmed) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const form = await createVanguardFeedbackForm(`Vanguard: Feedback de Incursión - ${playerName}`);
      setCreatedFormLink(form.responderUri);
      setStatusMessage({
        text: 'Formulario de Google Forms creado y listo para recibir respuestas.',
        type: 'success',
      });
    } catch (err: any) {
      setStatusMessage({ text: `Error creando Google Form: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isConnected = !!userEmail;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-white/20 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] ${GLOBAL_UI.glass.panel}`}
      >
        {/* HEADER */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border border-white/10 ${theme.accentBg}`}>
              <Cloud className={`w-6 h-6 ${theme.accentText}`} />
            </div>
            <div>
              <h2 className="text-lg font-display font-black text-white tracking-wider uppercase">
                Enlace Google Workspace
              </h2>
              <p className="text-xs text-slate-400">
                Google Drive · Google Docs · Google Forms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* BANNER DE ESTADO DE CONEXIÓN */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isConnected
              ? 'bg-emerald-950/40 border-emerald-500/30'
              : 'bg-blue-950/30 border-blue-500/20'
          }`}>
            <div className="flex items-center gap-3">
              {isConnected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Cloud className="w-5 h-5 text-sky-400 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider text-slate-300">
                  {isConnected ? 'Cuenta Vinculada' : 'Estado de Conexión'}
                </span>
                <span className="text-sm font-bold text-white">
                  {isConnected ? `${userName || 'Comandante'} (${userEmail})` : 'Google Workspace desconectado'}
                </span>
              </div>
            </div>

            {isConnected ? (
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-950/40 hover:bg-red-900/50 text-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Desconectar
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Cloud className="w-4 h-4" />
                {isLoading ? 'Conectando...' : 'Iniciar Sesión con Google'}
              </button>
            )}
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-red-950/60 border-red-500/50 text-red-300'
                  : 'bg-blue-950/60 border-blue-500/50 text-blue-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* ACCIONES DE WORKSPACE (DISPONIBLES TRAS INICIAR SESIÓN) */}
          {isConnected && (
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Operaciones Disponibles
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* BOTÓN DRIVE */}
                <button
                  onClick={handleBackupToDrive}
                  disabled={isLoading}
                  className="p-4 rounded-xl border border-white/10 bg-black/40 hover:border-amber-500/40 hover:bg-amber-950/20 text-left flex flex-col justify-between gap-3 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <Cloud className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <Upload className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase">Google Drive</h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Subir respaldo completo de partida (JSON).
                    </p>
                  </div>
                </button>

                {/* BOTÓN DOCS */}
                <button
                  onClick={handleCreateIntelDoc}
                  disabled={isLoading}
                  className="p-4 rounded-xl border border-white/10 bg-black/40 hover:border-sky-500/40 hover:bg-sky-950/20 text-left flex flex-col justify-between gap-3 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <FileText className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                    <FilePlus className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase">Google Docs</h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Generar reporte de inteligencia táctica.
                    </p>
                  </div>
                </button>

                {/* BOTÓN FORMS */}
                <button
                  onClick={handleCreateFeedbackForm}
                  disabled={isLoading}
                  className="p-4 rounded-xl border border-white/10 bg-black/40 hover:border-purple-500/40 hover:bg-purple-950/20 text-left flex flex-col justify-between gap-3 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <FileSpreadsheet className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase">Google Forms</h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Crear formulario de reporte de incursión.
                    </p>
                  </div>
                </button>
              </div>

              {/* ENLACES A RECURSOS CREADOS */}
              {(createdDocLink || createdFormLink) && (
                <div className="p-4 rounded-xl border border-white/10 bg-black/50 flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400">
                    Accesos Rápidos a Recursos Generados:
                  </span>
                  {createdDocLink && (
                    <a
                      href={createdDocLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-400 hover:underline flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" /> Abrir Documento en Google Docs <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {createdFormLink && (
                    <a
                      href={createdFormLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:underline flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Abrir Formulario en Google Forms <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* LISTA DE ARCHIVOS VANGUARD EN DRIVE */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Respaldos Encontrados en Google Drive ({driveFiles.length})
                  </span>
                  <button
                    onClick={loadDriveFiles}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="Actualizar lista de Drive"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {driveFiles.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-black/30 rounded-lg border border-white/5">
                    No se encontraron archivos de respaldo previos en tu Google Drive. Usa el botón "Google Drive" para crear uno.
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto flex flex-col gap-1.5 pr-1">
                    {driveFiles.map((f) => (
                      <div
                        key={f.id}
                        className="p-2.5 rounded-lg border border-white/10 bg-black/30 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Cloud className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-slate-200 truncate font-mono">{f.name}</span>
                        </div>
                        {f.webViewLink && (
                          <a
                            href={f.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white p-1"
                            title="Ver en Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!isConnected && (
            <div className="p-4 rounded-xl border border-white/10 bg-black/40 flex items-start gap-3 text-xs text-slate-400">
              <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p>
                Al conectar tu cuenta de Google Workspace podrás sincronizar tus partidas en la nube de <strong>Google Drive</strong>, exportar informes tácticos en <strong>Google Docs</strong> y crear formularios de feedback en <strong>Google Forms</strong> con permiso de usuario.
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
