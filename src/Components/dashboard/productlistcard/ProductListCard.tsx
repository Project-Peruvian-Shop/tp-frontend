import React from "react";
import styles from "./ProductListCard.module.css";
import Pagination from "../../pagination/Pagination";

export interface ProductItem {
  id: number;
  nombre: string;
  imagenUrl: string;
  imagenAlt: string;
  cantidad?: number;
}

interface ProductListCardProps {
  title: string;
  items: ProductItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ProductListCard: React.FC<ProductListCardProps> = ({
  title,
  items,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.subtitle}>{title}</div>
      <div className={styles.productList}>
        {items.length === 0 ? (
          <div className={styles.noItems}>No existen productos asociados.</div>
        ) : (
          items.map((item) => (
            <div className={styles.productItem} key={item.id}>
              <img
                src={item.imagenUrl}
                alt={item.imagenAlt}
                className={styles.productImage}
              />
              <span className={styles.productName}>{item.nombre}</span>
              {item.cantidad !== undefined && (
                <span className={styles.productCantidad}>{item.cantidad}</span>
              )}
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default ProductListCard;
