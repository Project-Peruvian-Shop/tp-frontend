import { Link } from "react-router-dom";
import IconSVG from "../../../Icons/IconSVG";
import styles from "./SubHeader.module.css";
import { useEffect, useState, useRef } from "react";
import { getCartFromLocalStorage } from "../../../utils/localStorage";
import { routes } from "../../../utils/routes";
import { getSearchProductos } from "../../../services/producto.service";
import type { ProductoDashboardDTO } from "../../../models/Producto/Producto_response_dto";

type SubHeaderProps = {
  title: string;
};

export default function SubHeader({ title }: SubHeaderProps) {
  const [cantidadCarrito, setCantidadCarrito] = useState(0);

  // 🔍 Estados de búsqueda
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductoDashboardDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // 🛑 Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🛒 Actualizar carrito
  useEffect(() => {
    const updateCartCount = () => {
      const updatedItems = getCartFromLocalStorage();
      setCantidadCarrito(updatedItems.length);
    };

    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  // 🔍 Debounce para llamar al backend Spring
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await getSearchProductos(query, 0, 5);
        setResults(response.content || []);
        setOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div className={styles.storebarContainer}>
      <div className={styles.storebarInner}>
        {/* Left: Store Icon & Title */}
        <div className={styles.titleContainer}>
          <Link to={routes.shop} className={styles.storeTitle}>
            {title}
          </Link>

          <Link to={routes.shop_cart} className={styles.cartSecondaryButton}>
            <IconSVG name="cart" size={20} className={styles.cartIcon} />
            <span className={styles.cartBadge}>{cantidadCarrito}</span>
          </Link>
        </div>

        {/* Centro: Buscador */}
        <div className={styles.searchContainer} ref={wrapperRef}>
          <div className={styles.searchWrapper}>
            <IconSVG name="search" size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar productos…"
              className={styles.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 3 && setOpen(true)}
            />
          </div>

          {/* 🔽 Dropdown */}
          {open && (
            <div className={styles.dropdown}>
              {loading && <div className={styles.dropdownItem}>Buscando…</div>}

              {!loading && results.length === 0 && (
                <div className={styles.dropdownItem}>Sin resultados</div>
              )}

              {!loading &&
                results.map((p) => (
                  <Link
                    key={p.id}
                    to={`/producto/${p.id}`}
                    className={styles.dropdownItem}
                    onClick={() => setOpen(false)}
                  >
                    <img
                      src={p.imagenEnlace}
                      alt={p.nombre}
                      className={styles.dropdownImg}
                    />
                    <span>{p.nombre}</span>
                  </Link>
                ))}
            </div>
          )}
        </div>

        {/* Right: Cart Button */}
        <Link to={routes.shop_cart} className={styles.cartButton}>
          <IconSVG name="cart" size={20} className={styles.cartIcon} />
          <span className={styles.cartText}>Carrito</span>
          <span className={styles.cartBadge}>{cantidadCarrito}</span>
        </Link>
      </div>
    </div>
  );
}
