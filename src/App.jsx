import { useState, useEffect } from "react";
import Hero from "./components/hero";
import ReservaForm from "./components/Reservaform";
import CalendarioReservas from "./components/CalendarioReservas";
import LoginAdmin from "./components/LoginAdmin";
import "./App.css";

function App() {
  // Control de las pantallas
  const [vista, setVista] = useState("cliente");

  // Estado de autenticación del administrador
  const [adminAutenticado, setAdminAutenticado] = useState(false);

  // Recuperar reservas guardadas
  const [reservas, setReservas] = useState(() => {
    try {
      const guardadas = JSON.parse(
        localStorage.getItem("reservas")
      );

      return Array.isArray(guardadas) ? guardadas : [];
    } catch {
      return [];
    }
  });

  // Guardar reservas automáticamente
  useEffect(() => {
    localStorage.setItem(
      "reservas",
      JSON.stringify(reservas)
    );
  }, [reservas]);

  // Crear nueva reserva
  function agregarReserva(nuevaReserva) {
    setReservas((anteriores) => [
      ...anteriores,
      nuevaReserva,
    ]);
  }

  // Cancelar reserva (solo administrador)
  function cancelarReserva(id) {
    if (!adminAutenticado) return;

    const confirmar = window.confirm(
      "¿Seguro que deseas cancelar esta reserva?"
    );

    if (!confirmar) return;

    setReservas((anteriores) =>
      anteriores.map((reserva) =>
        reserva.id === id
          ? { ...reserva, estado: "cancelada" }
          : reserva
      )
    );
  }

  // Editar reserva (solo administrador)
  function editarReserva(reservaActualizada) {
    if (!adminAutenticado) return;

    setReservas((anteriores) =>
      anteriores.map((reserva) =>
        reserva.id === reservaActualizada.id
          ? reservaActualizada
          : reserva
      )
    );
  }

  // Ir al formulario de reservas
  function irAReservas() {
    setVista("cliente");

    // Permite que React muestre primero el formulario
    requestAnimationFrame(() => {
      document
        .getElementById("reservar")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  }

  // Abrir administración o login
  function abrirAdministracion() {
    if (adminAutenticado) {
      setVista("administracion");
    } else {
      setVista("login");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Login exitoso
  function iniciarSesionAdmin() {
    setAdminAutenticado(true);
    setVista("administracion");

    window.scrollTo(0, 0);
  }

  // Cerrar sesión
  function cerrarSesionAdmin() {
    setAdminAutenticado(false);
    setVista("cliente");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="app">

      {/* ENCABEZADO */}
      <header className="header">
        <h1>MesaReserva</h1>

        <p>Reserva experiencias, no solo mesas.</p>

        {/* BARRA DE NAVEGACIÓN */}
        <nav
          className="navegacion"
          aria-label="Navegación principal"
        >
          <button
            type="button"
            className={
              vista === "cliente" ? "nav-activo" : ""
            }
            onClick={irAReservas}
          >
            Reservar mesa
          </button>

          <button
            type="button"
            className={
              vista === "login" ||
              vista === "administracion"
                ? "nav-activo"
                : ""
            }
            onClick={abrirAdministracion}
          >
            Administración
          </button>

          {adminAutenticado && (
            <button
              type="button"
              className="cerrar-sesion"
              onClick={cerrarSesionAdmin}
            >
              Cerrar sesión
            </button>
          )}
        </nav>
      </header>

      {/* VISTA DEL CLIENTE */}
      {vista === "cliente" && (
        <>
          {/* PORTADA CON IMAGEN DEL RESTAURANTE */}
          <Hero onReservar={irAReservas} />

          {/* FORMULARIO DE RESERVAS */}
          <div id="reservar">
            <ReservaForm
              reservas={reservas}
              agregarReserva={agregarReserva}
            />
          </div>
        </>
      )}

      {/* LOGIN DEL ADMINISTRADOR */}
      {vista === "login" && !adminAutenticado && (
        <LoginAdmin
          onLogin={iniciarSesionAdmin}
          onVolver={() => setVista("cliente")}
        />
      )}

      {/* PANEL DE ADMINISTRACIÓN */}
      {vista === "administracion" &&
        adminAutenticado && (
          <CalendarioReservas
            reservas={reservas}
            cancelarReserva={cancelarReserva}
            editarReserva={editarReserva}
          />
        )}

      {/* PIE DE PÁGINA */}
      <footer className="footer">
        <h3>MesaReserva</h3>

        <p>Tu próxima experiencia comienza aquí.</p>

        <p>© 2026 MesaReserva</p>
        
        <p>
          Angel Nina · Gabriel Ochoa · Petter Sosa
        </p>
      </footer>
    </div>
  );
}

export default App;
