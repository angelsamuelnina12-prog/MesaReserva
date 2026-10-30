import { useState } from "react";

import {
  MESAS,
  validarHorario,
  fechaLocal,
  hayConflicto,
} from "../utils/reservas";

function CalendarioReservas({
  reservas,
  cancelarReserva,
  editarReserva,
}) {
  // ========================================
  // ESTADOS DEL COMPONENTE
  // ========================================

  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    () => fechaLocal(new Date())
  );

  const [mesVisible, setMesVisible] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  });

  const [filtro, setFiltro] = useState("todas");
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");

  // ========================================
  // DATOS DEL CALENDARIO
  // ========================================

  const anio = mesVisible.getFullYear();
  const mes = mesVisible.getMonth();

  const primerDia = new Date(anio, mes, 1);
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();

  // El calendario comienza el lunes
  const espacios = (primerDia.getDay() + 6) % 7;

  const nombreMes = mesVisible.toLocaleDateString("es-PE", {
    month: "long",
    year: "numeric",
  });

  // ========================================
  // FILTRAR RESERVAS
  // ========================================

  const reservasDelDia = reservas
    .filter((reserva) => {
      return (
        reserva.fecha === fechaSeleccionada &&
        (filtro === "todas" || reserva.estado === filtro)
      );
    })
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const reservasConfirmadas = reservas.filter(
    (reserva) => reserva.estado === "confirmada"
  );

  const reservasCanceladas = reservas.filter(
    (reserva) => reserva.estado === "cancelada"
  );

  // ========================================
  // NAVEGACIÓN DEL CALENDARIO
  // ========================================

  function cambiarMes(cantidad) {
    setMesVisible(new Date(anio, mes + cantidad, 1));
  }

  function seleccionarDia(dia) {
    setFechaSeleccionada(
      fechaLocal(new Date(anio, mes, dia))
    );
  }

  // ========================================
  // EDICIÓN DE RESERVAS
  // ========================================

  function iniciarEdicion(reserva) {
    setEditando({ ...reserva });
    setError("");
  }

  function cerrarEdicion() {
    setEditando(null);
    setError("");
  }

  function guardarEdicion(e) {
    e.preventDefault();
    setError("");

    if (!editando) return;

    // Validar nombre
    if (!editando.nombre.trim()) {
      setError("Debes ingresar el nombre del cliente.");
      return;
    }

    // Validar cantidad de personas
    const personas = Number(editando.personas);

    if (
      !Number.isInteger(personas) ||
      personas < 1 ||
      personas > 8
    ) {
      setError("La cantidad de personas debe estar entre 1 y 8.");
      return;
    }

    // Buscar mesa seleccionada
    const mesaId = Number(editando.mesaId);

    const mesa = MESAS.find(
      (m) => m.id === mesaId
    );

    if (!mesa) {
      setError("Selecciona una mesa válida.");
      return;
    }

    // Verificar capacidad
    if (mesa.capacidad < personas) {
      setError(
        "La mesa seleccionada no tiene capacidad suficiente."
      );
      return;
    }

    // Validar fecha y horario
    const errorHorario = validarHorario(
      editando.fecha,
      editando.hora
    );

    if (errorHorario) {
      setError(errorHorario);
      return;
    }

    // Verificar conflictos con otras reservas
    const conflicto = hayConflicto(
      reservas,
      mesaId,
      editando.fecha,
      editando.hora,
      editando.id
    );

    if (conflicto) {
      setError(
        "Esta mesa ya está reservada en ese horario. Selecciona otra mesa u hora."
      );
      return;
    }

    // Guardar cambios
    editarReserva({
      ...editando,
      nombre: editando.nombre.trim(),
      personas,
      mesaId,
    });

    // Mostrar la fecha actualizada en el calendario
    const [nuevoAnio, nuevoMes] = editando.fecha
      .split("-")
      .map(Number);

    setFechaSeleccionada(editando.fecha);

    setMesVisible(
      new Date(nuevoAnio, nuevoMes - 1, 1)
    );

    cerrarEdicion();
  }

  // ========================================
  // INTERFAZ DEL ADMINISTRADOR
  // ========================================

  return (
    <main className="admin-layout">

      {/* ENCABEZADO */}
      <div className="admin-titulo">
        <h2>Panel de administración</h2>
        <p>
          Controla las reservas y la disponibilidad
          de las mesas del restaurante.
        </p>
      </div>

      {/* ESTADÍSTICAS */}
      <section className="admin-estadisticas">

        <article>
          <span>Reservas registradas</span>
          <strong>{reservas.length}</strong>
        </article>

        <article>
          <span>Confirmadas</span>
          <strong>{reservasConfirmadas.length}</strong>
        </article>

        <article>
          <span>Canceladas</span>
          <strong>{reservasCanceladas.length}</strong>
        </article>

      </section>

      <div className="admin-contenido">

        {/* CALENDARIO MENSUAL */}
        <section className="calendario-mensual">

          <div className="mes-navegacion">
            <button
              type="button"
              onClick={() => cambiarMes(-1)}
              aria-label="Mes anterior"
            >
              ‹
            </button>

            <h3>{nombreMes}</h3>

            <button
              type="button"
              onClick={() => cambiarMes(1)}
              aria-label="Mes siguiente"
            >
              ›
            </button>
          </div>

          <div className="calendario-grid">

            {[
              "Lu",
              "Ma",
              "Mi",
              "Ju",
              "Vi",
              "Sa",
              "Do",
            ].map((dia) => (
              <span
                className="dia-semana"
                key={dia}
              >
                {dia}
              </span>
            ))}

            {/* Espacios anteriores al primer día */}
            {Array.from(
              { length: espacios },
              (_, i) => (
                <span key={`vacio-${i}`} />
              )
            )}

            {/* Días del mes */}
            {Array.from(
              { length: diasDelMes },
              (_, i) => i + 1
            ).map((dia) => {

              const fecha = fechaLocal(
                new Date(anio, mes, dia)
              );

              const cantidad = reservas.filter(
                (reserva) =>
                  reserva.fecha === fecha &&
                  reserva.estado === "confirmada"
              ).length;

              const seleccionado =
                fecha === fechaSeleccionada;

              return (
                <button
                  type="button"
                  key={fecha}
                  className={
                    "dia-calendario " +
                    (seleccionado
                      ? "dia-seleccionado"
                      : "")
                  }
                  onClick={() => seleccionarDia(dia)}
                  aria-label={
                    `${fecha}, ${cantidad} reservas confirmadas`
                  }
                  aria-pressed={seleccionado}
                >
                  <span>{dia}</span>

                  {cantidad > 0 && (
                    <small>
                      {cantidad}
                    </small>
                  )}
                </button>
              );
            })}

          </div>
        </section>

        {/* LISTADO DE RESERVAS */}
        <section className="reservas-administracion">

          <h3>
            Reservas del {fechaSeleccionada}
          </h3>

          <label htmlFor="filtro">
            Filtrar por estado
          </label>

          <select
            id="filtro"
            value={filtro}
            onChange={(e) =>
              setFiltro(e.target.value)
            }
          >
            <option value="todas">
              Todas las reservas
            </option>

            <option value="confirmada">
              Confirmadas
            </option>

            <option value="cancelada">
              Canceladas
            </option>
          </select>

          {reservasDelDia.length === 0 ? (

            <p>
              No se encontraron reservas para
              la fecha seleccionada.
            </p>

          ) : (

            <div className="tarjetas-admin">

              {reservasDelDia.map((reserva) => (

                <article
                  className="tarjeta-admin"
                  key={reserva.id}
                >
                  <div>
                    <h4>{reserva.nombre}</h4>

                    <p>
                      {reserva.hora} · Mesa {reserva.mesaId}
                    </p>

                    <p>
                      {reserva.personas} personas
                    </p>

                    <span
                      className={
                        "estado " +
                        (reserva.estado === "confirmada"
                          ? "confirmado"
                          : "cancelado")
                      }
                    >
                      {reserva.estado}
                    </span>
                  </div>

                  {reserva.estado !== "cancelada" && (

                    <div className="acciones-reserva">

                      <button
                        type="button"
                        onClick={() =>
                          iniciarEdicion(reserva)
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="btn-cancelar"
                        onClick={() =>
                          cancelarReserva(reserva.id)
                        }
                      >
                        Cancelar
                      </button>

                    </div>
                  )}
                </article>
              ))}

            </div>
          )}

        </section>
      </div>

      {/* MODAL PARA EDITAR RESERVA */}
      {editando && (

        <div className="modal-fondo">

          <div
            className="modal-editar"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-editar"
          >

            <h3 id="titulo-editar">
              Editar reserva
            </h3>

            <form onSubmit={guardarEdicion}>

              {/* NOMBRE */}
              <label htmlFor="editarNombre">
                Nombre del cliente
              </label>

              <input
                id="editarNombre"
                type="text"
                value={editando.nombre}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    nombre: e.target.value,
                  })
                }
                required
              />

              {/* FECHA */}
              <label htmlFor="editarFecha">
                Fecha
              </label>

              <input
                id="editarFecha"
                type="date"
                value={editando.fecha}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    fecha: e.target.value,
                  })
                }
                required
              />

              {/* HORA */}
              <label htmlFor="editarHora">
                Hora
              </label>

              <input
                id="editarHora"
                type="time"
                min="12:00"
                max="21:00"
                value={editando.hora}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    hora: e.target.value,
                  })
                }
                required
              />

              {/* PERSONAS */}
              <label htmlFor="editarPersonas">
                Número de personas
              </label>

              <select
                id="editarPersonas"
                value={editando.personas}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    personas: Number(e.target.value),
                  })
                }
              >
                {Array.from(
                  { length: 8 },
                  (_, i) => i + 1
                ).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "persona" : "personas"}
                  </option>
                ))}
              </select>

              {/* MESA */}
              <label htmlFor="editarMesa">
                Mesa
              </label>

              <select
                id="editarMesa"
                value={editando.mesaId}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    mesaId: Number(e.target.value),
                  })
                }
              >
                {MESAS.map((mesa) => (
                  <option
                    key={mesa.id}
                    value={mesa.id}
                  >
                    Mesa {mesa.id} · Capacidad:
                    {mesa.capacidad} personas
                  </option>
                ))}
              </select>

              {/* ERROR DE VALIDACIÓN */}
              {error && (
                <p
                  role="alert"
                  className="error-edicion"
                >
                  {error}
                </p>
              )}

              {/* ACCIONES */}
              <div className="modal-acciones">

                <button type="submit">
                  Guardar cambios
                </button>

                <button
                  type="button"
                  className="btn-secundario"
                  onClick={cerrarEdicion}
                >
                  Cerrar
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </main>
  );
}

export default CalendarioReservas;
