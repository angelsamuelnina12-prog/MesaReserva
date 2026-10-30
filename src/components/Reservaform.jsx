
import { useState } from "react";

import {
  obtenerMesasDisponibles,
  hayConflicto,
  validarHorario,
  fechaLocal,
} from "../utils/reservas";

function ReservaForm({ agregarReserva, reservas }) {
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [personas, setPersonas] = useState(2);
  const [mesaId, setMesaId] = useState("");
  const [mensaje, setMensaje] = useState(null); 
  const [confirmacion, setConfirmacion] = useState(null);

  const hoy = fechaLocal(new Date());

  const mesasDisponibles = obtenerMesasDisponibles(
    reservas,
    fecha,
    hora,
    personas
  );

  const mesaSeleccionada = mesasDisponibles.find(
    (mesa) => mesa.id === Number(mesaId)
  );

  function registrarReserva(e) {
    e.preventDefault();
    setMensaje(null);

    if (!nombre.trim()) {
      setMensaje({
        tipo: "error",
        texto: "Ingresa tu nombre completo.",
      });
      return;
    }

    const inicio = new Date(`${fecha}T${hora}:00`);

    if (Number.isNaN(inicio.getTime()) || inicio <= new Date()) {
      setMensaje({
        tipo: "error",
        texto: "Selecciona una fecha y hora futuras.",
      });
      return;
    }

    if (hora < "12:00" || hora > "21:00") {
      setMensaje({
        tipo: "error",
        texto: "Nuestro horario de reservas es de 12:00 a 21:00.",
      });
      return;
    }

    if (!mesaSeleccionada) {
      setMensaje({
        tipo: "error",
        texto: "Selecciona una mesa disponible.",
      });
      return;
    }

    if (
      hayConflicto(
        reservas,
        mesaSeleccionada.id,
        fecha,
        hora
      )
    ) {
      setMensaje({
        tipo: "error",
        texto: "Esta mesa ya está reservada. Elige otra.",
      });
      return;
    }

    const nuevaReserva = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      fecha,
      hora,
      personas: Number(personas),
      mesaId: mesaSeleccionada.id,
      estado: "confirmada",
    };

    agregarReserva(nuevaReserva);
    setConfirmacion(nuevaReserva);
    setMesaId("");
  }

  function nuevaReserva() {
    setConfirmacion(null);
    setNombre("");
    setFecha("");
    setHora("");
    setPersonas(2);
    setMesaId("");
    setMensaje(null);
  }

  if (confirmacion) {
    return (
      <main className="contenido confirmacion-reserva">
        <div className="icono-exito">✓</div>

        <h2>¡Reserva confirmada!</h2>
        <p>Tu mesa está lista para recibirte.</p>

        <div className="resumen-confirmacion">
          <h3>Detalle de tu reserva</h3>
          <p><strong>Cliente:</strong> {confirmacion.nombre}</p>
          <p><strong>Fecha:</strong> {confirmacion.fecha}</p>
          <p><strong>Hora:</strong> {confirmacion.hora}</p>
          <p><strong>Mesa:</strong> {confirmacion.mesaId}</p>
          <p><strong>Personas:</strong> {confirmacion.personas}</p>
          <p><strong>Estado:</strong> Confirmada</p>
        </div>

        <button onClick={nuevaReserva}>
          Realizar otra reserva
        </button>
      </main>
    );
  }

  return (
    <main className="contenido reserva-contenido">
      <div className="bienvenida">
        <h2>Reserva tu mesa</h2>
        <p>
          Elige tu fecha, horario y mesa favorita.
          ¡Nos encargamos del resto!
        </p>
      </div>

      <form onSubmit={registrarReserva}>
        <label htmlFor="nombre">Nombre completo</label>
        <input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Gabriel Ochoa"
          maxLength={80}
          required
        />

        <label htmlFor="fecha">Fecha de reserva</label>
        <input
          id="fecha"
          type="date"
          min={hoy}
          value={fecha}
          onChange={(e) => {
            setFecha(e.target.value);
            setMesaId("");
          }}
          required
        />

        <label htmlFor="hora">Horario</label>
        <input
          id="hora"
          type="time"
          min="12:00"
          max="21:00"
          value={hora}
          onChange={(e) => {
            setHora(e.target.value);
            setMesaId("");
          }}
          required
        />

        <label htmlFor="personas">Número de personas</label>
        <select
          id="personas"
          value={personas}
          onChange={(e) => {
            setPersonas(Number(e.target.value));
            setMesaId("");
          }}
        >
          {Array.from({ length: 8 }, (_, i) => i + 1).map(
            (n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "persona" : "personas"}
              </option>
            )
          )}
        </select>

        {fecha && hora && (
          <div className="seleccion-mesas">
            <h3>Mesas disponibles</h3>

            {mesasDisponibles.length === 0 ? (
              <div className="aviso-error" role="status">
                No encontramos mesas para este horario.
                Prueba otra hora o fecha.
              </div>
            ) : (
              <div className="mesas-grid">
                {mesasDisponibles.map((mesa) => (
                  <button
                    type="button"
                    key={mesa.id}
                    aria-pressed={
                      Number(mesaId) === mesa.id
                    }
                    className={
                      "mesa-opcion " +
                      (Number(mesaId) === mesa.id
                        ? "mesa-activa"
                        : "")
                    }
                    onClick={() => setMesaId(String(mesa.id))}
                  >
                    <strong>Mesa {mesa.id}</strong>
                    <small>
                      Hasta {mesa.capacidad} personas
                    </small>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {mensaje && (
          <div
            className={
              mensaje.tipo === "error"
                ? "aviso-error"
                : "aviso-exito"
            }
            role="alert"
          >
            {mensaje.texto}
          </div>
        )}

        <button
          type="submit"
          disabled={!mesaSeleccionada}
          className="btn-confirmar"
        >
          Confirmar reserva
        </button>
      </form>
    </main>
  );
}

export default ReservaForm;
