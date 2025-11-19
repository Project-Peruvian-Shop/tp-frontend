import { Link, useNavigate } from "react-router-dom";
import SideBar from "../../../Components/login/SideBar";
import styles from "./Login.module.css";
import { routes } from "../../../utils/routes";
import {
  agregarAuthToken,
  agregarRefreshToken,
  agregarUsuario,
} from "../../../utils/auth";
import { useState } from "react";
import { login } from "../../../services/auht.service";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import IconSVG from "../../../Icons/IconSVG";
import Error from "../../../Components/Errortxt/Error";
import logo from "../../../Icons/Logo-HD.png";
function Login() {
  const title = "Bienvenido nuevamente";
  const subtitle = "Solicita tus cotizaciones de manera rápida y confiable";
  const list = [
    "Productos con calidad garantizada",
    "Historial de cotizaciones siempre disponible",
    "Cotiza en simples pasos",
  ];
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [passwordd, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; passwordd?: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const MySwal = withReactContent(Swal);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors({});

    const newErrors: { email?: string; passwordd?: string } = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Ingresa un correo válido";
    }

    if (passwordd.trim().length < 8) {
      newErrors.passwordd = "La contraseña debe tener al menos 8 caracteres";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (loading) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);

    try {
      const body = { email: email.trim(), passwordd: passwordd.trim() };
      const response = await login(body);

      if (response) {
        // Guardar el token de autenticación
        agregarAuthToken(response.accessToken);
        // Guardar el refresh token
        agregarRefreshToken(response.refreshToken);
        // Guardar usuario en localStorage o como lo tengas implementado
        agregarUsuario(response);

        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 3000,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        navigate(routes.profile_user);
        Toast.fire({
          icon: "success",
          title: "Inicio de sesión exitoso",
        });
      }
    } catch (error) {
      const err = error as Error;
      const mensaje = err.message || "Ha ocurrido un error inesperado.";

      MySwal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: mensaje,
        confirmButtonText: "Intentar de nuevo",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <SideBar title={title} subtitle={subtitle} list={list} />
      </div>

      <div className={styles.right}>
        <div className={styles.logoForm}>
          <Link to={routes.home} >
          <img src={logo}/>
          </Link>
        </div>
        <div className={styles.loginTitle}>Iniciar Sesión</div>

        <div className={styles.loginSubtitle}>
          Ingresa tus credenciales para continuar
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Correo Electrónico
            </label>
            <IconSVG name="emailInput" className={styles.inputIcon} />
            <input
              type="email"
              id="email"
              className={styles.input}
              placeholder="ejemplo@dominio.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <Error message={errors.email} />}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <IconSVG name="passwordInput" className={styles.inputIcon} />
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              className={styles.input}
              placeholder="Ingresa tu contraseña"
              required
              value={passwordd}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordVisible ? (
              <a onClick={() => setPasswordVisible(false)}>
                <IconSVG
                  name="eyeHidePassword"
                  className={styles.inputIconRight}
                />
              </a>
            ) : (
              <a onClick={() => setPasswordVisible(true)}>
                <IconSVG
                  name="eyeShowPassword"
                  className={styles.inputIconRight}
                />
              </a>
            )}
            {errors.passwordd && <Error message={errors.passwordd} />}
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Ingresando..." : "Acceder a mi cuenta"}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            ¿No tienes una cuenta?{" "}
            <Link to={routes.register} className={styles.footerLink}>
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
