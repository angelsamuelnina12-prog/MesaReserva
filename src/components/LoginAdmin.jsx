
import { useState } from "react";

function LoginAdmin({ onLogin, onVolver }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  function iniciarSesion(e) {
    e.preventDefault();
    setError("");

    // Credenciales de demostración académica
    const USUARIO_ADMIN = "admin";
    const CLAVE_ADMIN = "MesaReserva2026";

    if (
      usuario.trim() === USUARIO_ADMIN &&
      contrasena === CLAVE_ADMIN
    ) {
      onLogin();
    } else {
      setError("Usuario o contraseña incorrectos.");
      setContrasena("");
    }
  }

  return (
    <main className="login-pagina">
      <section className="login-card">
        <div className="login-icono" aria-hidden="true">
          🔐
        </div>

        <h2>Acceso administrativo</h2>

        <p>
          Ingresa tus credenciales para gestionar
          las reservas del restaurante.
        </p>

        <form onSubmit={iniciarSesion}>
          <label htmlFor="usuarioAdmin">
            Usuario
          </label>

          <input
            id="usuarioAdmin"
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Ingresa tu usuario"
            autoComplete="username"
            required
          />

          <label htmlFor="claveAdmin">
            Contraseña
          </label>

          <input
            id="claveAdmin"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="Ingresa tu contraseña"
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="aviso-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="login-boton">
            Iniciar sesión
          </button>
        </form>

        <button
          type="button"
          className="login-volver"
          onClick={onVolver}
        >
          ← Volver a reservas
        </button>
      </section>
    </main>
  );
}

export default LoginAdmin;
