import { useEffect, useState } from "react";
import type { PaginatedResponse } from "../../../services/global.interfaces";
import type {
  ProductoDashboardDTO,
  ProductoDTO,
} from "../../../models/Producto/Producto_response_dto";
import {
  createProducto,
  getAllProductos,
  getProductoById,
  updateProducto,
  getQuantityProductos,
  getSearchProductos,
  deleteProducto,
} from "../../../services/producto.service";
import DashboardTable, {
  type Action,
  type Column,
} from "../../../Components/dashboard/table/DashboardTable";
import styles from "./Productos.module.css";
import { useNavigate } from "react-router-dom";
import IconSVG from "../../../Icons/IconSVG";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import type { CategoriaDashboardDTO } from "../../../models/Categoria/Categoria_response";
import { createImagen } from "../../../services/imagen.service";
import ModalProductoCreate from "../../../Components/dashboard/Modals/Producto/ModalProductoCreate";
import ModalProductoEdit from "../../../Components/dashboard/Modals/Producto/ModalProductoEdit";
import SearchBar from "../../../Components/dashboard/searchbar/SearchBar";
import { getAllCategories } from "../../../services/categoria.service";
import { obtenerUsuario } from "../../../utils/auth";
import { UserRoleConst } from "../../../models/Usuario/Usuario";
import { Loader } from "../../../Components/loader/loader";

export default function ProductosTable() {
  const [productos, setProductos] =
    useState<PaginatedResponse<ProductoDashboardDTO>>();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [cantidad, setCantidad] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();

  const usuario = obtenerUsuario();

  // Categorías
  const [categorias, setCategorias] = useState<CategoriaDashboardDTO[]>([]);

  // Control de modales
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ProductoDTO | null>(null);

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    loadCategorias();
    loadCantidadProductos();
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
      const res = await getAllProductos(page);
      setProductos(res);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearch = async (text: string, page: number = 0) => {
    setLoading(true);
    try {
      const res = await getSearchProductos(text, page);
      setProductos(res);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    try {
      const res = await getAllCategories(0, 20);
      setCategorias(res.content);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const loadCantidadProductos = async () => {
    try {
      const cantidadProductos = await getQuantityProductos();
      setCantidad(cantidadProductos);
    } catch (error) {
      console.error("Error cargando cantidad de productos:", error);
    }
  };

  const uploadImagen = async (
    file: File | null,
    defaultID = 2
  ): Promise<number> => {
    if (!file) return productoSeleccionado?.imagenId ?? defaultID;

    const formData = new FormData();
    formData.append("file", file);

    const imagenResponse = await createImagen(formData);
    return imagenResponse.id;
  };

  interface ProductoFormData {
    nombre: string;
    descripcion: string;
    categoriaID: number;
    imagenFile: File | null;
  }

  const handleAddProduct = async (data: ProductoFormData) => {
    try {
      const imagenID = await uploadImagen(data.imagenFile);
      const body = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoriaID: data.categoriaID,
        imagenID: imagenID,
      };

      const response = await createProducto(body);
      if (response) {
        MySwal.fire({
          icon: "success",
          title: "¡Producto creado!",
          text: "El producto ha sido creado exitosamente.",
        });
        await loadCantidadProductos();
        await fetchAll();
        setShowModal(false);
      }
    } catch (error: unknown) {
      let errorMessage = "Error al añadir producto";

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

  const handleEditProduct = async (data: ProductoFormData) => {
    if (!productoSeleccionado) return;

    // Verificación si hay cambios
    if (
      data.nombre === productoSeleccionado.nombre &&
      data.descripcion === productoSeleccionado.descripcion &&
      data.categoriaID === productoSeleccionado.categoriaId &&
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
        descripcion: data.descripcion,
        categoriaID: data.categoriaID,
        imagenID,
      };

      const response = await updateProducto(productoSeleccionado.id, body);
      if (response) {
        MySwal.fire({
          icon: "success",
          title: "¡Producto actualizado!",
          text: "El producto ha sido modificado exitosamente.",
        });
        setShowEditModal(false);
        fetchAll();
      }
    } catch (error: unknown) {
      let errorMessage = "Error al editar producto";

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
  const handleDeleteProduct = async (producto: ProductoDashboardDTO) => {
    const result = await MySwal.fire({
      title: "¿Estás seguro?",
      text: `Esta acción eliminará el producto ${producto.nombre}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deleteProducto(producto.id);
        await fetchAll();
        await loadCantidadProductos();
        MySwal.fire({
          icon: "success",
          title: "Producto eliminado",
          text: `El producto ${producto.nombre} ha sido eliminado.`,
        });
      } catch (error) {
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: "Error al eliminar el producto.",
        });
        console.log(error);
        
      }
    }
  };

  // Definición de columnas
  const columns: Column<ProductoDashboardDTO>[] = [
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
              objectFit: "cover",
              height: "40px",
              borderRadius: "4px",
            }}
          />
          <span>{row.nombre}</span>
        </div>
      ),
    },
    { header: "Línea", accessor: "categoriaNombre" },
    {
      header: "Descripción",
      accessor: "descripcion",
      render: (_, row) => {
        const palabras = row.descripcion.split(" ");
        const textoCorto =
          palabras.length > 12
            ? palabras.slice(0, 12).join(" ") + "..."
            : row.descripcion;
        return <span>{textoCorto}</span>;
      },
    },
  ];

  const actions: Action<ProductoDashboardDTO>[] = [
    {
      label: "Ver",
      icon: <IconSVG name="view-secondary" size={20} />,
      onClick: (row) => {
        navigate(`/dashboard/product/${row.id}`);
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
          const producto = await getProductoById(row.id);
          setProductoSeleccionado(producto);
          setShowEditModal(true);
        },
      },
      {
        label: "Eliminar",
        icon: <IconSVG name="delete-secondary" size={20} />,
        onClick: (row) => {
          handleDeleteProduct(row);
        },
      }
    );
  }

  return (
    <div>
      <div className={styles.dashboardHeader}>
        <div className={styles.title}>Productos</div>

        <div className={styles.searchBarContainer}>
          <SearchBar
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.headerActions}>
          <div className={styles.totalProducts}>
            <IconSVG name="producto" size={20} className={styles.productIcon} />
            Total: {cantidad} Productos
          </div>

          {(usuario?.rol === UserRoleConst.ADMINISTRADOR ||
            usuario?.rol === UserRoleConst.SUPERADMIN) && (
            <button
              className={styles.addButton}
              onClick={() => setShowModal(true)}
            >
              + Añadir Producto
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <Loader message="Cargando productos..." />
        ) : (
          <DashboardTable
            columns={columns}
            data={productos?.content || []}
            actions={actions}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {showModal && (
        <ModalProductoCreate
          categorias={categorias}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddProduct}
        />
      )}

      {showEditModal && productoSeleccionado && (
        <ModalProductoEdit
          producto={productoSeleccionado}
          categorias={categorias}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditProduct}
        />
      )}
    </div>
  );
}
