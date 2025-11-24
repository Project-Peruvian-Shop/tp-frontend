import styles from "./Cotizacion.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { routes } from "../../../utils/routes";
import { useEffect, useState } from "react";
import type {
  CotizacionFullDTO,
  CotizacionHistorialDTO,
} from "../../../models/Cotizacion/Cotizacion_response_dto";
import {
  getCotizacionById,
  getHistorialCambiosEstado,
  getProductosByCotizacionId,
} from "../../../services/cotizacion.service";
import InfoCard from "../../../Components/dashboard/infocard/InfoCard";
import ButtonPrimary from "../../../Components/buttons/ButtonPrimary";
import MapCard from "../../../Components/dashboard/mapCard/MapCard";
import type { PaginatedResponse } from "../../../services/global.interfaces";
import type { ProductoCarritoDetalleDTO } from "../../../models/CotizacionDetalle/Cotizacion_detalle";
import Banner from "../../../Components/banner/Banner";
import ProductListCard2 from "../../../Components/dashboard/productlistcard/ProductListCard2";
import ResponseCard from "../../../Components/shop/cotizacion/ResponseCard";

type EstadoStatus = "enviada" | "aceptada" | "rechazada";

interface estadoType {
  estado: EstadoStatus;
  remitente: string;
  fechaEnvio: string;
}

function Cotizacion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cotizacion, setCotizacion] = useState<CotizacionFullDTO | null>(null);

  const [productos, setProductos] =
    useState<PaginatedResponse<ProductoCarritoDetalleDTO>>();
  const [page, setPage] = useState(0);

  const [estado, setEstado] = useState<estadoType | null>(null);

  useEffect(() => {
    if (!id) {
      navigate(routes.shop);
      return;
    }

    const fetchCotizacion = async (id: string) => {
      try {
        const [data, productosData, historialEstado] = await Promise.all([
          getCotizacionById(Number(id)),
          getProductosByCotizacionId(Number(id), page),
          getHistorialCambiosEstado(Number(id)),
        ]);
        setCotizacion(data);
        setProductos(productosData);

        console.log(historialEstado);

        const nuevoEstado = obtenerEstadoEnvio(historialEstado);
        console.log(nuevoEstado);

        if (nuevoEstado) {
          setEstado(nuevoEstado);
        }
      } catch (error) {
        console.error("Error al obtener la cotización:", error);
        navigate(routes.profile_user);
      }
    };

    fetchCotizacion(id);
  }, [id, navigate, page]);

  function obtenerEstadoEnvio(
    historial: CotizacionHistorialDTO[]
  ): estadoType | null {
    for (let i = historial.length - 1; i >= 0; i--) {
      const h = historial[i];

      if (
        h.estadoNuevo === "ENVIADA" ||
        h.estadoNuevo === "ACEPTADA" ||
        h.estadoNuevo === "RECHAZADA"
      ) {
        return {
          estado: h.estadoNuevo.toLowerCase() as EstadoStatus,
          remitente: h.usuarioNombre,
          fechaEnvio: h.fechaCambio,
        };
      }
    }

    return null;
  }

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
            {cotizacion?.cotizacionEnlace && estado ? (
              <ResponseCard
                data={{
                  id: cotizacion.id,
                  cotizacionId: cotizacion.numero.toString(),
                  clientName: estado.remitente,
                  date: estado.fechaEnvio,
                  status: estado.estado,
                  fileName: cotizacion.cotizacionEnlace,
                }}
              />
            ) : (
              <>
                <div className={styles.titlePDF}>Sin respuesta aún</div>
                <p>
                  Tu cotización todavía está en espera. Un asesor la revisará
                  pronto.
                </p>
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
