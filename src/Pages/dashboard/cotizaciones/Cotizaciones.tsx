import { useEffect, useState } from "react";
import styles from "./Cotizaciones.module.css";
import type { PaginatedResponse } from "../../../services/global.interfaces";
import type {
  Action,
  Column,
} from "../../../Components/dashboard/table/DashboardTable";
import DashboardTable from "../../../Components/dashboard/table/DashboardTable";
import type { CotizacionDashboardDTO } from "../../../models/Cotizacion/Cotizacion_response_dto";
import {
  change_state,
  getAllCotizaciones,
  getQuantityCotizaciones,
  getSearchCotizaciones,
  updateObservacionCotizacion,
} from "../../../services/cotizacion.service";
import IconSVG from "../../../Icons/IconSVG";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ModalObservacionEstado from "../../../Components/dashboard/Modals/Cotizaciones/ModalObservacionesEstado";
import SearchBar from "../../../Components/dashboard/searchbar/SearchBar";
import MapCard from "../../../Components/dashboard/mapCard/MapCard";
import { obtenerUsuario } from "../../../utils/auth";
import { UserRoleConst } from "../../../models/Usuario/Usuario";
import { Loader } from "../../../Components/loader/loader";

function Cotizaciones() {
  const [cotizaciones, setCotizaciones] =
    useState<PaginatedResponse<CotizacionDashboardDTO>>();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const usuario = obtenerUsuario();

  const [cantidad, setCantidad] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] =
    useState<CotizacionDashboardDTO | null>(null);
  const MySwal = withReactContent(Swal);
  const navigate = useNavigate();

  useEffect(() => {
    if (search.length >= 3) {
      const delay = setTimeout(() => {
        fetchSearch(search, page);
      }, 400);
      return () => clearTimeout(delay);
    } else {
      fetchAll(page);
      loadCantidadCotizaciones();
    }
  }, [search, page]);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const fetchAll = async (page: number = 0) => {
    setLoading(true);
    try {
      const res = await getAllCotizaciones(page);
      setCotizaciones(res);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearch = async (text: string, page: number = 0) => {
    setLoading(true);
    try {
      const res = await getSearchCotizaciones(text, page);
      setCotizaciones(res);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const loadCotizaciones = async (page: number) => {
    try {
      const res: PaginatedResponse<CotizacionDashboardDTO> =
        await getAllCotizaciones(page, 10);
      setCotizaciones(res);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error("Error cargando cotizaciones:", error);
    }
  };

  const loadCantidadCotizaciones = async () => {
    try {
      const cantidadCotizaciones = await getQuantityCotizaciones();
      setCantidad(cantidadCotizaciones);
    } catch (error) {
      console.error("Error cargando cantidad de cotizaciones:", error);
    }
  };

  const handleSaveObservacion = async (
    id: number,
    nuevaObservacion: string
  ) => {
    if (!cotizaciones) return;

    try {
      if (nuevaObservacion.trim() === "") {
        await MySwal.fire({
          icon: "warning",
          title: "Observación vacía",
          text: "Por favor, ingresa una observación.",
        });
        return;
      }

      if (
        nuevaObservacion.trim() ===
        (selectedCotizacion?.observaciones || "").trim()
      ) {
        await MySwal.fire({
          icon: "info",
          title: "Sin cambios",
          text: "No se detectaron modificaciones en la observación.",
        });
        return;
      }

      await updateObservacionCotizacion(id, nuevaObservacion);

      setShowModal(false);
      await MySwal.fire({
        icon: "success",
        title: "¡Observación actualizada!",
        text: "La observación ha sido modificada correctamente.",
      });

      await loadCotizaciones(page);
    } catch (error: unknown) {
      let errorMessage = "Error al guardar la observación";

      type AxiosErrorLike = {
        isAxiosError?: boolean;
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      const axiosError = error as AxiosErrorLike;

      if (axiosError.isAxiosError) {
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      MySwal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  const handleChangeEstado = async (
    id: number,
    nuevoEstado:
      | "PENDIENTE"
      | "EN_PROCESO"
      | "ENVIADA"
      | "ACEPTADA"
      | "RECHAZADA"
      | "CERRADA",
    observacion: string
  ) => {
    try {
      await change_state(id, nuevoEstado, observacion);
      await loadCotizaciones(page);
      setShowModal(false);
      await MySwal.fire({
        title: "Estado actualizado",
        icon: "success",
        text: `El estado se cambió correctamente.`,
      });
    } catch (error: unknown) {
      let errorMessage = "Error al editar el estado de la cotización";

      type AxiosErrorLike = {
        isAxiosError?: boolean;
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      const axiosError = error as AxiosErrorLike;

      if (axiosError.isAxiosError) {
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      MySwal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  // columnas
  const columns: Column<CotizacionDashboardDTO>[] = [
    { header: "Número", accessor: "numeroCotizacion" },
    { header: "Cliente", accessor: "clienteNombre" },
    {
      header: "Fecha",
      accessor: "creacion",
      render: (_, row) => {
        const fecha = new Date(row.creacion as string);
        return (
          <span>
            {fecha.toLocaleDateString("es-PE", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </span>
        );
      },
    },
    {
      header: "Estado",
      accessor: "estado",
      render: (value) => (
        <MapCard property="estadoCotizacion" value={value as string} />
      ),
    },
    {
      header: "Observaciones",
      accessor: "observaciones",
      render: (_, row) => {
        if (row.observaciones && row.observaciones.length > 16) {
          return (
            <span title={row.observaciones}>
              {row.observaciones.substring(0, 16)}...
            </span>
          );
        }
        return (
          <span>
            {row.observaciones
              ? String(row.observaciones)
              : "No hay observaciones"}
          </span>
        );
      },
    },
    // acciones de la tabla
  ];
  const actions: Action<CotizacionDashboardDTO>[] = [
    {
      label: "Ver",
      icon: <IconSVG name="view-secondary" size={20} />,
      onClick: (row) => navigate(`/dashboard/cotizacion/${row.id}`),
    },
  ];

  if (
    usuario?.rol === UserRoleConst.ADMINISTRADOR ||
    usuario?.rol === UserRoleConst.SUPERADMIN
  ) {
    actions.push({
      label: "Editar",
      icon: <IconSVG name="edit-secondary" size={20} />,
      onClick: (row) => {
        setSelectedCotizacion(row);
        setShowModal(true);
      },
    });
  }

  return (
    <div>
      <div className={styles.dashboardHeader}>
        <div className={styles.title}>Cotizaciones</div>

        <div className={styles.searchBarContainer}>
          <SearchBar
            placeholder="Buscar cotización..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.headerActions}>
          <div className={styles.totalProducts}>
            <IconSVG
              name="cotizacion"
              size={24}
              className={styles.cotizacionIcon}
            />
            Total: {cantidad} Cotizaciones
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <Loader message="Cargando cotizaciones..." />
        ) : (
          <DashboardTable
            columns={columns}
            data={cotizaciones ? cotizaciones.content : []}
            actions={actions}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
      {showModal && selectedCotizacion && (
        <ModalObservacionEstado
          show={showModal}
          cotizacion={selectedCotizacion}
          onClose={() => setShowModal(false)}
          onSaveObservacion={handleSaveObservacion}
          onChangeEstado={handleChangeEstado}
        />
      )}
    </div>
  );
}

export default Cotizaciones;
