import { useEffect, useState } from "react";
import styles from "./Producto.module.css";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import type { ProductoDTO } from "../../../models/Producto/Producto_response_dto";
import { saveProductoToCart } from "../../../utils/localStorage";
import { routes } from "../../../utils/routes";
import { getProductoById } from "../../../services/producto.service";
import SubHeader from "../../../Components/shop/subheader/SubHeader";
import ProductosSugeridos from "../../../Components/shop/ProductosSugeridos/ProductosSugeridos";
import { Loader } from "../../../Components/loader/loader";

const Producto = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  const [producto, setProducto] = useState<ProductoDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(10);

  const handleCategoriaClick = () => {
    navigate(`${routes.shop}?categoriaId=${producto!.categoriaId}`);
  };

  const agregarAlCarrito = (productoId: number, cantidad: number) => {
    console.log(
      `Agregando producto ${productoId} con cantidad ${cantidad} al carrito`
    );
    saveProductoToCart(producto as ProductoDTO, cantidad);

    MySwal.fire({
      icon: "success",
      title: "¡Producto agregado!",
      text: `Se agregó ${cantidad} unidad(es) al carrito.`,
      showCancelButton: true,
      confirmButtonText: "Ir al carrito",
      cancelButtonText: "Seguir cotizando",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(routes.shop_cart);
      }
    });
  };

  useEffect(() => {
    if (!id) {
      navigate(routes.shop);
      return;
    }

    const fetchProducto = async () => {
      try {
        setLoading(true);
        const response = await getProductoById(Number(id));
        setProducto(response);
      } catch (err) {
        console.error("Error cargando producto:", err);
        navigate(routes.shop);
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id, navigate]);

  return (
    <>
      <SubHeader title="Producto" />

      <div className={styles.productoContainer}>
        {loading ? (
          <Loader message="Cargando producto..." />
        ) : producto ? (
          <div className={styles.container}>
            <div className={styles.banner}>
              <div className={styles.bannerLeft}>
                <img
                  src={producto.productoEnlace}
                  alt={producto.productoAlt}
                  className={styles.productoImagen}
                />
              </div>

              <div className={styles.bannerRight}>
                <div className={styles.title}>{producto.nombre}</div>

                <div className={styles.descripcion}>{producto.descripcion}</div>

                <div
                  className={styles.categoria}
                  onClick={handleCategoriaClick}
                  style={{ cursor: "pointer" }}
                >
                  Categoría:{" "}
                  <span className={styles.categoriaNombre}>
                    {producto.categoriaNombre}
                  </span>
                </div>
                <div className={styles.cantidadContainer}>
                  <button
                    type="button"
                    className={styles.restar}
                    onClick={() => cantidad > 1 && setCantidad(cantidad - 10)}
                  >
                    -
                  </button>

                  <input
                    type="number"
                    className={styles.cantidadInput}
                    value={cantidad}
                    min={1}
                    max={300}
                    step={1}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 10;
                      setCantidad(Math.max(1, Math.min(1000, value)));
                    }}
                  />

                  <button
                    type="button"
                    className={styles.sumar}
                    onClick={() => setCantidad(cantidad + 10)}
                  >
                    +
                  </button>

                  <button
                    className={styles.addToCartButton}
                    onClick={() => agregarAlCarrito(producto.id, cantidad)}
                  >
                    Añadir al carrito
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.descripcionContainer}>
                <div className={styles.subtitle}>Descripción</div>
                <img
                  src={producto.categoriaEnlace}
                  alt={producto.categoriaAlt}
                  className={styles.categoriaImagen}
                />
              </div>

              <div className={styles.usosContainer}>
                <div className={styles.subtitle}>Usos</div>
                <p>{producto.categoriaUsos}</p>
              </div>
            </div>
          </div>
        ) : (
          <p>No se encontró el producto</p>
        )}
      </div>

      <ProductosSugeridos
        producto={producto?.id ?? 1}
        categoria={producto?.categoriaId ?? 1}
      />
    </>
  );
};

export default Producto;
