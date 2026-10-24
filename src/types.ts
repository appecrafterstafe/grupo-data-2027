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

export type ActiveTab = 'home' | 'presupuesto' | 'orden' | 'mano_obra' | 'audit';
