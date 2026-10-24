import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldAlert, 
  FileCode, 
  Download,
  Terminal,
  Globe,
  Layers,
  KeyRound,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { getActiveClientId, setActiveClientId, DEFAULT_CLIENT_ID } from '../utils/googleDrive';

export const AuditView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<'vercel' | 'mano_obra' | 'presupuesto' | 'orden'>('vercel');
  const [customId, setCustomId] = useState(getActiveClientId());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveClientId(customId);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const vercelJsonCode = `{
  "version": 2,
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}`;

  const manoObraFixSnippet = `// CORRECCIÓN EN mano_obra.html:
// Reemplazar la línea con callback: '' por una función válida
window.addEventListener('load', () => {
    if (window.google && google.accounts) {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse) => {
                if (tokenResponse.access_token) {
                    accessToken = tokenResponse.access_token;
                }
            }
        });
    }
});

// Y en subirPdfACarpeta(), ocultar botones de acción antes de generar:
async function subirPdfACarpeta(folderId, accessToken) {
    const element = document.querySelector('.pdf-container');
    const acciones = document.querySelectorAll('.no-print');
    acciones.forEach(el => el.style.display = 'none'); // <-- Evita que salgan tachos de basura en el PDF
    
    try {
        const opt = {
            margin: 8,
            filename: 'Mano_De_Obra.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
        // ... subir a drive ...
    } finally {
        acciones.forEach(el => el.style.display = ''); // <-- Restaura siempre la vista
    }
}`;

  const presupuestoFixSnippet = `// CORRECCIÓN EN presupuesto.html:
// En subirPdfACarpeta(), ocultar botones de acción para que el PDF no incluya tachos de basura:
async function subirPdfACarpeta(folderId, accessToken) {
    const element = document.querySelector('.pdf-container');
    const acciones = document.querySelectorAll('.no-print');
    acciones.forEach(el => el.style.display = 'none');
    
    try {
        const opt = {
            margin: 8,
            filename: 'Presupuesto.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
        
        const metadata = {
            name: \`Presupuesto_\${document.getElementById('in-numero').value || 'Sin_Numero'}.pdf\`,
            mimeType: 'application/pdf',
            parents: [folderId]
        };
        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', pdfBlob);
        
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
            body: formData
        });
        
        if (response.ok) {
            alert('¡Presupuesto guardado con éxito en la carpeta seleccionada!');
        } else {
            alert('Error al guardar en Google Drive.');
        }
    } catch (err) {
        console.error(err);
        alert('Error al generar o subir el PDF.');
    } finally {
        acciones.forEach(el => el.style.display = ''); // <-- Restaurar visibilidad
    }
}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs shrink-0">
              <ShieldAlert className="w-8 h-8 text-amber-200" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Repositorio Corregido & Listo para Subir
              </h1>
              <p className="text-amber-100 text-sm mt-1 max-w-2xl leading-relaxed">
                Empaquetamos todos los archivos corregidos con <code className="font-mono bg-white/10 px-1 py-0.5 rounded">vercel.json</code>, logo, estilos de impresión y el fix de Google Drive en un paquete ZIP listo para tu nuevo repositorio en GitHub.
              </p>
            </div>
          </div>

          <a
            href="/grupo-data-fixed.zip"
            download="grupo-data-repositorio-corregido.zip"
            className="shrink-0 px-6 py-3.5 bg-white text-slate-900 hover:bg-amber-50 font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Download className="w-5 h-5 text-amber-700 group-hover:scale-110 transition-transform" />
            <span>Descargar ZIP del Repositorio</span>
          </a>
        </div>
      </div>

      {/* GitHub Instructions Quick Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 mb-10 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-3">
          <Terminal className="w-4 h-4" />
          <span>¿Cómo crear el nuevo repo en GitHub con este paquete? (Elige la opción que prefieras)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Opción Web sin terminal */}
          <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700">
            <p className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              Opción A: Por la Web de GitHub (Sin comandos)
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 mt-2">
              <li>Descarga el archivo <strong>ZIP</strong> con el botón blanco de arriba y descomprímelo en tu computadora.</li>
              <li>Entra a <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">github.com/new</a> y crea tu nuevo repositorio (ej. <code className="text-cyan-200">Grupo_Data_App</code>).</li>
              <li>En la pantalla de bienvenida de GitHub, haz clic en <strong>"uploading an existing file"</strong>.</li>
              <li>Arrastra todos los archivos descomprimidos y presiona <strong>"Commit changes"</strong>. ¡Listo!</li>
            </ol>
          </div>

          {/* Opción Git Terminal */}
          <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700">
            <p className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-amber-400" />
              Opción B: Por Consola / Terminal
            </p>
            <p className="text-slate-400 mb-2">Descomprime el ZIP, abre la terminal dentro de esa carpeta y ejecuta:</p>
            <div className="bg-slate-950 p-3 rounded-lg font-mono text-emerald-400 text-[11px] space-y-1 border border-slate-800">
              <p>git init</p>
              <p>git add .</p>
              <p>git commit -m "Versión completa y corregida"</p>
              <p>git branch -M main</p>
              <p>git remote add origin https://github.com/appecrafterstafe/NUEVO_REPO.git</p>
              <p>git push -u origin main</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Issue 1 */}
        <div className="bg-white rounded-xl p-5 border border-rose-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-100 text-rose-800 rounded-full">
                Error Crítico JS
              </span>
              <span className="text-xs text-slate-400 font-mono">mano_obra.html</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">
              Callback inválido en Google OAuth
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              En <code className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded font-mono">mano_obra.html</code> se pasa <code className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded font-mono">callback: ''</code> (string vacío). 
              Google Identity Services exige que sea una función. Esto rompe la autenticación de Google Drive con un TypeError silencioso.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">Severidad: Alta</span>
            <button
              onClick={() => setSelectedFile('mano_obra')}
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-900"
            >
              Ver Solución →
            </button>
          </div>
        </div>

        {/* Issue 2 */}
        <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                Error de Exportación
              </span>
              <span className="text-xs text-slate-400 font-mono">presupuesto / mano_obra</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">
              Botones de eliminar aparecen en PDF de Drive
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              En <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-mono">subirPdfACarpeta()</code> no se ocultan los elementos <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-mono">.no-print</code>. 
              Los tachos de basura rojos se imprimen dentro del archivo PDF que recibe el cliente o queda en Drive.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Severidad: Media</span>
            <button
              onClick={() => setSelectedFile('presupuesto')}
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-900"
            >
              Ver Solución →
            </button>
          </div>
        </div>

        {/* Issue 3 */}
        <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                Configuración Vercel
              </span>
              <span className="text-xs text-slate-400 font-mono">vercel.json</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">
              Falta de vercel.json & 404 en rutas limpias
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Al desplegar en Vercel sin archivo de configuración, cualquier enlace como <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">/presupuesto</code> (sin .html) da error 404. 
              Se necesita <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">cleanUrls: true</code>.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">Severidad: Media</span>
            <button
              onClick={() => setSelectedFile('vercel')}
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-900"
            >
              Ver vercel.json →
            </button>
          </div>
        </div>

        {/* Issue 4 */}
        <div className="bg-white rounded-xl p-5 border border-purple-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-full">
                Google Cloud Console
              </span>
              <span className="text-xs text-slate-400 font-mono">OAuth 2.0</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">
              Error origin_mismatch en Vercel
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              El Client ID hardcodeado en los archivos tiene configurado solo orígenes previos (o localhost). 
              Debes registrar tu dominio de Vercel (ej: <code className="text-purple-700 bg-purple-50 px-1 py-0.5 rounded font-mono">https://tu-proyecto.vercel.app</code>) en Google Cloud Console.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-purple-700">Paso obligatorio en Google</span>
          </div>
        </div>

        {/* Issue 5 */}
        <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                Experiencia de Usuario
              </span>
              <span className="text-xs text-slate-400 font-mono">Navegación</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">
              Sin botón de retorno al Menú
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Una vez que el usuario abre <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">presupuesto.html</code>, queda atrapado sin botón para volver a <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">index.html</code> o cambiar a Orden de Trabajo.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-emerald-700">UX / Usabilidad</span>
          </div>
        </div>

        {/* Issue 6 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-800 rounded-full">
                Impresión CSS
              </span>
              <span className="text-xs text-slate-400 font-mono">@media print</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">
              Corte de hoja por height: 100vh
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tanto en <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono">presupuesto.html</code> como en <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono">mano_obra.html</code>, los estilos de impresión fuerzan <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono">height: 100vh</code> o <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono">max-height: 296mm</code>, lo que trunca tablas con más de 5 ítems.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700">CSS de Impresión</span>
          </div>
        </div>
      </div>

      {/* Interactive Code Viewer and Copy Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
        <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold text-sm">Archivos Corregidos Listos para tu Repo</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedFile('vercel')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedFile === 'vercel' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              vercel.json
            </button>
            <button
              onClick={() => setSelectedFile('mano_obra')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedFile === 'mano_obra' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Fix mano_obra.html
            </button>
            <button
              onClick={() => setSelectedFile('presupuesto')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedFile === 'presupuesto' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Fix presupuesto.html
            </button>
          </div>
        </div>

        <div className="p-6">
          {selectedFile === 'vercel' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Archivo: vercel.json (a colocar en la raíz del repo)</h4>
                  <p className="text-xs text-slate-500">
                    Crea este archivo en la raíz de tu repositorio en GitHub para activar rutas limpias y compatibilidad total con Vercel.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(vercelJsonCode, 'vercel')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 border border-slate-300"
                >
                  {copiedKey === 'vercel' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'vercel' ? '¡Copiado!' : 'Copiar vercel.json'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                {vercelJsonCode}
              </pre>
            </div>
          )}

          {selectedFile === 'mano_obra' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Correcciones para mano_obra.html</h4>
                  <p className="text-xs text-slate-500">
                    Reemplaza el bloque de <code className="font-mono text-cyan-700">initTokenClient</code> y de <code className="font-mono text-cyan-700">subirPdfACarpeta()</code>
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(manoObraFixSnippet, 'mo_code')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 border border-slate-300"
                >
                  {copiedKey === 'mo_code' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'mo_code' ? '¡Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-cyan-300 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                {manoObraFixSnippet}
              </pre>
            </div>
          )}

          {selectedFile === 'presupuesto' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Correcciones para presupuesto.html</h4>
                  <p className="text-xs text-slate-500">
                    Evita que los botones de eliminar (tachos de basura) salgan en el PDF subido a Google Drive
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(presupuestoFixSnippet, 'pres_code')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 border border-slate-300"
                >
                  {copiedKey === 'pres_code' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'pres_code' ? '¡Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-cyan-300 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                {presupuestoFixSnippet}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Guía Específica: Qué hacer si no hay nada en OAuth 2.0 */}
      <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-md p-6 sm:p-8 mb-12">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
            <KeyRound className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">
                ¿Fuiste a Google Cloud Console y "No hay nada en OAuth 2.0"?
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-800 rounded-full">
                Solución Paso a Paso
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Es muy común: ocurre cuando estás en un proyecto nuevo o con una cuenta de Google diferente a la que creó la clave original (<code className="font-mono text-indigo-700">606486196456-...</code>). 
              A continuación tienes las dos opciones disponibles:
            </p>
          </div>
        </div>

        {/* Option comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Opción 1: Rápida */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Opción 1: Usar "Descargar PDF" directo (Recomendada)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                <strong>No necesitas Google OAuth ni configurar nada en Google Cloud.</strong> Puedes usar directamente el botón <span className="font-semibold text-slate-900">"Descargar PDF"</span> que genera al instante el PDF oficial en tu celular o computadora, listo para compartir por WhatsApp o email con tu cliente.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-md border border-emerald-200 w-fit">
              100% Funcional sin configuración
            </span>
          </div>

          {/* Opción 2: Crear OAuth */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm mb-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                Opción 2: Crear tu propio Client ID desde cero
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Si deseas que tus presupuestos se sincronicen directamente con tu carpeta de Google Drive, sigue los 4 pasos detallados debajo para crear tu propio ID de cliente en 3 minutos.
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-md border border-indigo-200 w-fit">
              Para sincronización con Google Drive
            </span>
          </div>
        </div>

        {/* 4 Steps to create OAuth from scratch */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
          <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            Tutorial: Cómo crear tu ID de OAuth 2.0 desde cero en Google Cloud
          </h4>

          <div className="space-y-5 text-xs text-slate-700">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <p className="font-bold text-slate-900">Crear o Seleccionar un Proyecto</p>
                <p className="text-slate-600 mt-0.5">
                  Ingresa a <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">console.cloud.google.com</a> con tu cuenta de Google. En la barra superior haz clic en el selector de proyectos y luego en <strong>"Proyecto nuevo"</strong> (Nombre: <em>Grupo Data</em>) y pulsa <strong>Crear</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <p className="font-bold text-slate-900">Habilitar Google Drive API</p>
                <p className="text-slate-600 mt-0.5">
                  En el menú de la izquierda (☰), ve a <strong>APIs y servicios &gt; Biblioteca</strong>. Busca <strong>"Google Drive API"</strong> y haz clic en <strong>Habilitar</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <p className="font-bold text-slate-900">Configurar la Pantalla de Consentimiento de OAuth</p>
                <p className="text-slate-600 mt-0.5">
                  En el menú izquierdo ve a <strong>APIs y servicios &gt; Pantalla de consentimiento de OAuth</strong> (o "Público").
                </p>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-600 pl-2">
                  <li>Selecciona tipo de usuario: <strong>Externo</strong> y clic en <strong>Crear</strong>.</li>
                  <li>Nombre de la app: <code className="bg-white px-1 py-0.5 border rounded">Grupo Data</code></li>
                  <li>Correo de asistencia: selecciona tu correo.</li>
                  <li>Correo de contacto para desarrolladores: tu correo.</li>
                  <li>Haz clic en <strong>Guardar y continuar</strong> hasta llegar al final.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <div>
                <p className="font-bold text-slate-900">Crear el ID de Cliente de OAuth 2.0</p>
                <p className="text-slate-600 mt-0.5">
                  En el menú ve a <strong>APIs y servicios &gt; Credenciales</strong>. Haz clic arriba en <strong>"+ Crear credenciales" &gt; "ID de cliente de OAuth"</strong>.
                </p>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-600 pl-2">
                  <li>Tipo de aplicación: <strong>Aplicación web</strong>.</li>
                  <li>Nombre: <code className="bg-white px-1 py-0.5 border rounded">Grupo Data Web</code>.</li>
                  <li>
                    En <strong>"Orígenes autorizados de JavaScript"</strong>, haz clic en <em>+ Agregar URI</em> y coloca tu dominio de Vercel (ej. <code className="bg-white px-1 py-0.5 border rounded">https://tu-proyecto.vercel.app</code>) y también <code className="bg-white px-1 py-0.5 border rounded">https://ais-dev-wziihatu6khxlfwofred75-883337059023.us-east1.run.app</code> si deseas probar aquí.
                  </li>
                  <li>Haz clic en <strong>Crear</strong>.</li>
                </ul>
                <p className="mt-2 text-indigo-700 font-semibold">
                  ¡Listo! Te aparecerá un cuadro con tu nuevo "ID de cliente" (un texto largo terminado en <code>.apps.googleusercontent.com</code>).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Client ID Input & Tester */}
        <form onSubmit={handleSaveClientId} className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-5">
          <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider mb-1">
            Configurar y Probar tu nuevo Client ID en esta app:
          </label>
          <p className="text-xs text-slate-600 mb-3">
            Pega aquí el Client ID generado en tu Google Cloud Console para guardarlo y utilizarlo al presionar "Guardar en Google Drive".
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              placeholder="Ej: 1234567890-abcdefg.apps.googleusercontent.com"
              className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 shrink-0"
            >
              <Check className="w-4 h-4" />
              Guardar Client ID
            </button>
          </div>
          {savedSuccess && (
            <div className="mt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> ¡Client ID actualizado y guardado correctamente!
            </div>
          )}
        </form>
      </div>

      {/* Step by Step Guide for Vercel */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-600" />
          Resumen: Pasos en tu repositorio de GitHub para Vercel
        </h3>

        <div className="space-y-6 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div>
              <h4 className="font-bold text-slate-900">Agregar vercel.json a tu repositorio</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Crea un archivo llamado <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300">vercel.json</code> en la carpeta raíz de tu repositorio <span className="font-mono">Grupo_Data</span> y pega el contenido provisto arriba. Al hacer <code className="font-mono">git push</code>, Vercel redesplegará automáticamente con soporte para URLs limpias.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div>
              <h4 className="font-bold text-slate-900">Actualizar mano_obra.html y presupuesto.html</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Aplica los dos arreglos de código (reemplazar el <code className="font-mono text-rose-600">callback: ''</code> por la función en <code className="font-mono">mano_obra.html</code> y ocultar los tachos de basura antes de exportar a Drive).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
