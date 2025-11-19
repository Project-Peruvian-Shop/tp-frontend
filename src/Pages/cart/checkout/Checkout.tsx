import { useEffect, useState } from "react";
import styles from "./Checkout.module.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Link, useNavigate } from "react-router-dom";
import {
  clearCart,
  getCartFromLocalStorage,
} from "../../../utils/localStorage";
import { obtenerUsuario } from "../../../utils/auth";
import type { CotizacionRequestDTO } from "../../../models/Cotizacion/Cotizacion_request_dto";
import { postCotizacion } from "../../../services/cotizacion.service";
import { routes } from "../../../utils/routes";
import Error from "../../../Components/Errortxt/Error";
import Banner from "../../../Components/banner/Banner";
import { CustomSelect } from "../../../Components/customSelect/CustomSelect";

function Checkout() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [comentarios, setComentarios] = useState("");
  const navigate = useNavigate();

  const usuario = obtenerUsuario();
  const MySwal = withReactContent(Swal);

  const [errors, setErrors] = useState<{
    nombre?: string;
    email?: string;
    tipoDocumento?: string;
    documento?: string;
    telefono?: string;
    contenido?: string;
    checkbox?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const options = [
    { value: "DNI", label: "DNI" },
    { value: "RUC", label: "RUC" },
    { value: "PASAPORTE", label: "PASAPORTE" },
    { value: "OTRO", label: "OTRO" },
  ];

  useEffect(() => {
    if (usuario) {
      // Cargar los valores del usuario en el formulario
      setNombre(usuario.nombre + " " + usuario.apellidos || "");
      setEmail(usuario.email || "");
      setTipoDocumento(usuario.tipoDocumento || "");
      setNumeroDocumento(usuario.documento || "");
      setTelefono(usuario.telefono || "");

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: "success",
        title: "Se han cargado tus datos personales",
      });
    }
  }, []);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAcceptedTerms(event.target.checked);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors({});
    const newErrors: {
      nombre?: string;
      email?: string;
      tipoDocumento?: string;
      documento?: string;
      telefono?: string;
      tipoSolicitud?: string;
      contenido?: string;
      checkbox?: string;
    } = {};

    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(nombre.trim())) {
      newErrors.nombre = "El nombre solo puede contener letras";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Ingresa un correo válido";
    }
    if (!tipoDocumento) {
      newErrors.tipoDocumento = "Selecciona un tipo de documento";
    }
    if (!/^\d{9}$/.test(telefono)) {
      newErrors.telefono = "El número de teléfono debe contener 9 dígitos";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!acceptedTerms) {
      MySwal.fire({
        title: "Atención",
        text: "Debe aceptar los términos y condiciones para continuar.",
        icon: "warning",
      });
      return;
    }

    if (loading) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);

    const products = getCartFromLocalStorage();
    if (products.length === 0) {
      MySwal.fire({
        title: "Atención",
        text: "El carrito está vacío. Agregue productos antes de enviar la cotización.",
        icon: "warning",
      });
      return;
    }

    const usuario = obtenerUsuario();
    if (!usuario) {
      MySwal.fire({
        title: "Atención",
        text: "Debe iniciar sesión para enviar la cotización.",
        icon: "warning",
      });
      return;
    }

    const body: CotizacionRequestDTO = {
      usuarioID: usuario.id,
      nombre,
      tipoDocumento: tipoDocumento,
      documento: numeroDocumento,
      telefono,
      email,
      comentario: comentarios,
      productos: products,
    };

    try {
      const response = await postCotizacion(body);
      MySwal.fire({
        title: "La cotización se ha enviado correctamente.",
        text: "Nos pondremos en contacto contigo pronto.",
        imageUrl:
          "https://res.cloudinary.com/dbxcev580/image/upload/v1763152355/logo-tp_flb8zp.png",
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: "Logo de la empresa",
        confirmButtonColor: "var(--primary-color)",
        confirmButtonText: "Aceptar",
      });
      console.log("Respuesta backend:", response);
      setNombre("");
      setTipoDocumento("");
      setNumeroDocumento("");
      setTelefono("");
      setEmail("");
      setComentarios("");
      clearCart();
      navigate(routes.profile_user);
    } catch (error) {
      console.error(error);
      MySwal.fire({
        title: "Error",
        text: "Ocurrió un problema al enviar la cotización.",
        icon: "error",
      });
    }
  };

  return (
    <div className={styles.container}>
      <Banner title="Solicitud de Cotización" />
      <p className={styles.description}>
        Complete la información en las siguientes secciones
      </p>

      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div className={styles.section}>
          <div className={styles.sectionNumber}>1</div>
          <div className={styles.sectionTitle}>Información Personal</div>
          <div className={styles.inputRow}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                placeholder="Nombre Completo o de la Empresa *"
                minLength={3}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              {errors.nombre && <Error message={errors.nombre} />}
            </div>
          </div>
          <div className={styles.inputRow}>
            <div className={styles.inputWrapper}>
              <input
                type="tel"
                className={styles.input}
                placeholder="Teléfono *"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
              {errors.telefono && <Error message={errors.telefono} />}
            </div>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                className={styles.input}
                placeholder="Correo Electrónico *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <Error message={errors.email} />}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionNumber}>2</div>
          <div className={styles.sectionTitle}>Documentación</div>
          <div className={styles.inputRow}>
            <div className={styles.inputWrapper}>
              <CustomSelect
                options={options}
                placeholder="Tipo de Documento"
                onChange={(e) => setTipoDocumento(e)}
              />
              {errors.tipoDocumento && <Error message={errors.tipoDocumento} />}
            </div>

            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                placeholder="Número de Documento *"
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
              />
              {errors.documento && <Error message={errors.documento} />}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionNumber}>3</div>
          <div className={styles.sectionTitle}>Información Adicional</div>
          <div className={styles.inputWrapper}>
            <textarea
              className={styles.textarea}
              placeholder="Comentarios"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              name="comentarios"
            ></textarea>
            {errors.contenido && <Error message={errors.contenido} />}
          </div>
        </div>

        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="terms" className={styles.terms}>
            Acepto los <Link to={routes.tyc}>términos y condiciones</Link> y la{" "}
            <Link to={routes.privacy_policy}>política de privacidad</Link>
          </label>
        </div>

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Enviando..." : "Enviar Cotización"}
        </button>
      </form>
    </div>
  );
}

export default Checkout;
