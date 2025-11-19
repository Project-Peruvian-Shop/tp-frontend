import React from "react";
import styles from "./Sidebar.module.css";
import type { AllAndQuantityResponseDTO } from "../../../models/Categoria/Categoria_response";

export interface SidebarProps {
  arrayCategories: AllAndQuantityResponseDTO[];
  onCategoryClick?: (categoryId: number | null) => void;
}

function Sidebar(props: SidebarProps) {
  const { arrayCategories, onCategoryClick } = props;

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.title}>LÍNEAS</div>

      <div className={styles.divisor}></div>

      <div className={styles.listContainer}>
        {arrayCategories.map((category) => (
          <React.Fragment key={category.id}>
            <button
              className={styles.categoryItem}
              onClick={() => onCategoryClick?.(category.id)}
            >
              {category.nombre} ({category.cantidad})
            </button>
            <div className={styles.divisor}></div>
          </React.Fragment>
        ))}

        <button
          className={styles.categoryItem}
          onClick={() => onCategoryClick?.(null)}
        >
          Todas ({arrayCategories.reduce((sum, cat) => sum + cat.cantidad, 0)})
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
