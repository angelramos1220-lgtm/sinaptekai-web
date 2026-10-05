// Testimonio que va debajo de las tarjetas de casos.
//
// Con null no se renderiza nada: ni contenedor vacío ni espacio extra.
// Para mostrarlo, reemplaza null por un objeto como este (la cita va sin comillas):
//
//   { texto: 'La cita del cliente', nombre: 'Nombre Apellido', cargo: 'Cargo, Negocio' }
//
// No inventar testimonios: solo citas reales y autorizadas.

export interface Testimonio {
  texto: string;
  nombre: string;
  cargo?: string;
}

export const testimonio = null as Testimonio | null;
