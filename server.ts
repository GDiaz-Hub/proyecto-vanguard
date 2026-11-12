import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TesterFeedbackEntry {
  id: string;
  author: string;
  factionId: string;
  factionName: string;
  category: 'combate' | 'balance' | 'interfaz' | 'bug' | 'sugerencia';
  rating: number;
  message: string;
  locationName?: string;
  characterLevel?: number;
  createdAt: string;
}

const FEEDBACK_JSON_PATH = path.resolve(
  __dirname,
  'COMENTARIOS_USUARIOS_VANGUARD.json'
);
const FEEDBACK_MD_PATH = path.resolve(
  __dirname,
  'COMENTARIOS_USUARIOS_VANGUARD.md'
);

const CATEGORY_LABELS: Record<TesterFeedbackEntry['category'], string> = {
  combate: 'Combate y Efectos Visuales',
  balance: 'Balance, Economía y Progresión',
  interfaz: 'Interfaz y Experiencia (UI/UX)',
  bug: 'Reporte de Error / Bug',
  sugerencia: 'Idea / Sugerencia General',
};

function readFeedbackEntries(): TesterFeedbackEntry[] {
  try {
    if (!fs.existsSync(FEEDBACK_JSON_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(FEEDBACK_JSON_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function syncFeedbackMarkdown(entries: TesterFeedbackEntry[]): void {
  const lines: string[] = [
    '# BUZÓN DE COMENTARIOS DE USUARIOS DE PRUEBA — PROYECTO VANGUARD',
    '',
    '> **PROPÓSITO DE ESTE ARCHIVO:**',
    '> Este documento se actualiza automáticamente cada vez que un usuario de prueba deja un comentario desde el botón **Comentarios** del encabezado de la aplicación.',
    `> - **Total de comentarios registrados:** \`${entries.length}\``,
    '',
    '---',
    '',
  ];

  if (entries.length === 0) {
    lines.push(
      '_Aún no se han registrado comentarios de usuarios de prueba._',
      ''
    );
  } else {
    entries.forEach((item, index) => {
      const num = entries.length - index;
      const categoryLabel =
        CATEGORY_LABELS[item.category] || item.category.toUpperCase();
      const stars = '★'.repeat(Math.max(1, Math.min(5, item.rating))) +
        '☆'.repeat(Math.max(0, 5 - Math.max(1, Math.min(5, item.rating))));
      lines.push(
        `## Comentario #${num} — ${item.author} (${categoryLabel})`,
        `- **Fecha y Hora (UTC):** \`${item.createdAt}\``,
        `- **Autor / Tester:** **${item.author}**`,
        `- **Facción en Prueba:** \`${item.factionName}\` (\`${item.factionId}\`) · Nivel de Héroe: \`Nv.${item.characterLevel || 1}\` · Sector: \`${item.locationName || 'N/A'}\``,
        `- **Categoría:** ${categoryLabel}`,
        `- **Valoración:** \`${stars}\` (${item.rating}/5)`,
        `- **Mensaje del Usuario:**`,
        `  > ${item.message.replace(/\n/g, '\n  > ')}`,
        '',
        '---',
        ''
      );
    });
  }

  const mdContent = lines.join('\n');
  try {
    fs.writeFileSync(FEEDBACK_MD_PATH, mdContent, 'utf-8');
  } catch {
    // Ignorar errores de escritura en entornos de solo lectura
  }
}

function writeFeedbackEntries(entries: TesterFeedbackEntry[]): void {
  try {
    fs.writeFileSync(
      FEEDBACK_JSON_PATH,
      JSON.stringify(entries, null, 2),
      'utf-8'
    );
  } catch {
    // Ignorar si el sistema de archivos es de solo lectura
  }
  syncFeedbackMarkdown(entries);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '256kb' }));

  // Inicializar archivos de comentarios si no existen
  const initialEntries = readFeedbackEntries();
  if (!fs.existsSync(FEEDBACK_JSON_PATH)) {
    writeFeedbackEntries(initialEntries);
  }

  app.get('/api/feedback', (_req, res) => {
    const entries = readFeedbackEntries();
    res.json({ comments: entries });
  });

  app.post('/api/feedback', (req, res) => {
    const body = req.body || {};
    const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';
    if (!rawMessage) {
      res.status(400).json({ error: 'El comentario no puede estar vacío.' });
      return;
    }

    const rawAuthor =
      typeof body.author === 'string' && body.author.trim().length > 0
        ? body.author.trim().slice(0, 40)
        : 'Comandante de Prueba';

    const validCategories = [
      'combate',
      'balance',
      'interfaz',
      'bug',
      'sugerencia',
    ] as const;
    const category: TesterFeedbackEntry['category'] = validCategories.includes(
      body.category
    )
      ? body.category
      : 'sugerencia';

    const ratingNum = Number(body.rating);
    const rating = Number.isFinite(ratingNum)
      ? Math.max(1, Math.min(5, Math.round(ratingNum)))
      : 5;

    const newEntry: TesterFeedbackEntry = {
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      author: rawAuthor,
      factionId: typeof body.factionId === 'string' ? body.factionId : 'valari',
      factionName:
        typeof body.factionName === 'string' ? body.factionName : 'Valari',
      category,
      rating,
      message: rawMessage.slice(0, 1500),
      locationName:
        typeof body.locationName === 'string' ? body.locationName : undefined,
      characterLevel:
        typeof body.characterLevel === 'number' ? body.characterLevel : 1,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    const current = readFeedbackEntries();
    const updated = [newEntry, ...current];
    writeFeedbackEntries(updated);

    res.status(201).json({ comment: newEntry, comments: updated });
  });

  app.delete('/api/feedback/:id', (req, res) => {
    const targetId = req.params.id;
    const current = readFeedbackEntries();
    const updated = current.filter((item) => item.id !== targetId);
    writeFeedbackEntries(updated);
    res.json({ comments: updated });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vanguard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
