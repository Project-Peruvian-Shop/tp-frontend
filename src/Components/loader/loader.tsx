import React from "react";
import styles from "./styles.module.css";
import { COLORS } from "../../utils/constants";

interface LoaderProps {
  message?: string;
  color?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  message = "Cargando...",
  color = COLORS.primary,
}) => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.spinner} style={{ borderTopColor: color }} />
      {message && (
        <p className={styles.loaderText} style={{ color }}>
          {message}
        </p>
      )}
    </div>
  );
};
