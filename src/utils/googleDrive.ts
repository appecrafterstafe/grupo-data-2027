// Google Drive Integration Client ID from Grupo Data
export const DEFAULT_CLIENT_ID = '606486196456-m8tc1glftg17p2it5oja2rcrdvkafkm9.apps.googleusercontent.com';
export const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export function getActiveClientId(): string {
  try {
    const saved = localStorage.getItem('gd_custom_client_id');
    return saved?.trim() || DEFAULT_CLIENT_ID;
  } catch {
    return DEFAULT_CLIENT_ID;
  }
}

export function setActiveClientId(id: string): void {
  try {
    localStorage.setItem('gd_custom_client_id', id.trim());
    tokenClientInstance = null; // Reset instance so it re-initializes
  } catch (e) {
    console.error(e);
  }
}

let tokenClientInstance: any = null;
let cachedAccessToken: string | null = null;

export function initGoogleDriveAuth(
  clientId?: string,
  onTokenReceived?: (token: string) => void
): any {
  if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
    return null;
  }

  const effectiveId = clientId || getActiveClientId();

  try {
    tokenClientInstance = window.google.accounts.oauth2.initTokenClient({
      client_id: effectiveId,
      scope: SCOPES,
      callback: (tokenResponse: any) => {
        if (tokenResponse.error) {
          console.error('Google Auth Error:', tokenResponse);
          return;
        }
        if (tokenResponse.access_token) {
          cachedAccessToken = tokenResponse.access_token;
          if (onTokenReceived) {
            onTokenReceived(tokenResponse.access_token);
          }
        }
      },
    });
    return tokenClientInstance;
  } catch (err) {
    console.error('Error initializing Google Token Client:', err);
    return null;
  }
}

export function requestGoogleAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services no está cargado.'));
      return;
    }

    if (!tokenClientInstance) {
      initGoogleDriveAuth();
    }

    if (!tokenClientInstance) {
      reject(new Error('No se pudo inicializar el cliente de Google OAuth.'));
      return;
    }

    tokenClientInstance.callback = (response: any) => {
      if (response.error) {
        reject(new Error(`Error de autenticación Google: ${response.error_description || response.error}`));
        return;
      }
      cachedAccessToken = response.access_token;
      resolve(response.access_token);
    };

    tokenClientInstance.requestAccessToken({ prompt: '' });
  });
}

export async function uploadPdfToDrive(
  pdfBlob: Blob,
  filename: string,
  accessToken: string,
  folderId?: string
): Promise<{ id: string; name: string }> {
  const metadata: any = {
    name: filename,
    mimeType: 'application/pdf',
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', pdfBlob);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: new Headers({ Authorization: `Bearer ${accessToken}` }),
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en Google Drive API (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result;
}
