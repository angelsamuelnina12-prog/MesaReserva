
/*
  PROYECTO: MesaReserva
  CURSO: Desarrollo de Interfaces 2

  INTEGRANTES:
  - Angel Nina
  - Gabriel Ochoa
  - Petter Sosa

  ARCHIVO: src/utils/reservas.js
*/

// ========================================
// 1. CONFIGURACIÓN DE LAS MESAS
// ========================================

export const MESAS = [
  { id: 1, capacidad: 2 },
  { id: 2, capacidad: 2 },
  { id: 3, capacidad: 4 },
  { id: 4, capacidad: 4 },
  { id: 5, capacidad: 8 },
];

// Duración de cada reserva: 90 minutos
export const DURACION_RESERVA = 90;

// Horarios permitidos
export const HORA_APERTURA = "12:00";
export const HORA_ULTIMA_RESERVA = "21:00";


// ========================================
// 2. OBTENER LA FECHA LOCAL
// ========================================

export function fechaLocal(fecha = new Date()) {
  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
}


// ========================================
// 3. CONVERTIR HORAS A MINUTOS
// ========================================

export function convertirMinutos(hora) {
  const [horas, minutos] = hora.split(":").map(Number);

  return horas * 60 + minutos;
}


// ========================================
// 4. VALIDAR FECHA Y HORARIO
// ========================================

export function validarHorario(fecha, hora) {

  // Verificar que ambos datos existan
  if (!fecha || !hora) {
    return "Debes seleccionar una fecha y una hora.";
  }

  // Convertir a fecha y hora
  const inicio = new Date(`${fecha}T${hora}:00`);

  // Verificar que la fecha sea válida y futura
  if (
    Number.isNaN(inicio.getTime()) ||
    inicio <= new Date()
  ) {
    return "Selecciona una fecha y hora futuras.";
  }

  // Convertir la hora seleccionada a minutos
  const minutos = convertirMinutos(hora);

  // Validar horario de atención
  if (
    minutos < convertirMinutos(HORA_APERTURA) ||
    minutos > convertirMinutos(HORA_ULTIMA_RESERVA)
  ) {
    return "El horario de reservas es de 12:00 a 21:00.";
  }

  return null;
}


// ========================================
// 5. DETECTAR CONFLICTOS ENTRE RESERVAS
// ========================================

export function hayConflicto(
  reservas,
  mesaId,
  fecha,
  hora,
  reservaExcluida = null
) {

  // Horario de la nueva reserva
  const inicio = convertirMinutos(hora);
  const fin = inicio + DURACION_RESERVA;

  return reservas.some((reserva) => {

    // Ignorar la reserva que estamos editando
    if (reserva.id === reservaExcluida) {
      return false;
    }

    // Ignorar reservas canceladas
    if (reserva.estado === "cancelada") {
      return false;
    }

    // Verificar si corresponde a la misma mesa
    if (Number(reserva.mesaId) !== Number(mesaId)) {
      return false;
    }

    // Verificar si corresponde a la misma fecha
    if (reserva.fecha !== fecha) {
      return false;
    }

    // Obtener horario de la reserva existente
    const inicioExistente = convertirMinutos(
      reserva.hora
    );

    const finExistente =
      inicioExistente + DURACION_RESERVA;

    // Detectar si los horarios se superponen
    return (
      inicio < finExistente &&
      fin > inicioExistente
    );
  });
}


// ========================================
// 6. CONSULTAR MESAS DISPONIBLES
// ========================================

export function obtenerMesasDisponibles(
  reservas,
  fecha,
  hora,
  personas,
  reservaExcluida = null
) {

  // Validar primero la fecha y hora
  const errorHorario = validarHorario(fecha, hora);

  if (errorHorario) {
    return [];
  }

  // Verificar que la cantidad de personas sea válida
  if (
    !Number.isInteger(Number(personas)) ||
    Number(personas) < 1 ||
    Number(personas) > 8
  ) {
    return [];
  }

  // Buscar las mesas que cumplen los requisitos
  return MESAS.filter((mesa) => {

    // La mesa debe tener capacidad suficiente
    const capacidadSuficiente =
      mesa.capacidad >= Number(personas);

    // Comprobar si existe un conflicto
    const ocupada = hayConflicto(
      reservas,
      mesa.id,
      fecha,
      hora,
      reservaExcluida
    );

    return capacidadSuficiente && !ocupada;
  });
}
