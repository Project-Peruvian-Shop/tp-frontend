import styles from "./Mensajes.module.css";
import type { PaginatedResponse } from "../../../services/global.interfaces";
import type {
  Action,
  Column,
} from "../../../Components/dashboard/table/DashboardTable";
import DashboardTable from "../../../Components/dashboard/table/DashboardTable";
import { useEffect, useState } from "react";
import {
  changeStateMensaje,
  getAllMensajes,
  getQuantityMensajes,
  getSearchMensajes,
} from "../../../services/mensajes.service";
import type { MensajeDashboardDTO } from "../../../models/Mensaje/Mensaje_response_dto";
import IconSVG from "../../../Icons/IconSVG";
import MapCard from "../../../Components/dashboard/mapCard/MapCard";
import SearchBar from "../../../Components/dashboard/searchbar/SearchBar";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ModalMensajes from "../../../Components/dashboard/Modals/Mensajes/ModalMensajes";
import { useNavigate } from "react-router-dom";
import { UserRoleConst } from "../../../models/Usuario/Usuario";
import { obtenerUsuario } from "../../../utils/auth";
import { Loader } from "../../../Components/loader/loader";
function Mensajes() {
  const [mensajes, setMensajes] =
    useState<PaginatedResponse<MensajeDashboardDTO>>();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [cantidad, setCantidad] = useState<MensajeDashboardDTO>();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const usuario = obtenerUsuario();

  const [modalShow, setModalShow] = useState(false);
  const [selectedMensaje, setSelectedMensaje] =
    useState<MensajeDashboardDTO | null>(null);

  const MySwal = withReactContent(Swal);

  const navigate = useNavigate();

  useEffect(() => {
    loadCantidadMensajes();
  }, [page]);

  useEffect(() => {
    if (search.trim().length >= 3) {
      const delay = setTimeout(() => {
        fetchSearch(search, page);
      }, 400);
      return () => clearTimeout(delay);
    } else {
      fetchAll(page);
    }
  }, [search, page]);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const fetchAll = async (page: number = 0) => {
    setLoading(true);
    try {
      const res = await getAllMensajes(page);
      setMensajes(res);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearch = async (text: string, page: number = 0) => {
    setLoading(true);
    try {
      const res = await getSearchMensajes(text, page);
      setMensajes(res);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const loadCantidadMensajes = async () => {
    try {
      const cantidadMensajes = await getQuantityMensajes(
        new Date().getMonth() + 1
      );
      setCantidad(cantidadMensajes);
    } catch (error) {
      console.error("Error cargando cantidad de mensajes:", error);
    }
  };

  const handleChangeState = async (
    id: number,
    nuevoEstado: "PENDIENTE" | "EN_PROCESO" | "RESUELTO" | "CERRADO"
  ) => {
    try {
      await changeStateMensaje(id, nuevoEstado);
      await fetchAll(page);
      await loadCantidadMensajes();
      setModalShow(false);
      MySwal.fire({
        icon: "success",
        title: "Éxito",
        text: "El estado del mensaje ha sido actualizado.",
      });
    } catch (error: unknown) {
      let errorMessage = "Error al editar el estado del mensaje";

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

  // Definición de columnas
  const columns: Column<MensajeDashboardDTO>[] = [
    {
      header: "Tipo",
      accessor: "tipo",
      render: (value) => (
        <MapCard property="tipoMensaje" value={value as string} />
      ),
    },
    {
      header: "Mensaje",
      accessor: "mensaje",
      render: (_, row) => {
        const palabras = row.mensaje.split(" ");
        const textoCorto =
          palabras.length > 12
            ? palabras.slice(0, 12).join(" ") + "..."
            : row.mensaje;
        return <span>{textoCorto}</span>;
      },
    },
    {
      header: "Fecha de envío",
      accessor: "creacion",
      render: (value) => {
        const fecha = new Date(value as string);
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
        <MapCard property="estadoMensaje" value={value as string} />
      ),
    },
  ];

  // Acciones con iconos
  const actions: Action<MensajeDashboardDTO>[] = [
    {
      label: "Ver",
      icon: <IconSVG name="view-secondary" size={20} />,
      onClick: (row) => navigate(`/dashboard/mensaje/${row.id}`),
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
        setSelectedMensaje(row);
        setModalShow(true);
      },
    });
  }

  return (
    <div>
      <div className={styles.dashboardHeader}>
        <div className={styles.title}>Mensajes</div>

        <div className={styles.searchBarContainer}>
          <SearchBar
            placeholder="Buscar mensaje..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.headerActions}>
          <div className={styles.totalCount}>
            Mensajes del mes: {cantidad?.mensaje_response_count_mes}
            <IconSVG
              name="mensaje"
              size={20}
              className={styles.mensajeSecondaryIcon}
            />
          </div>
          <div className={styles.totalSecondaryCount}>
            Mensajes por responder: {cantidad?.mensaje_pending_count_mes}
            <IconSVG
              name="mensaje"
              size={20}
              className={styles.mensajePrimaryIcon}
            />
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <Loader message="Cargando mensajes..." />
        ) : (
          <DashboardTable
            columns={columns}
            data={mensajes?.content || []}
            actions={actions}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
      {modalShow && (
        <ModalMensajes
          mensaje={selectedMensaje as MensajeDashboardDTO}
          onClose={() => setModalShow(false)}
          onSubmit={handleChangeState}
        />
      )}
    </div>
  );
}
export default Mensajes;
