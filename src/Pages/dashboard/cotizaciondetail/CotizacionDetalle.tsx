import styles from "./CotizacionDetalle.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { routes } from "../../../utils/routes";
import InfoCard from "../../../Components/dashboard/infocard/InfoCard";
import { useCallback, useEffect, useState } from "react";
import type {
  CotizacionDashboardDTO,
  CotizacionFullDTO,
  CotizacionHistorialDTO,
} from "../../../models/Cotizacion/Cotizacion_response_dto";
import {
  change_state,
  getCotizacionById,
  getHistorialCambiosEstado,
  getProductosByCotizacionId,
  updateObservacionCotizacion,
  uploadCotizacionPDF,
} from "../../../services/cotizacion.service";
import ButtonHeader from "../../../Components/dashboard/buttonheader/ButtonHeader";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ModalObservacionEstado from "../../../Components/dashboard/Modals/Cotizaciones/ModalObservacionesEstado";
import upload from "../../../Icons/Modal_uploadPDF/upload_pdf.svg";
import MapCard from "../../../Components/dashboard/mapCard/MapCard";
import { StatusHistoryTable } from "../../../Components/dashboard/statushistorytable/StatusHistoryTable";
import { obtenerUsuario } from "../../../utils/auth";
import { UserRoleConst } from "../../../models/Usuario/Usuario";
import type { ProductoCarritoDetalleDTO } from "../../../models/CotizacionDetalle/Cotizacion_detalle";
import type { PaginatedResponse } from "../../../services/global.interfaces";
import ProductListCard2 from "../../../Components/dashboard/productlistcard/ProductListCard2";
import emailjs from "@emailjs/browser";

function CotizacionDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cotizacion, setCotizacion] = useState<CotizacionFullDTO | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalPDF, setShowModalPDF] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] =
    useState<CotizacionDashboardDTO | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);

  const [historial, setHistorial] = useState<CotizacionHistorialDTO[]>([]);

  const [productos, setProductos] =
    useState<PaginatedResponse<ProductoCarritoDetalleDTO>>();
  const [page, setPage] = useState(0);

  const MySwal = withReactContent(Swal);

  const usuario = obtenerUsuario();

  const fetchCotizacion = useCallback(
    async (cotizacionId: number, page: number = 0) => {
      try {
        const [data, productosData, historialData] = await Promise.all([
          getCotizacionById(cotizacionId),
          getProductosByCotizacionId(cotizacionId, page),
          getHistorialCambiosEstado(cotizacionId),
        ]);
        setCotizacion(data);
        setProductos(productosData);
        setHistorial(historialData);
      } catch (error) {
        console.error("Error al obtener la cotización:", error);
        navigate(routes.dashboard_cotizations);
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (id) fetchCotizacion(Number(id), page);
  }, [id, page, fetchCotizacion]);

  useEffect(() => {
    return () => {
      if (pdfPreview) {
        URL.revokeObjectURL(pdfPreview);
      }
    };
  }, [pdfPreview]);

  const handleSaveObservacion = async (
    id: number,
    nuevaObservacion: string
  ) => {
    if (!selectedCotizacion || !cotizacion) return;

    try {
      const observacionOriginal = selectedCotizacion.observaciones || "";

      if (nuevaObservacion.trim() === "") {
        await MySwal.fire({
          icon: "warning",
          title: "Observación vacía",
          text: "Por favor, ingresa una observación.",
        });
        return;
      }

      if (nuevaObservacion.trim() === observacionOriginal.trim()) {
        await MySwal.fire({
          icon: "info",
          title: "Sin cambios",
          text: "No se detectaron modificaciones en la observación.",
        });
        return;
      }
      await updateObservacionCotizacion(id, nuevaObservacion);
      await fetchCotizacion(id);

      setShowModal(false);
      await MySwal.fire({
        icon: "success",
        title: "¡Observación actualizada!",
        text: "La observación ha sido modificada correctamente.",
      });
    } catch (error: unknown) {
      let errorMessage = "Error al guardar la observación";

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

  const handleChangeEstado = async (
    id: number,
    nuevoEstado:
      | "PENDIENTE"
      | "EN_PROCESO"
      | "ENVIADA"
      | "ACEPTADA"
      | "RECHAZADA"
      | "CERRADA",
    observacion: string
  ) => {
    try {
      await change_state(id, nuevoEstado, observacion);
      await fetchCotizacion(cotizacion?.id || id);
      setShowModal(false);
      await MySwal.fire({
        title: "Estado actualizado",
        icon: "success",
        text: `El estado se cambió correctamente.`,
      });
    } catch (error: unknown) {
      let errorMessage = "Error al editar el estado de la cotización";

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

  const handleUpload = async () => {
    if (!selectedFile || !cotizacion) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Archivo demasiado grande",
        text: "El archivo PDF no debe superar los 10MB.",
      });
      return;
    }
    try {
      const result = await uploadCotizacionPDF(cotizacion.id, selectedFile);
      setPdfPreview(result.archivo);
      await fetchCotizacion(cotizacion.id);
      await change_state(cotizacion.id, "ENVIADA", "Se ha subido el PDF de la cotización.");
      await fetchCotizacion(cotizacion.id);
      setSelectedFile(null);

      Swal.fire({
        icon: "success",
        title: "PDF subido",
        text: "La cotización fue actualizada con el PDF.",
      });
    } catch (error) {
      console.error("Error al subir PDF:", error);
      Swal.fire({
        icon: "error",
        title: "Error al subir PDF",
        text: "No se pudo subir el archivo. Intenta nuevamente.",
      });
    }
  };
  const handleSendEmail = async () => {
    if (!cotizacion) return;
      const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        cliente_nombre: cotizacion.cliente,
        to_email: cotizacion.email,
        numero_cotizacion: cotizacion.numero,
        enlace_pdf: cotizacion.cotizacionEnlace,
      },
      {  publicKey: EMAILJS_PUBLIC_KEY }
    );

    Swal.fire({
      icon: "success",
      title: "Correo enviado",
      text: "La cotización fue enviada correctamente al cliente.",
    });
  }catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo enviar el correo.",
    });
  }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <ButtonHeader
          title="Cotizaciones"
          onClick={() => navigate(-1)}
          icon="back"
          size={24}
          style="secondary-outline"
        />

        <div className={styles.title}>Cotización {cotizacion?.numero}</div>

        {(usuario?.rol === UserRoleConst.ADMINISTRADOR ||
          usuario?.rol === UserRoleConst.SUPERADMIN) && (
          <div className={styles.actions}>
            <ButtonHeader
              title="Actualizar estado"
              onClick={() => {
                if (cotizacion) {
                  setSelectedCotizacion({
                    id: cotizacion.id,
                    numeroCotizacion: cotizacion.numero,
                    clienteNombre: cotizacion.cliente,
                    clienteDocumento: cotizacion.documento || "",
                    creacion: cotizacion.creacion || "",
                    comentario: cotizacion.comentario || "",
                    estado: cotizacion.estado,
                    observaciones: cotizacion.observaciones || "",
                  });
                }
                setShowModal(true);
              }}
              icon="edit-secondary"
              size={24}
              style="secondary-outline"
            />
            <ButtonHeader
              title="Eliminar"
              onClick={() => console.log("Acciones")}
              icon="delete-primary"
              size={24}
              style="primary-outline"
            />
          </div>
        )}
      </div>

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
                  ? new Date(cotizacion.creacion).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "",
              },
              { label: "Comentario:", value: cotizacion?.comentario || "" },
            ]}
          />

          <InfoCard
            title="Datos de contacto"
            items={[
              {
                label: "Nº documento:",
                value: cotizacion?.documento || "",
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
            <div className={styles.subtitle}>Observaciones</div>
            <div className={styles.observations}>
              {cotizacion?.observaciones || "No hay observaciones."}
            </div>

            <div className={styles.titlePDF}>PDF de la cotización</div>

            {cotizacion?.cotizacionEnlace ? (
              <div className={styles.pdfContainer}>
                <a
                  href={cotizacion.cotizacionEnlace!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.pdfButton}
                >
                  Ver PDF
                </a>
                <a
                  className={styles.pdfButton}
                  onClick={async () => {
                    const response = await fetch(cotizacion.cotizacionEnlace!);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `cotizacion-${cotizacion.numero}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  Descargar PDF
                </a>
                {/* Enviar por link de PDF por correo */}
                <button
                  onClick={handleSendEmail}
                  className={styles.pdfButton}
                >
                  Mandar PDF por correo
                </button>
                {/* Enviar por link de PDF por whatsapp */}
                <a
                  href={`https://wa.me/${
                    cotizacion?.telefono
                  }?text=${encodeURIComponent(
                    `Hola ${cotizacion?.cliente}, aquí tiene el enlace de su cotización N° ${cotizacion?.numero}: ${cotizacion?.cotizacionEnlace}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.pdfButton}
                >
                  Mandar PDF por WhatsApp
                </a>
              </div>
            ) : (
              <>
                <div className={styles.noPdf}>
                  {cotizacion?.estado !== "PENDIENTE" ? (
                    <>
                      <p>No se ha subido ningún PDF.</p>
                      <button
                        className={styles.addButton}
                        onClick={() => setShowModalPDF(true)}
                      >
                        Añadir PDF
                      </button>
                    </>
                  ) : (
                    <p>
                      Para subir una cotización PDF, cambie el estado de la
                      cotización.
                    </p>
                  )}
                </div>
                {/* Modal para subir un PDF */}
                {showModalPDF && (
                  <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                      <h2>Subir PDF de cotización</h2>

                      {/* Si NO hay PDF seleccionado, mostramos dropzone */}
                      {!selectedFile ? (
                        <div
                          className={styles.dropZone}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file && file.type === "application/pdf") {
                              setPdfPreview(URL.createObjectURL(file));
                            }
                              setSelectedFile(file);
                          }}
                          onClick={() =>
                            document.getElementById("fileInput")?.click()
                          }
                        >
                          <div className={styles.uploadIcon}>
                            <img src={upload} alt="Subir archivo" />
                            <p>Arrastra o haz clic para subir PDF</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Texto sobre la vista previa */}
                          <div className={styles.previewHeader}>
                            <p>Vista previa del PDF: {selectedFile.name}</p>
                          </div>

                          {/* Vista previa */}
                          {pdfPreview && (
                            <div className={styles.pdfPreview}>
                              <embed
                                src={pdfPreview}
                                type="application/pdf"
                                width="100%"
                                height="400px"
                              />
                            </div>
                          )}
                        </>
                      )}

                      <input
                        id="fileInput"
                        type="file"
                        accept="application/pdf"
                        className={styles.fileInput}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type === "application/pdf") {
                            setSelectedFile(file);
                            setPdfPreview(URL.createObjectURL(file));
                          }
                        }}
                      />

                      <div className={styles.modalActions}>
                        <button
                          onClick={handleUpload}
                          disabled={!selectedFile}
                          className={styles.addButton}
                        >
                          Subir PDF
                        </button>
                        <button
                          type="button"
                          className={styles.cancelButton}
                          onClick={() => {
                            setShowModalPDF(false);
                            setSelectedFile(null);
                            setPdfPreview(null);
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <StatusHistoryTable changes={historial} />

      {showModal && (
        <ModalObservacionEstado
          show={showModal}
          cotizacion={selectedCotizacion}
          onClose={() => setShowModal(false)}
          onSaveObservacion={handleSaveObservacion}
          onChangeEstado={handleChangeEstado}
        />
      )}
    </div>
  );
}
export default CotizacionDetalle;
