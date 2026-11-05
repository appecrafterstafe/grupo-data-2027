export interface PresupuestoItem {
  id: string;
  desc: string;
  cant: number;
  uni: string;
  precio: number;
}

export interface PresupuestoData {
  numero: string;
  fecha: string;
  validez: string;
  cliente: string;
  obra: string;
  lugar: string;
  items: PresupuestoItem[];
  obs: string;
  plazo: string;
  pago: string;
}

export interface OrdenTrabajoItem {
  id: string;
  desc: string;
  cant: string;
}

export interface OrdenTrabajoData {
  numero: string;
  fecha: string;
  cliente: string;
  lugar: string;
  personal: string;
  prioridad: string;
  items: OrdenTrabajoItem[];
  obs: string;
}

export interface ManoObraItem {
  id: string;
  desc: string;
  cant: number;
  precio: number;
}

export interface ManoObraData {
  numero: string;
  fecha: string;
  obra: string;
  lugar: string;
  responsable: string;
  items: ManoObraItem[];
  obs: string;
}

export interface PlanTareaItem {
  id: string;
  fecha: string; // YYYY-MM-DD
  dia: string;   // Lunes, Martes, Miércoles, etc.
  obra: string;
  tarea: string;
  personal: string;
  estado: 'Programado' | 'En curso' | 'Finalizado' | 'Pendiente';
}

export interface PlanificacionData {
  mesSeleccionado: string; // YYYY-MM
  semanaNumero: string;
  fechaInicio: string;
  fechaFin: string;
  coordinador: string;
  tareas: PlanTareaItem[];
  obs: string;
}

export type ActiveTab = 'home' | 'presupuesto' | 'orden' | 'mano_obra' | 'planificacion';
