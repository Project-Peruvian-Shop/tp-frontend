import styles from "./Cotizacion.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { routes } from "../../../utils/routes";
import { useEffect, useState } from "react";
import type { CotizacionFullDTO } from "../../../models/Cotizacion/Cotizacion_response_dto";
import {
  getCotizacionById,
  getProductosByCotizacionId,
} from "../../../services/cotizacion.service";
import InfoCard from "../../../Components/dashboard/infocard/InfoCard";
import ButtonPrimary from "../../../Components/buttons/ButtonPrimary";
import MapCard from "../../../Components/dashboard/mapCard/MapCard";
import type { PaginatedResponse } from "../../../services/global.interfaces";
import type { ProductoCarritoDetalleDTO } from "../../../models/CotizacionDetalle/Cotizacion_detalle";
import Banner from "../../../Components/banner/Banner";
import ProductListCard2 from "../../../Components/dashboard/productlistcard/ProductListCard2";
// import ProductListCard from "../../Components/dashboard/productlistcard/ProductListCard";
// import type { ProductoResponseDTO } from "../../models/Categoria/Categoria_response";
// import type { PaginatedResponse } from "../../services/global.interfaces";

function Cotizacion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cotizacion, setCotizacion] = useState<CotizacionFullDTO | null>(null);

  const [productos, setProductos] =
    useState<PaginatedResponse<ProductoCarritoDetalleDTO>>();
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!id) {
      navigate(routes.shop);
      return;
    }

    const fetchCotizacion = async (id: string) => {
      try {
        const [data, productosData] = await Promise.all([
          getCotizacionById(Number(id)),
          getProductosByCotizacionId(Number(id), page),
        ]);
        setCotizacion(data);
        setProductos(productosData);
      } catch (error) {
        console.error("Error al obtener la cotización:", error);
        navigate(routes.profile_user);
      }
    };

    fetchCotizacion(id);
  }, [id, navigate, page]);

  return (
    <div className={styles.container}>
      <Banner title={`Cotización ${cotizacion?.numero}`} />

      <div className={styles.content}>
        <div className={styles.left}>
          <InfoCard
            title="Datos de la Cotización"
            items={[
              {
                label: "Número de cotización:",
                value: cotizacion?.numero || "",
              },
              {
                label: "Estado:",
                value: (
                  <MapCard
                    property="estadoCotizacion"
                    value={cotizacion?.estado || ""}
                  />
                ),
              },
              {
                label: "Fecha de cotización:",
                value: cotizacion?.creacion
                  ? new Date(cotizacion.creacion).toLocaleDateString("es-PE")
                  : "",
              },
              { label: "Comentario:", value: cotizacion?.comentario || "-" },
            ]}
          />

          <InfoCard
            title="Datos de contacto"
            items={[
              {
                label: "Nº documento:",
                value: cotizacion
                  ? `${cotizacion.tipoDocumento ?? ""}${
                      cotizacion.documento ? " - " + cotizacion.documento : ""
                    }`
                  : "",
              },
              { label: "Cliente:", value: cotizacion?.cliente || "" },
              { label: "Email:", value: cotizacion?.email || "" },
              {
                label: "Teléfono:",
                value: cotizacion?.telefono || "",
              },
            ]}
          />
        </div>

        <div className={styles.right}>
          <ProductListCard2
            title="Productos de la cotización"
            items={productos?.content || []}
            currentPage={productos?.number || 0}
            totalPages={productos?.totalPages || 1}
            onPageChange={(page) => setPage(page)}
          />

          <div className={styles.card}>
            {cotizacion?.cotizacionEnlace ? (
              <>
                <div className={styles.pdfRow}>
                  <div className={styles.titlePDF}>PDF de la cotización:</div>

                  <div className={styles.pdfButtons}>
                    <a
                      href={cotizacion.cotizacionEnlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.pdfButton}
                    >
                      Ver
                    </a>
                    <a
                      href={cotizacion.cotizacionEnlace}
                      download={`cotizacion-${cotizacion.numero}.pdf`}
                      className={`${styles.pdfButton} ${styles.rejectButton}`}
                    >
                      Descargar
                    </a>
                  </div>
                </div>

                <div className={styles.pdfRow}>
                  <div className={styles.titlePDF}>Decisión:</div>

                  <div className={styles.pdfButtons}>
                    <a
                      href={cotizacion.cotizacionEnlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.pdfButton}
                    >
                      Aceptar
                    </a>
                    <a
                      href={cotizacion.cotizacionEnlace}
                      download={`cotizacion-${cotizacion.numero}.pdf`}
                      className={`${styles.pdfButton} ${styles.rejectButton}`}
                    >
                      Rechazar
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={styles.titlePDF}>PDF de la cotización</div>
                <p>No se ha subido ningún PDF aún.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 🔙 Botón Regresar */}
      <div className={styles.backContainer}>
        <ButtonPrimary
          text="Regresar a mi perfil"
          click={() => navigate(routes.profile_user)}
        />
      </div>
    </div>
  );
}

export default Cotizacion;
