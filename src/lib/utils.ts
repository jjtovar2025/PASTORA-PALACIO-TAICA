import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calcularEdad(fechaNacimiento: string): string {
  if (!fechaNacimiento) return '';
  const hoy = new Date();
  const cumpleanos = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - cumpleanos.getFullYear();
  const m = hoy.getMonth() - cumpleanos.getMonth();

  if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
    edad--;
  }

  if (edad === 0) {
    const meses = (hoy.getFullYear() - cumpleanos.getFullYear()) * 12 + (hoy.getMonth() - cumpleanos.getMonth());
    return `${meses} m`;
  }

  return `${edad} años`;
}

export function getFullDate() {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('es-ES', options);
}
