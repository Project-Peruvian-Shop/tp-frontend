import styles from "./Dashboard.module.css";
import { useEffect, useState } from "react";
import {
  SummaryCard,
  type PeriodSummaryCard,
} from "../../../Components/dashboard/summarycard/SummaryCard";
import {
  agregarAuthToken,
  agregarRefreshToken,
  agregarUsuario,
  obtenerUsuario,
} from "../../../utils/auth";
import type {
  CategoriaCotizadaDTO,
  CotizacionesPorMesDTO,
  KPIResponseDTO,
  ProductoCotizadoDTO,
} from "../../../models/dashboard/DashboardResponse";
import {
  getCategorias,
  getCotizaciones,
  getKPIS,
  getProductos,
} from "../../../services/dashboard.service";
import CotizacionesChart from "../../../Components/dashboard/charts/CotizacionChart";
import ProductosMasCotizadosChart from "../../../Components/dashboard/charts/ProductoChart";
import CategoriasMasCotizadasChart from "../../../Components/dashboard/charts/CategoriasChart";
import { routes } from "../../../utils/routes";
import { useNavigate } from "react-router-dom";
import { obtenerNuevoToken } from "../../../services/auht.service";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
function Dashboard() {
  const [period, setPeriod] = useState<PeriodSummaryCard>("MONTH");
  const [modo, setModo] = useState<"APARICION" | "DEMANDA">("DEMANDA");

  const usuario = obtenerUsuario();

  const navigate = useNavigate();

  const MySwal = withReactContent(Swal);

  const [kpis, setKpis] = useState<KPIResponseDTO | null>(null);
  const [cotizaciones, setCotizaciones] = useState<
    CotizacionesPorMesDTO[] | null
  >(null);
  const [productos, setProductos] = useState<ProductoCotizadoDTO[]>([]);
  const [categorias, setCategorias] = useState<CategoriaCotizadaDTO[]>([]);

  const [loadingRefresh, setLoadingRefresh] = useState(false);

  const checkAndRefreshToken = async (refreshToken: string) => {
    try {
      const newToken = await obtenerNuevoToken(refreshToken);
      agregarAuthToken(newToken.accessToken);
      agregarRefreshToken(newToken.refreshToken);
      agregarUsuario({
        ...obtenerUsuario(),
        accessToken: newToken.accessToken,
        refreshToken: newToken.refreshToken,
      });
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Sesión expirada",
        text: "Por favor, vuelve a iniciar sesión.",
      }).then(() => {
        navigate(routes.login);
        console.log(error);
      });
    }
  };

  const obtenerRegistros = async () => {
    try {
      setLoadingRefresh(true);

      const dataKpis = await getKPIS(period);
      setKpis(dataKpis);

      const dataCot = await getCotizaciones();
      setCotizaciones(dataCot);

      const dataProd = await getProductos(
        modo,
        new Date().getMonth() + 1,
        new Date().getFullYear()
      );
      setProductos(dataProd);

      const dataCat = await getCategorias(
        modo,
        new Date().getMonth() + 1,
        new Date().getFullYear()
      );
      setCategorias(dataCat);
    } finally {
      setLoadingRefresh(false);
    }
  };

  const handleRefresh = () => {
    obtenerRegistros();
  };

  useEffect(() => {
    const localUser = obtenerUsuario();

    if (!localUser) {
      navigate(routes.login);
      return;
    }
    const fetchData = async () => {
      try {
        await checkAndRefreshToken(localUser.refreshToken);
      } catch {
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los datos del perfil o cotizaciones",
        });
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    const fetchKPIS = async () => {
      try {
        const data = await getKPIS(period);
        setKpis(data);
      } catch (error) {
        console.error("Error cargando kpis", error);
      }
    };
    const fetchCotizaciones = async () => {
      try {
        const data = await getCotizaciones();
        setCotizaciones(data);
      } catch (error) {
        console.error("Error cargando cotizaciones", error);
      }
    };

    const fetchProductos = async () => {
      try {
        const data = await getProductos(
          modo,
          new Date().getMonth() + 1,
          new Date().getFullYear()
        );
        setProductos(data);
      } catch (error) {
        console.error("Error cargando productos", error);
      }
    };

    const fetchCategorias = async () => {
      try {
        const data = await getCategorias(
          modo,
          new Date().getMonth() + 1,
          new Date().getFullYear()
        );
        setCategorias(data);
      } catch (error) {
        console.error("Error cargando categorias", error);
      }
    };

    fetchKPIS();
    fetchCotizaciones();
    fetchProductos();
    fetchCategorias();
  }, [period, modo]);

  return (
    <div>
      <div className={styles.dashboardHeader}>
        <div className={styles.title}>Bienvenido, {usuario?.nombre}</div>
        <button
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={loadingRefresh}
        >
          {loadingRefresh ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.kpis}>
            <SummaryCard
              title="Cotizaciones Pendientes"
              value={kpis?.cotizacionesPendientes || 0}
              icon="clipboard"
              color="blue"
              period={period}
              onPeriodChange={setPeriod}
            />

            <SummaryCard
              title="Cotizaciones Aceptadas"
              value={kpis?.cotizacionesAceptadas || 0}
              icon="check"
              color="green"
              period={period}
              onPeriodChange={setPeriod}
            />

            <SummaryCard
              title="Mensajes Pendientes"
              value={kpis?.mensajesPendientes || 0}
              icon="message"
              color="orange"
              period={period}
              onPeriodChange={setPeriod}
            />
          </div>

          <div className={styles.chartsContainer}>
            <div className={styles.cotizaciones}>
              <div>Cotizaciones aceptadas:</div>
              <CotizacionesChart data={cotizaciones || []} />
            </div>

            <div className={styles.productos}>
              Productos
              {productos && productos.length > 0 ? (
                <ProductosMasCotizadosChart data={productos} />
              ) : (
                <p>No hay datos disponibles</p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.headerRight}>Líneas</div>

          <div className={styles.categorias}>
            <CategoriasMasCotizadasChart data={categorias} name={modo} />
          </div>

          <div className={styles.headerRight}>
            <div className={styles.modoToggle}>
              <button
                className={`${styles.toggleButton} ${
                  modo === "DEMANDA" ? styles.active : ""
                }`}
                onClick={() => setModo("DEMANDA")}
              >
                Demanda
              </button>
              <button
                className={`${styles.toggleButton} ${
                  modo === "APARICION" ? styles.active : ""
                }`}
                onClick={() => setModo("APARICION")}
              >
                Aparición
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
