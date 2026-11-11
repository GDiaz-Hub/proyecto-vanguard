import { getCachedAccessToken } from './workspaceAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export const uploadSaveToDrive = async (
  fileName: string,
  content: string,
  description: string = 'Vanguard RPG Cloud Backup'
): Promise<DriveFileItem> => {
  const token = getCachedAccessToken();
  if (!token) throw new Error('No hay sesión activa con Google Workspace');

  const metadata = {
    name: fileName,
    description,
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', new Blob([content], { type: 'application/json' }));

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error subiendo a Google Drive: ${err}`);
  }

  return await res.json();
};

export const listVanguardDriveFiles = async (): Promise<DriveFileItem[]> => {
  const token = getCachedAccessToken();
  if (!token) throw new Error('No hay sesión activa con Google Workspace');

  const query = encodeURIComponent("trashed = false and (name contains 'Vanguard' or name contains 'vanguard')");
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,webViewLink)&orderBy=modifiedTime desc`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error consultando Google Drive: ${err}`);
  }

  const data = await res.json();
  return data.files || [];
};

export const createVanguardIntelDoc = async (
  title: string,
  bodyContent: string
): Promise<{ documentId: string; title: string }> => {
  const token = getCachedAccessToken();
  if (!token) throw new Error('No hay sesión activa con Google Workspace');

  // 1. Crear documento vacío en Docs
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Error creando Google Doc: ${err}`);
  }

  const doc = await createRes.json();

  // 2. Insertar contenido inicial
  const updateRes = await fetch(
    `https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: bodyContent,
            },
          },
        ],
      }),
    }
  );

  if (!updateRes.ok) {
    console.warn('Documento creado pero falló la inserción del cuerpo inicial');
  }

  return { documentId: doc.documentId, title: doc.title };
};

export const createVanguardFeedbackForm = async (
  title: string = 'Vanguard: Informe Táctico y Feedback de Comandante'
): Promise<{ formId: string; responderUri: string }> => {
  const token = getCachedAccessToken();
  if (!token) throw new Error('No hay sesión activa con Google Workspace');

  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title,
        documentTitle: title,
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Error creando Google Form: ${err}`);
  }

  const form = await createRes.json();

  // Agregar preguntas modelo al formulario
  await fetch(`https://forms.googleapis.com/v1/forms/${form.formId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          createItem: {
            item: {
              title: '¿Qué facción comandas actualmente?',
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: 'RADIO',
                    options: [
                      { value: 'Valari (Bastión de Hierro)' },
                      { value: 'Skithid (El Enjambre)' },
                      { value: 'Cygnus (El Nexo)' },
                    ],
                  },
                },
              },
            },
            location: { index: 0 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Informe de Incursión / Feedback Táctico',
              questionItem: {
                question: {
                  required: false,
                  textQuestion: { paragraph: true },
                },
              },
            },
            location: { index: 1 },
          },
        },
      ],
    }),
  });

  return { formId: form.formId, responderUri: form.responderUri };
};
