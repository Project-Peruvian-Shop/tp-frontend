import { useEffect, useState } from "react";
import type { CategoriaDashboardDTO } from "../../../models/Categoria/Categoria_response";
import styles from "./Categorias.module.css";
import type { PaginatedResponse } from "../../../services/global.interfaces";
import {
  createCategoria,
  deleteCategoria,
  getAllCategories,
  getCategoryById,
  getQuantityCategorias,
  getSearchCategories,
  updateCategoria,
} from "../../../services/categoria.service";
import type {
  Action,
  Column,
} from "../../../Components/dashboard/table/DashboardTable";
import DashboardTable from "../../../Components/dashboard/table/DashboardTable";
import { useNavigate } from "react-router-dom";
import IconSVG from "../../../Icons/IconSVG";
import ModalCategoriaCreate from "../../../Components/dashboard/Modals/Categoria/ModalCategoriaCreate";
import ModalCategoriaEdit from "../../../Components/dashboard/Modals/Categoria/ModalCategoriaEdit";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { createImagen } from "../../../services/imagen.service";
import SearchBar from "../../../Components/dashboard/searchbar/SearchBar";
import { UserRoleConst } from "../../../models/Usuario/Usuario";
import { obtenerUsuario } from "../../../utils/auth";
import { Loader } from "../../../Components/loader/loader";

function Categorias() {
  const [categorias, setCategorias] =
    useState<PaginatedResponse<CategoriaDashboardDTO>>();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [cantidad, setCantidad] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  const usuario = obtenerUsuario();

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<CategoriaDashboardDTO | null>(null);

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    loadCantidadCategorias();
  }, []);

  useEffect(() => {
    if (search.length >= 3) {
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
      const res = await getAllCategories(page);
      setCategorias(res);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearch = async (text: string, page: number = 0) => {
    setLoading(true);
    try {
      const res = await getSearchCategories(text, page);
      setCategorias(res);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const loadCantidadCategorias = async () => {
    try {
      const cantidadCategorias = await getQuantityCategorias();
      setCantidad(cantidadCategorias);
    } catch (error) {
      console.error("Error cargando cantidad de categorias:", error);
    }
  };

  interface CategoriaFormData {
    nombre: string;
    norma: string;
    usos: string;
    imagenFile: File | null;
  }

  const uploadImagen = async (
    file: File | null,
    defaultID = 2
  ): Promise<number> => {
    if (!file) return categoriaSeleccionada?.imagenId ?? defaultID;

    const formData = new FormData();
    formData.append("file", file);

    const imagenResponse = await createImagen(formData);
    return imagenResponse.id;
  };

  const handleAddCategoria = async (data: CategoriaFormData) => {
    try {
      const imagenID = await uploadImagen(data.imagenFile);
      const body = {
        nombre: data.nombre,
        norma: data.norma,
        usos: data.usos,
        imagenId: imagenID,
      };

      const response = await createCategoria(body);
      if (response) {
        MySwal.fire({
          icon: "success",
          title: "¡Línea creada!",
          text: "La línea ha sido creada exitosamente.",
        });
        setShowModal(false);
        await loadCantidadCategorias();
        await fetchAll();
      }
    } catch (error: unknown) {
      let errorMessage = "Error al crear la línea";

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

  const handleEditCategoria = async (data: CategoriaFormData) => {
    if (!categoriaSeleccionada) return;

    // Verificación si hay cambios
    if (
      data.nombre === categoriaSeleccionada.nombre &&
      data.norma === categoriaSeleccionada.norma &&
      data.usos === categoriaSeleccionada.usos &&
      data.imagenFile === null
    ) {
      MySwal.fire({
        icon: "info",
        title: "Sin cambios",
        text: "No has realizado ninguna modificación.",
      });
      return;
    }
    try {
      const imagenID = await uploadImagen(data.imagenFile);
      const body = {
        nombre: data.nombre,
        norma: data.norma,
        usos: data.usos,
        imagenId: imagenID,
      };
      const response = await updateCategoria(categoriaSeleccionada.id, body);
      if (response) {
        MySwal.fire({
          icon: "success",
          title: "Líneas editada!",
          text: "La línea ha sido editada exitosamente.",
        });
        setShowEditModal(false);
        await loadCantidadCategorias();
        await fetchAll();
      }
    } catch (error: unknown) {
      let errorMessage = "Error al editar la línea";

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
const handleDeleteCategoria = async (categoria: CategoriaDashboardDTO) => {
  const result = await MySwal.fire({
    title: "¿Estás seguro?",
    text: `Esta acción eliminará la categoría ${categoria.nombre}.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!result.isConfirmed) return;

  try {
    await deleteCategoria(categoria.id);
    await fetchAll();
    await loadCantidadCategorias();

    MySwal.fire({
      icon: "success",
      title: "Categoría eliminada",
      text: `La categoría ${categoria.nombre} ha sido eliminada.`,
    });

  } catch (error: unknown) {
  const err = error as { response?: { data?: { message?: string } } };

  const backendMessage = err?.response?.data?.message || "";
  
  if (backendMessage.includes("productos asociados")) {
    MySwal.fire({
      icon: "info",
      title: "No se puede eliminar",
      html: `
        La categoría <b>${categoria.nombre}</b> no puede eliminarse
        porque tiene <b>productos asociados</b>.<br><br>
        <strong>Debes cambiar la línea de esos productos primero.</strong>
      `,
    });
    return;
  }

  MySwal.fire({
    icon: "error",
    title: "Error",
    text: "Error al eliminar la categoría.",
  });

  console.error(error);
}

};


  // Definición de columnas
  const columns: Column<CategoriaDashboardDTO>[] = [
    {
      header: "Nombre",
      accessor: "nombre",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            src={row.imagenEnlace}
            alt={row.imagenAlt}
            style={{
              width: "40px",
              height: "40px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
          />
          <span>{row.nombre}</span>
        </div>
      ),
    },
    { header: "Norma", accessor: "norma" },
    {
      header: "Usos",
      accessor: "usos",
      render: (_, row) => {
        const palabras = row.usos.split(" ");
        const textoCorto =
          palabras.length > 12
            ? palabras.slice(0, 12).join(" ") + "..."
            : row.usos;
        return <span>{textoCorto}</span>;
      },
    },
  ];

  // Acciones con iconos
  const actions: Action<CategoriaDashboardDTO>[] = [
    {
      label: "Ver",
      icon: <IconSVG name="view-secondary" size={20} />,
      onClick: (row) => {
        console.log("Ver categoria", row);
        navigate(`/dashboard/category/${row.id}`);
      },
    },
  ];

  if (
    usuario?.rol === UserRoleConst.ADMINISTRADOR ||
    usuario?.rol === UserRoleConst.SUPERADMIN
  ) {
    actions.push(
      {
        label: "Editar",
        icon: <IconSVG name="edit-secondary" size={20} />,
        onClick: async (row) => {
          const categoria = await getCategoryById(row.id);
          setCategoriaSeleccionada(categoria);
          setShowEditModal(true);
        },
      },
      {
        label: "Eliminar",
        icon: <IconSVG name="delete-secondary" size={20} />,
        onClick: (row) => {
          handleDeleteCategoria(row);
        },
      }
    );
  }

  return (
    <div>
      <div className={styles.dashboardHeader}>
        <div className={styles.title}>Líneas</div>

        <div className={styles.searchBarContainer}>
          <SearchBar
            placeholder="Buscar línea..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.headerActions}>
          <div className={styles.totalProducts}>
            <IconSVG
              name="categoria"
              size={24}
              className={styles.categoriaIcon}
            />
            Total: {cantidad} Líneas
          </div>

          {(usuario?.rol === UserRoleConst.ADMINISTRADOR ||
            usuario?.rol === UserRoleConst.SUPERADMIN) && (
            <button
              className={styles.addButton}
              onClick={() => setShowModal(true)}
            >
              + Añadir Línea
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <Loader message="Cargando líneas..." />
        ) : (
          <DashboardTable
            columns={columns}
            data={categorias?.content || []}
            actions={actions}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {showModal && (
        <ModalCategoriaCreate
          onClose={() => setShowModal(false)}
          onSubmit={handleAddCategoria}
        />
      )}

      {showEditModal && categoriaSeleccionada && (
        <ModalCategoriaEdit
          categoria={categoriaSeleccionada}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditCategoria}
        />
      )}
    </div>
  );
}
export default Categorias;
