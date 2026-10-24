import React, { useState, useRef } from 'react';
import { ManoObraData, ManoObraItem } from '../types';
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
  HardHat
} from 'lucide-react';

interface ManoObraViewProps {
  data: ManoObraData;
  onChange: (data: ManoObraData) => void;
  onLoadSample: () => void;
}

export const ManoObraView: React.FC<ManoObraViewProps> = ({
  data,
  onChange,
  onLoadSample,
}) => {
  const docRef = useRef<HTMLDivElement>(null);

  // New item form state
  const [newDesc, setNewDesc] = useState('');
  const [newCant, setNewCant] = useState('');
  const [newPrecio, setNewPrecio] = useState('');

  // Status feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const calculateTotal = () => {
    return data.items.reduce((acc, item) => acc + (item.cant * item.precio), 0);
  };

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newDesc.trim()) {
      setStatusMessage({ type: 'error', text: 'Por favor ingrese la especialidad o tarea operativa.' });
      return;
    }

    // Flexible Argentine comma/dot parsing
    const parsedCant = parseFloat(newCant.replace(',', '.')) || 1;
    const parsedPrecio = parseFloat(newPrecio.replace(',', '.')) || 0;

    const newItem: ManoObraItem = {
      id: Date.now().toString(),
      desc: newDesc.trim(),
      cant: parsedCant,
      precio: parsedPrecio,
    };

    onChange({
      ...data,
      items: [...data.items, newItem],
    });

    setNewDesc('');
    setNewCant('');
    setNewPrecio('');
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
      setStatusMessage({ type: 'info', text: 'Generando PDF de Mano de Obra...' });
      const filename = `Mano_De_Obra_${data.numero || 'Sin_Numero'}.pdf`;
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
      setStatusMessage({ type: 'info', text: 'Subiendo comprobante a Google Drive...' });
      
      const filename = `Mano_De_Obra_${data.numero || 'Sin_Numero'}.pdf`;
      const pdfBlob = await generatePdfBlob(docRef.current, filename);
      
      await uploadPdfToDrive(pdfBlob, filename, token);
      setStatusMessage({ type: 'success', text: '¡Detalle de Mano de Obra guardado en Google Drive!' });
    } catch (err: any) {
      console.error('Drive upload failed:', err);
      setStatusMessage({ 
        type: 'error', 
        text: `Error en Google Drive: ${err.message}` 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2,
    }).format(val).replace('ARS', '$');
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
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm font-medium">
            {statusMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
            {statusMessage.type === 'info' && <HardHat className="w-5 h-5 text-emerald-600 animate-pulse" />}
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
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 border-t-4 border-t-emerald-700">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                <HardHat className="w-5 h-5 text-emerald-700" />
                Carga de Mano de Obra
              </h2>
              <button
                type="button"
                onClick={onLoadSample}
                className="text-xs font-semibold px-2.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1 border border-emerald-200"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Datos Ejemplo
              </button>
            </div>

            {/* General Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Nº Informe / Plantilla
                </label>
                <input
                  type="text"
                  value={data.numero}
                  onChange={(e) => onChange({ ...data, numero: e.target.value })}
                  placeholder="Ej. MO-001"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={data.fecha}
                  onChange={(e) => onChange({ ...data, fecha: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Obra / Proyecto
                </label>
                <input
                  type="text"
                  value={data.obra}
                  onChange={(e) => onChange({ ...data, obra: e.target.value })}
                  placeholder="Nombre de la obra"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Lugar
                </label>
                <input
                  type="text"
                  value={data.lugar}
                  onChange={(e) => onChange({ ...data, lugar: e.target.value })}
                  placeholder="Dirección / Localidad"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Responsable Técnico
                </label>
                <input
                  type="text"
                  value={data.responsable}
                  onChange={(e) => onChange({ ...data, responsable: e.target.value })}
                  placeholder="Nombre del encargado o técnico"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>
            </div>

            {/* Add Item Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
                Añadir Especialidad o Cuadrilla
              </h3>
              <form onSubmit={handleAddItem} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Especialidad / Tarea Operativa
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Ej. Oficial electricista montaje tablero"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Horas / Días / Jornal
                    </label>
                    <input
                      type="text"
                      value={newCant}
                      onChange={(e) => setNewCant(e.target.value)}
                      placeholder="Ej. 8"
                      className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Valor Unitario ($)
                    </label>
                    <input
                      type="text"
                      value={newPrecio}
                      onChange={(e) => setNewPrecio(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Mano de Obra
                </button>
              </form>
            </div>

            {/* Observations */}
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Instrucciones y Observaciones Operativas
                </label>
                <textarea
                  rows={2}
                  value={data.obs}
                  onChange={(e) => onChange({ ...data, obs: e.target.value })}
                  placeholder="Detalles de turnos, viáticos o condiciones de seguridad..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none resize-none"
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
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-xs"
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
              <div className="flex items-start justify-between border-b-4 border-emerald-700 pb-3 mb-4">
                <div className="flex flex-col">
                  <img
                    src="/logo.png"
                    alt="Grupo Data"
                    className="max-w-[210px] h-auto object-contain mb-1"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = document.getElementById('preview-logo-fallback-mo');
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <div id="preview-logo-fallback-mo" style={{ display: 'none' }}>
                    <div className="text-2xl font-extrabold text-emerald-800 tracking-wider">GRUPO DATA</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Obras Eléctricas</div>
                  </div>
                </div>

                <div className="text-right">
                  <h1 className="text-2xl font-black text-emerald-700 tracking-wide">DETALLE DE MANO DE OBRA</h1>
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="font-bold text-slate-700">Fecha:</span> {formatDateDisplay(data.fecha)}
                  </p>
                  <p className="text-xs text-slate-600">
                    <span className="font-bold text-slate-700">Informe N.º:</span> {data.numero || '----'}
                  </p>
                </div>
              </div>

              {/* Client & Obra Info Grid */}
              <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 mb-5 text-xs">
                <div>
                  <span className="font-bold text-emerald-900">Obra / Proyecto:</span> {data.obra || '----'}
                </div>
                <div>
                  <span className="font-bold text-emerald-900">Lugar:</span> {data.lugar || '----'}
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-emerald-900">Responsable:</span> {data.responsable || '----'}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs border-collapse mb-6">
                <thead>
                  <tr className="bg-emerald-800 text-white font-semibold">
                    <th className="py-2 px-2 text-center w-10">Ítem</th>
                    <th className="py-2 px-3 text-left">Especialidad / Tarea Operativa</th>
                    <th className="py-2 px-2 text-center w-20">Horas / Días</th>
                    <th className="py-2 px-3 text-right w-24">Valor Unit.</th>
                    <th className="py-2 px-3 text-right w-24">Subtotal</th>
                    <th className="py-2 px-1 text-center w-10 no-print">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No hay tareas de mano de obra cargadas.
                      </td>
                    </tr>
                  ) : (
                    data.items.map((item, index) => {
                      const subtotal = item.cant * item.precio;
                      return (
                        <tr key={item.id} className={index % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                          <td className="py-2 px-2 text-center text-slate-500 font-medium">{index + 1}</td>
                          <td className="py-2 px-3 text-slate-800 break-words leading-tight">{item.desc}</td>
                          <td className="py-2 px-2 text-center text-slate-600">{item.cant}</td>
                          <td className="py-2 px-3 text-right text-slate-700 font-mono">{formatCurrency(item.precio)}</td>
                          <td className="py-2 px-3 text-right text-slate-900 font-bold font-mono">{formatCurrency(subtotal)}</td>
                          <td className="py-2 px-1 text-center no-print">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              title="Eliminar este ítem"
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Conditions & Total Box */}
            <div className="page-break-avoid">
              <div className="flex flex-wrap items-start justify-between gap-4 pt-2 border-t border-slate-200 mb-6">
                <div className="flex-1 min-w-[200px] text-[11px] space-y-2 text-slate-600">
                  <div>
                    <span className="font-bold text-emerald-800 uppercase block mb-0.5">
                      Instrucciones y Observaciones Operativas
                    </span>
                    <p className="whitespace-pre-wrap">{data.obs || '----'}</p>
                  </div>
                </div>

                <div className="w-56 bg-emerald-50/70 border-2 border-emerald-700 rounded-lg p-3 text-center">
                  <div className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                    Total Mano de Obra
                  </div>
                  <div className="text-xl font-black text-emerald-700 mt-1 font-mono">
                    {formatCurrency(calculateTotal())}
                  </div>
                </div>
              </div>

              {/* Signature Line */}
              <div className="flex justify-end mb-4 pt-4">
                <div className="w-48 border-t border-dashed border-slate-400 text-center text-[10px] text-slate-600 pt-1 font-medium">
                  FIRMA RESPONSABLE TÉCNICO
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
