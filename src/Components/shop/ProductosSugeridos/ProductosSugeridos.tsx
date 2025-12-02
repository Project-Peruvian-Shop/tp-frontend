import { useEffect, useState } from "react";
import styles from "./ProductosSugeridos.module.css";
import { useNavigate } from "react-router-dom";
import { getSugeridos } from "../../../services/producto.service";
import { addToCart } from "../../../utils/cartUtils";
import { routes } from "../../../utils/routes";
import ProductCard from "../card/ProductCard";
import type { PaginatedProductoResponseDTO } from "../../../models/Producto/Producto_response_dto";

interface ProductosSugeridosProps {
  producto: number;
  categoria: number;
}

function ProductosSugeridos(props: ProductosSugeridosProps) {
  const navigate = useNavigate();
  const { producto, categoria } = props;

  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState<PaginatedProductoResponseDTO[]>(
    []
  );

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true);
        const response = await getSugeridos(producto, categoria);
        setProductos(response);
      } catch (err) {
        console.error("Error cargando productos sugeridos: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [producto, categoria]);

  const handleAddToCart = async (producto: PaginatedProductoResponseDTO) => {
    const redirect = await addToCart(producto);

    if (redirect) {
      navigate(routes.shop_cart);
    }
  };

  return (
    <>
      {!loading && productos?.length > 0 && (
        <div className={styles.container}>
          <div className={styles.subtitle}>Productos sugeridos</div>
          <div className={styles.productosGrid}>
            {productos.map((sugerido) => (
              <ProductCard
                key={sugerido.id}
                link={`${routes.product}${sugerido.id}`}
                img={sugerido.imagenUrl}
                title={sugerido.nombre}
                alt={sugerido.imagenAlt}
                click={() => handleAddToCart(sugerido)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default ProductosSugeridos;
