
import restaurante from "../assets/restaurante.jpg";
import plato from "../assets/plato.jpg";
import ambiente from "../assets/ambiente.jpg";

function Hero({ onReservar }) {
  return (
    <>
      <section
        className="hero-restaurante"
        style={{
          backgroundImage: `linear-gradient(
            90deg,
            rgba(8, 32, 27, 0.88),
            rgba(8, 32, 27, 0.25)
          ), url(${restaurante})`,
        }}
      >
        <div className="hero-contenido">
          <span className="hero-etiqueta">
            BIENVENIDO A MESARESERVA
          </span>

          <h2>
            Momentos únicos,
            <br />
            mesas inolvidables.
          </h2>

          <p>
            Descubre el placer de compartir una
            experiencia gastronómica especial.
            Reserva tu mesa en pocos segundos.
          </p>

          <button onClick={onReservar}>
            Reservar ahora →
          </button>
        </div>
      </section>

      <section className="experiencias">
        <div className="experiencias-titulo">
          <span>NUESTRA EXPERIENCIA</span>
          <h2>Mucho más que una reserva</h2>
          <p>
            Creamos espacios para disfrutar
            de cada momento.
          </p>
        </div>

        <div className="experiencias-grid">
          <article className="experiencia-card">
            <img
              src={plato}
              alt="Presentación de un plato gastronómico"
            />
            <div>
              <h3>Gastronomía especial</h3>
              <p>
                Sabores y experiencias para compartir.
              </p>
            </div>
          </article>

          <article className="experiencia-card">
            <img
              src={ambiente}
              alt="Ambiente acogedor de un restaurante"
            />
            <div>
              <h3>Ambientes acogedores</h3>
              <p>
                Encuentra el espacio ideal para
                cada ocasión.
              </p>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}

export default Hero;
