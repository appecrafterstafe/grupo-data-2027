import React, { useState, useRef } from 'react';
import { PlanificacionData, PlanTareaItem } from '../types';
import { generatePdfBlob, downloadPdfDirectly } from '../utils/pdfExport';
import { requestGoogleAccessToken, uploadPdfToDrive } from '../utils/googleDrive';
import { 
  CalendarDays, 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  CloudUpload, 
  CheckCircle2, 
  AlertCircle,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

interface PlanificacionViewProps {
  data: PlanificacionData;
  onChange: (data: PlanificacionData) => void;
}

import { 
  formatDateDisplay, 
  getDayName, 
  formatDateRange, 
  formatMonthName,
  MONTH_NAMES_ES as MONTH_NAMES, 
  WEEKDAYS_SHORT_ES as WEEKDAYS 
} from '../utils/dateUtils';


export const PlanificacionView: React.FC<PlanificacionViewProps> = ({
  data,
  onChange,
}) => {
  const docRef = useRef<HTMLDivElement>(null);

  // View mode switcher: 'semanal' vs 'mensual'
  const [viewMode, setViewMode] = useState<'semanal' | 'mensual'>('semanal');

  // Today fallback
  const todayStr = new Date().toISOString().split('T')[0];
  const initialYearMonth = data.mesSeleccionado || todayStr.substring(0, 7);

  // Month navigation for monthly view
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(initialYearMonth);

  // Form state for adding new task (streamlined: only Date, Obra, Tarea, Personal, Estado)
  const [newFecha, setNewFecha] = useState<string>(todayStr);
  const [newObra, setNewObra] = useState<string>('');
  const [newTarea, setNewTarea] = useState<string>('');
  const [newPersonal, setNewPersonal] = useState<string>('');
  const [newEstado, setNewEstado] = useState<PlanTareaItem['estado']>('Programado');

  // Status feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Monthly navigation helpers
  const [currYear, currMonth] = currentYearMonth.split('-').map(Number);

  const handlePrevMonth = () => {
    let y = currYear;
    let m = currMonth - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    const nextYm = `${y}-${String(m).padStart(2, '0')}`;
    setCurrentYearMonth(nextYm);
    onChange({ ...data, mesSeleccionado: nextYm });
  };

  const handleNextMonth = () => {
    let y = currYear;
    let m = currMonth + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    const nextYm = `${y}-${String(m).padStart(2, '0')}`;
    setCurrentYearMonth(nextYm);
    onChange({ ...data, mesSeleccionado: nextYm });
  };

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newObra.trim() || !newTarea.trim()) {
      setStatusMessage({ type: 'error', text: 'Por favor complete al menos la Obra y la Tarea a realizar.' });
      return;
    }

    const diaCalculado = getDayName(newFecha);

    const newTask: PlanTareaItem = {
      id: Date.now().toString(),
      fecha: newFecha,
      dia: diaCalculado,
      obra: newObra.trim(),
      tarea: newTarea.trim(),
      personal: newPersonal.trim() || 'A designar',
      estado: newEstado,
    };

    // Sort tasks chronologically
    const updatedTasks = [...data.tareas, newTask].sort((a, b) => a.fecha.localeCompare(b.fecha));

    onChange({
      ...data,
      tareas: updatedTasks,
    });

    setNewObra('');
    setNewTarea('');
    setNewPersonal('');
    setStatusMessage(null);
  };

  const handleRemoveTask = (id: string) => {
    onChange({
      ...data,
      tareas: data.tareas.filter((t) => t.id !== id),
    });
  };

  const handleDownloadPdf = async () => {
    if (!docRef.current) return;
    try {
      setIsExporting(true);
      setStatusMessage({ type: 'info', text: 'Generando PDF de la Planificación...' });
      const filename = viewMode === 'semanal'
        ? `Planificacion_Semanal_${data.semanaNumero ? data.semanaNumero.replace(/\s+/g, '_') : 'Semana'}.pdf`
        : `Planificacion_Mensual_${MONTH_NAMES[currMonth - 1]}_${currYear}.pdf`;
      await downloadPdfDirectly(docRef.current, filename);
      setStatusMessage({ type: 'success', text: '¡Planificación descargada en PDF con éxito!' });
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
      setStatusMessage({ type: 'info', text: 'Subiendo Planificación a Google Drive...' });
      
      const filename = viewMode === 'semanal'
        ? `Planificacion_Semanal_${data.semanaNumero ? data.semanaNumero.replace(/\s+/g, '_') : 'Semana'}.pdf`
        : `Planificacion_Mensual_${MONTH_NAMES[currMonth - 1]}_${currYear}.pdf`;
      const pdfBlob = await generatePdfBlob(docRef.current, filename);
      
      await uploadPdfToDrive(pdfBlob, filename, token);
      setStatusMessage({ type: 'success', text: '¡Planificación guardada con éxito en Google Drive!' });
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

  const getEstadoBadge = (estado: PlanTareaItem['estado']) => {
    switch (estado) {
      case 'Finalizado':
        return <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">Finalizado</span>;
      case 'En curso':
        return <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800">En curso</span>;
      case 'Pendiente':
        return <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">Pendiente</span>;
      default:
        return <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700">Programado</span>;
    }
  };

  // Filter tasks based on current view
  const monthlyTasks = data.tareas.filter((t) => t.fecha.startsWith(currentYearMonth));

  // Calendar matrix calculation for monthly grid
  const daysInMonth = new Date(currYear, currMonth, 0).getDate();
  const firstDayIndex = (new Date(currYear, currMonth - 1, 1).getDay() + 6) % 7; // Monday = 0
  const calendarCells: Array<{ day: number | null; dateStr: string | null }> = [];

  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ day: null, dateStr: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currYear}-${String(currMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ day: d, dateStr });
  }

  // Active tasks to display in the printable sheet
  const displayTasks = viewMode === 'mensual' ? monthlyTasks : data.tareas;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* View Switcher Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 no-print bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
            {viewMode === 'semanal' ? <CalendarDays className="w-5 h-5" /> : <CalendarRange className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Planificación de Obras</h1>
            <p className="text-xs text-slate-500">Selecciona el modo de visualización y emisión</p>
          </div>
        </div>

        {/* Segmented Control */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('semanal')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'semanal'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Vista Semanal</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('mensual')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'mensual'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Vista Mensual</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div 
          className={`mb-6 p-4 rounded-xl flex items-center justify-between no-print transition-all ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm font-medium">
            {statusMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
            {statusMessage.type === 'info' && <CalendarDays className="w-5 h-5 text-indigo-600 animate-pulse" />}
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

      {/* Monthly Interactive Calendar (Only in monthly mode) */}
      {viewMode === 'mensual' && (
        <div className="mb-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 no-print">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                title="Mes anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-black text-indigo-950 capitalize">
                {MONTH_NAMES[currMonth - 1]} {currYear}
              </h2>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                title="Mes siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-full border border-indigo-200">
              {monthlyTasks.length} {monthlyTasks.length === 1 ? 'tarea en este mes' : 'tareas en este mes'}
            </span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="text-center font-bold text-slate-400 text-xs py-1">
                {wd}
              </div>
            ))}

            {calendarCells.map((cell, idx) => {
              if (!cell.day || !cell.dateStr) {
                return <div key={`empty-${idx}`} className="h-16 sm:h-20 bg-slate-50/50 rounded-xl" />;
              }

              const tasksOnDay = data.tareas.filter((t) => t.fecha === cell.dateStr);
              const isToday = cell.dateStr === todayStr;
              const isSelectedForForm = cell.dateStr === newFecha;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setNewFecha(cell.dateStr!)}
                  className={`h-16 sm:h-20 p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelectedForForm
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40'
                      : isToday
                      ? 'border-indigo-300 bg-white'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                  title={`Clic para agendar tarea el ${formatDateDisplay(cell.dateStr)} (DD/MM/AAAA)`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold leading-none ${
                      isToday ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]' : 'text-slate-700'
                    }`}>
                      {cell.day}
                    </span>
                    {tasksOnDay.length > 0 && (
                      <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-1 rounded">
                        {tasksOnDay.length}
                      </span>
                    )}
                  </div>

                  <div className="overflow-hidden space-y-0.5">
                    {tasksOnDay.slice(0, 2).map((t) => (
                      <div 
                        key={t.id} 
                        className="text-[9px] truncate font-medium px-1 py-0.5 rounded bg-slate-100 text-slate-800"
                        title={`${t.obra}: ${t.tarea}`}
                      >
                        {t.obra}
                      </div>
                    ))}
                    {tasksOnDay.length > 2 && (
                      <div className="text-[8px] text-slate-400 text-right">
                        +{tasksOnDay.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400 mt-3 text-right">
            💡 Haz clic en cualquier día del calendario para seleccionarlo en el formulario de carga.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Editor Form Column */}
        <div className="xl:col-span-5 space-y-6 no-print">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 border-t-4 border-t-indigo-600">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-indigo-950 flex items-center gap-2">
                {viewMode === 'semanal' ? <CalendarDays className="w-5 h-5 text-indigo-600" /> : <CalendarRange className="w-5 h-5 text-indigo-600" />}
                {viewMode === 'semanal' ? 'Planificación Semanal' : 'Planificación Mensual'}
              </h2>
            </div>

            {/* General Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {viewMode === 'semanal' ? (
                <>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Semana / Período
                    </label>
                    <input
                      type="text"
                      value={data.semanaNumero}
                      onChange={(e) => onChange({ ...data, semanaNumero: e.target.value })}
                      placeholder="Ej. Semana 46 (10 al 15 de Noviembre)"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Desde (DD/MM/AAAA)
                      </label>
                      {data.fechaInicio && (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                          {formatDateDisplay(data.fechaInicio)}
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={data.fechaInicio}
                      onChange={(e) => onChange({ ...data, fechaInicio: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Hasta (DD/MM/AAAA)
                      </label>
                      {data.fechaFin && (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                          {formatDateDisplay(data.fechaFin)}
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={data.fechaFin}
                      onChange={(e) => onChange({ ...data, fechaFin: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Mes Seleccionado
                  </label>
                  <input
                    type="month"
                    value={currentYearMonth}
                    onChange={(e) => {
                      setCurrentYearMonth(e.target.value);
                      onChange({ ...data, mesSeleccionado: e.target.value });
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-semibold"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Coordinador de Operaciones
                </label>
                <input
                  type="text"
                  value={data.coordinador}
                  onChange={(e) => onChange({ ...data, coordinador: e.target.value })}
                  placeholder="Nombre del encargado o técnico coordinador"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Streamlined Add Task Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3">
                Asignar Tarea de Obra
              </h3>
              <form onSubmit={handleAddTask} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase">
                        Fecha (DD/MM/AAAA)
                      </label>
                      {newFecha && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                          {formatDateDisplay(newFecha)}
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={newFecha}
                      onChange={(e) => setNewFecha(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Estado
                    </label>
                    <select
                      value={newEstado}
                      onChange={(e) => setNewEstado(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Programado">Programado</option>
                      <option value="En curso">En curso</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Pendiente">Pendiente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Obra / Cliente
                  </label>
                  <input
                    type="text"
                    value={newObra}
                    onChange={(e) => setNewObra(e.target.value)}
                    placeholder="Nombre o ubicación de la obra"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Trabajos y Tareas a Desarrollar
                  </label>
                  <input
                    type="text"
                    value={newTarea}
                    onChange={(e) => setNewTarea(e.target.value)}
                    placeholder="Detalle operativo de los trabajos"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Personal Asignado
                  </label>
                  <input
                    type="text"
                    value={newPersonal}
                    onChange={(e) => setNewPersonal(e.target.value)}
                    placeholder="Ej. Téc. Juan Pérez / Operarios"
                    className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  Agregar a la Planificación
                </button>
              </form>
            </div>

            {/* Observations only */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Observaciones Generales
              </label>
              <textarea
                rows={2}
                value={data.obs}
                onChange={(e) => onChange({ ...data, obs: e.target.value })}
                placeholder="Aclaraciones o notas del período..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
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
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-xs"
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
              <div className="flex items-start justify-between border-b-4 border-indigo-700 pb-3 mb-4">
                <div className="flex flex-col">
                  <img
                    src="/logo.png"
                    alt="Grupo Data"
                    className="max-w-[210px] h-auto object-contain mb-1"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = document.getElementById('preview-logo-fallback-plan');
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <div id="preview-logo-fallback-plan" style={{ display: 'none' }}>
                    <div className="text-2xl font-extrabold text-indigo-900 tracking-wider">GRUPO DATA</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Obras Eléctricas</div>
                  </div>
                </div>

                <div className="text-right">
                  <h1 className="text-2xl font-black text-indigo-800 tracking-wide">
                    {viewMode === 'semanal' ? 'PLANIFICACIÓN SEMANAL' : 'PLANIFICACIÓN MENSUAL'}
                  </h1>
                  {viewMode === 'semanal' ? (
                    <>
                      <p className="text-xs text-slate-600 mt-1">
                        <span className="font-bold text-slate-700">Período:</span> {data.semanaNumero || '----'}
                      </p>
                      <p className="text-xs text-slate-600">
                        <span className="font-bold text-slate-700">Rango:</span> {formatDateRange(data.fechaInicio, data.fechaFin)}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-slate-600 mt-1">
                      <span className="font-bold text-slate-700">Mes:</span> {MONTH_NAMES[currMonth - 1]} {currYear}
                    </p>
                  )}
                </div>
              </div>

              {/* Coordinator and Summary Info Grid */}
              <div className="grid grid-cols-2 gap-3 bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 mb-5 text-xs">
                <div>
                  <span className="font-bold text-indigo-900">Coordinador de Operaciones:</span> {data.coordinador || '----'}
                </div>
                <div>
                  <span className="font-bold text-indigo-900">Total Tareas Programadas:</span> {displayTasks.length} {displayTasks.length === 1 ? 'tarea' : 'tareas'}
                </div>
              </div>

              {/* Clean Tasks Table without Clutter */}
              <table className="w-full text-xs border-collapse mb-5">
                <thead>
                  <tr className="bg-indigo-800 text-white font-semibold">
                    <th className="py-2 px-2 text-center w-28">Fecha / Día</th>
                    <th className="py-2 px-2 text-left w-40">Obra</th>
                    <th className="py-2 px-3 text-left">Tareas a Realizar</th>
                    <th className="py-2 px-2 text-center w-36">Personal Asignado</th>
                    <th className="py-2 px-2 text-center w-24">Estado</th>
                    <th className="py-2 px-1 text-center w-8 no-print">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {displayTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        {viewMode === 'semanal' 
                          ? 'No hay tareas programadas en esta semana.' 
                          : `No hay tareas programadas para ${MONTH_NAMES[currMonth - 1]} ${currYear}.`}
                      </td>
                    </tr>
                  ) : (
                    displayTasks.map((task) => (
                      <tr key={task.id} className="bg-white hover:bg-slate-50/50">
                        <td className="py-2.5 px-2 text-center text-[11px] text-slate-700">
                          <span className="font-bold text-indigo-950 block">{task.dia || getDayName(task.fecha)}</span>
                          <span className="text-slate-400 font-mono text-[10px]">{formatDateDisplay(task.fecha)}</span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-800 font-semibold break-words leading-tight">{task.obra}</td>
                        <td className="py-2.5 px-3 text-slate-700 break-words leading-tight">{task.tarea}</td>
                        <td className="py-2.5 px-2 text-center text-slate-600 text-[11px]">{task.personal}</td>
                        <td className="py-2.5 px-2 text-center">{getEstadoBadge(task.estado)}</td>
                        <td className="py-2.5 px-1 text-center no-print">
                          <button
                            onClick={() => handleRemoveTask(task.id)}
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

            {/* Bottom Observations and Signatures */}
            <div className="page-break-avoid">
              {data.obs && (
                <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-6">
                  <span className="font-bold text-slate-800 uppercase block mb-0.5">Observaciones:</span>
                  <p className="whitespace-pre-wrap">{data.obs}</p>
                </div>
              )}

              {/* Dual Signature Lines */}
              <div className="grid grid-cols-2 gap-8 mb-6 pt-6">
                <div className="border-t border-dashed border-slate-400 text-center text-[10px] text-slate-600 pt-1 font-medium">
                  COORDINADOR DE OPERACIONES
                </div>
                <div className="border-t border-dashed border-slate-400 text-center text-[10px] text-slate-600 pt-1 font-medium">
                  DIRECCIÓN TÉCNICA
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
