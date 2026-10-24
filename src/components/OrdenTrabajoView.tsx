import React, { useState, useRef } from 'react';
import { OrdenTrabajoData, OrdenTrabajoItem } from '../types';
import { generatePdfBlob, downloadPdfDirectly } from '../utils/pdfExport';
import { requestGoogleAccessToken, uploadPdfToDrive } from '../utils/googleDrive';
import { 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  CloudUpload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ClipboardList
} from 'lucide-react';

interface OrdenTrabajoViewProps {
  data: OrdenTrabajoData;
  onChange: (data: OrdenTrabajoData) => void;
  onLoadSample: () => void;
}

export const OrdenTrabajoView: React.FC<OrdenTrabajoViewProps> = ({
  data,
  onChange,
  onLoadSample,
}) => {
  const docRef = useRef<HTMLDivElement>(null);

  // New task form state
  const [newDesc, setNewDesc] = useState('');
  const [newCant, setNewCant] = useState('');

  // Status feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newDesc.trim()) {
      setStatusMessage({ type: 'error', text: 'Por favor ingrese la descripción de la tarea.' });
      return;
    }

    const newItem: OrdenTrabajoItem = {
      id: Date.now().toString(),
      desc: newDesc.trim(),
      cant: newCant.trim() || '1 serv',
    };

    onChange({
      ...data,
      items: [...data.items, newItem],
    });

    setNewDesc('');
    setNewCant('');
    setStatusMessage(null);
  };

  const handleRemoveItem = (id: string) => {
    onChange({
      ...data,
      items: data.items.filter((item) => item.id !== id),
    });
  };

  const handleDownloadPdf = async () => {
    if (!docRef.current) return;
    try {
      setIsExporting(true);
      setStatusMessage({ type: 'info', text: 'Generando PDF de la Orden de Trabajo...' });
      const filename = `OrdenTrabajo_${data.numero || 'Sin_Numero'}.pdf`;
      await downloadPdfDirectly(docRef.current, filename);
      setStatusMessage({ type: 'success', text: '¡PDF descargado con éxito!' });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: `Error al generar PDF: ${err.message}` });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToDrive = async () => {
    if (!docRef.current) return;
    try {
      setIsExporting(true);
      setStatusMessage({ type: 'info', text: 'Conectando con Google Drive...' });
      
      const token = await requestGoogleAccessToken();
      setStatusMessage({ type: 'info', text: 'Subiendo Orden de Trabajo a Google Drive...' });
      
      const filename = `OrdenTrabajo_${data.numero || 'Sin_Numero'}.pdf`;
      const pdfBlob = await generatePdfBlob(docRef.current, filename);
      
      await uploadPdfToDrive(pdfBlob, filename, token);
      setStatusMessage({ type: 'success', text: '¡Orden de Trabajo guardada en Google Drive!' });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ 
        type: 'error', 
        text: `Error en Google Drive: ${err.message}` 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatDateDisplay = (isoDate: string) => {
    if (!isoDate) return '--/--/----';
    const [y, m, d] = isoDate.split('-');
    if (!y || !m || !d) return isoDate;
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Status banner */}
      {statusMessage && (
        <div 
          className={`mb-6 p-4 rounded-xl flex items-center justify-between no-print transition-all ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm font-medium">
            {statusMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
            {statusMessage.type === 'info' && <ClipboardList className="w-5 h-5 text-rose-600 animate-pulse" />}
            <span>{statusMessage.text}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)}
            className="text-xs font-semibold px-2 py-1 rounded-md hover:bg-black/5"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Editor Form Column */}
        <div className="xl:col-span-5 space-y-6 no-print">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 border-t-4 border-t-rose-600">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-rose-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-rose-600" />
                Carga de Orden de Trabajo
              </h2>
              <button
                type="button"
                onClick={onLoadSample}
                className="text-xs font-semibold px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition flex items-center gap-1 border border-rose-200"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Datos Ejemplo
              </button>
            </div>

            {/* General Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Nº Orden de Trabajo
                </label>
                <input
                  type="text"
                  value={data.numero}
                  onChange={(e) => onChange({ ...data, numero: e.target.value })}
                  placeholder="Ej. OT-0001"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Fecha de Emisión
                </label>
                <input
                  type="date"
                  value={data.fecha}
                  onChange={(e) => onChange({ ...data, fecha: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Prioridad
                </label>
                <select
                  value={data.prioridad}
                  onChange={(e) => onChange({ ...data, prioridad: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                >
                  <option value="Normal">Normal</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                  <option value="Programada">Programada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Cliente / Empresa
                </label>
                <input
                  type="text"
                  value={data.cliente}
                  onChange={(e) => onChange({ ...data, cliente: e.target.value })}
                  placeholder="Nombre del cliente"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Ubicación / Obra
                </label>
                <input
                  type="text"
                  value={data.lugar}
                  onChange={(e) => onChange({ ...data, lugar: e.target.value })}
                  placeholder="Dirección de los trabajos"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Personal Asignado
                </label>
                <input
                  type="text"
                  value={data.personal}
                  onChange={(e) => onChange({ ...data, personal: e.target.value })}
                  placeholder="Ej. Téc. Juan Pérez / Operarios"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>

            {/* Add Task Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-3">
                Tareas a Realizar
              </h3>
              <form onSubmit={handleAddItem} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Descripción técnica de la tarea
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Ej. Reemplazo de contactor general y verificación térmica"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Cantidad / Metraje / Tiempo
                    </label>
                    <input
                      type="text"
                      value={newCant}
                      onChange={(e) => setNewCant(e.target.value)}
                      placeholder="Ej. 1 serv / 50 mts / 4 hs"
                      className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Observations */}
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Observaciones e Instrucciones Especiales
                </label>
                <textarea
                  rows={3}
                  value={data.obs}
                  onChange={(e) => onChange({ ...data, obs: e.target.value })}
                  placeholder="Medidas de seguridad, insumos requeridos, corte de suministro previo..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleSaveToDrive}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <CloudUpload className="w-4 h-4" />
                Guardar en Drive
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>
        </div>

        {/* Live A4 Sheet Preview Column */}
        <div className="xl:col-span-7 flex justify-center overflow-x-auto pb-8">
          <div 
            ref={docRef} 
            className="a4-document border border-slate-200 shadow-md text-slate-800 bg-white"
          >
            {/* Top Header */}
            <div>
              <div className="flex items-start justify-between border-b-4 border-rose-600 pb-3 mb-4">
                <div className="flex flex-col">
                  <img
                    src="/logo.png"
                    alt="Grupo Data"
                    className="max-w-[210px] h-auto object-contain mb-1"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = document.getElementById('preview-logo-fallback-ot');
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <div id="preview-logo-fallback-ot" style={{ display: 'none' }}>
                    <div className="text-2xl font-extrabold text-slate-900 tracking-wider">GRUPO DATA</div>
                    <div className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Obras Eléctricas</div>
                  </div>
                </div>

                <div className="text-right">
                  <h1 className="text-2xl font-black text-rose-600 tracking-wide">ORDEN DE TRABAJO</h1>
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="font-bold text-slate-700">Fecha:</span> {formatDateDisplay(data.fecha)}
                  </p>
                  <p className="text-xs text-slate-600">
                    <span className="font-bold text-slate-700">N.º de Orden:</span> {data.numero || '----'}
                  </p>
                  <p className="text-xs text-slate-600">
                    <span className="font-bold text-slate-700">Prioridad:</span>{' '}
                    <span className={`inline-block font-bold ${
                      data.prioridad === 'Alta' || data.prioridad === 'Urgente' ? 'text-rose-600' : 'text-slate-700'
                    }`}>
                      {data.prioridad || '----'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Client & Obra Info Grid */}
              <div className="grid grid-cols-2 gap-3 bg-rose-50/50 border border-rose-100 rounded-lg p-3 mb-5 text-xs">
                <div>
                  <span className="font-bold text-rose-800">Cliente / Empresa:</span> {data.cliente || '----'}
                </div>
                <div>
                  <span className="font-bold text-rose-800">Lugar / Obra:</span> {data.lugar || '----'}
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-rose-800">Personal Asignado:</span> {data.personal || '----'}
                </div>
              </div>

              {/* Tasks Table */}
              <table className="w-full text-xs border-collapse mb-6">
                <thead>
                  <tr className="bg-rose-700 text-white font-semibold">
                    <th className="py-2 px-2 text-center w-12">Ítem</th>
                    <th className="py-2 px-3 text-left">Descripción de la Tarea</th>
                    <th className="py-2 px-3 text-center w-32">Cantidad / Ud.</th>
                    <th className="py-2 px-1 text-center w-10 no-print">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                        No hay tareas asignadas en la orden de trabajo.
                      </td>
                    </tr>
                  ) : (
                    data.items.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                        <td className="py-2.5 px-2 text-center text-slate-500 font-medium">{index + 1}</td>
                        <td className="py-2.5 px-3 text-slate-800 break-words leading-tight">{item.desc}</td>
                        <td className="py-2.5 px-3 text-center text-slate-700 font-medium">{item.cant}</td>
                        <td className="py-2.5 px-1 text-center no-print">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            title="Eliminar esta tarea"
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Conditions & Dual Signatures */}
            <div className="page-break-avoid">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] mb-8">
                <span className="font-bold text-rose-900 uppercase block mb-1">
                  Observaciones / Instrucciones Técnicas
                </span>
                <p className="text-slate-600 whitespace-pre-wrap">{data.obs || '----'}</p>
              </div>

              {/* Dual Signature Lines */}
              <div className="grid grid-cols-2 gap-8 mb-6 pt-6">
                <div className="border-t border-dashed border-slate-400 text-center text-[10px] text-slate-600 pt-1 font-medium">
                  SUPERVISOR DE OBRA
                </div>
                <div className="border-t border-dashed border-slate-400 text-center text-[10px] text-slate-600 pt-1 font-medium">
                  CONFORMIDAD CLIENTE
                </div>
              </div>

              {/* Bottom Contact Bar */}
              <div className="bg-cyan-700 text-white text-[10px] py-2 px-4 rounded-md flex flex-wrap items-center justify-around gap-2 font-medium tracking-wide">
                <span>GRUPO DATA | OBRAS ELÉCTRICAS</span>
                <span>info@grupodata.com.ar</span>
                <span>342 551 9662</span>
                <span>www.grupodata.com.ar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
