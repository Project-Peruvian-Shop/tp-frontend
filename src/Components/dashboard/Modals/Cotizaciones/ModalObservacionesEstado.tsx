import { useState, useEffect } from "react";
import type { CotizacionDashboardDTO } from "../../../../models/Cotizacion/Cotizacion_response_dto";
import style from "./ModalObservacionesEstado.module.css";
import { CustomSelect } from "../../../customSelect/CustomSelect";

interface ModalObservacionEstadoProps {
  show: boolean;
  cotizacion: CotizacionDashboardDTO | null;
  onClose: () => void;
  onSaveObservacion: (id: number, observacion: string) => void;
  onChangeEstado: (
    id: number,
    nuevoEstado:
      | "PENDIENTE"
      | "EN_PROCESO"
      | "ENVIADA"
      | "ACEPTADA"
      | "RECHAZADA"
      | "CERRADA",
    observacion: string
  ) => void;
}
type EstadoCotizacion =
  | ""
  | "PENDIENTE"
  | "EN_PROCESO"
  | "ENVIADA"
  | "ACEPTADA"
  | "RECHAZADA"
  | "CERRADA";

const validarEstado = (estado: string | undefined): EstadoCotizacion => {
  if (
    estado === "PENDIENTE" ||
    estado === "EN_PROCESO" ||
    estado === "ENVIADA" ||
    estado === "ACEPTADA" ||
    estado === "RECHAZADA" ||
    estado === "CERRADA"
  ) {
    return estado;
  }
  return "";
};

function ModalObservacionEstado({
  show,
  cotizacion,
  onClose,
  onSaveObservacion,
  onChangeEstado,
}: ModalObservacionEstadoProps) {
  const [observacion, setObservacion] = useState(
    cotizacion?.observaciones || ""
  );
  const [estadoSeleccionado, setEstadoSeleccionado] =
    useState<EstadoCotizacion>(validarEstado(cotizacion?.estado));
  // Cada vez que cambia la cotización, se sincroniza el estado y observación
  useEffect(() => {
    if (cotizacion) {
      setEstadoSeleccionado(
        (cotizacion.estado as
          | "PENDIENTE"
          | "EN_PROCESO"
          | "ENVIADA"
          | "ACEPTADA"
          | "RECHAZADA"
          | "CERRADA"
          | "") || ""
      );
      setObservacion(cotizacion.observaciones || "");
    }
  }, [cotizacion]);

  const options = [
    { value: "PENDIENTE", label: "Pendiente" },
    { value: "EN_PROCESO", label: "En Proceso" },
    { value: "ENVIADA", label: "Enviada" },
    { value: "ACEPTADA", label: "Aceptada" },
    { value: "RECHAZADA", label: "Rechazada" },
    { value: "CERRADA", label: "Cerrada" },
  ];

  if (!show || !cotizacion) return null;

  const handleConfirm = async () => {
    // Actualizar observación si tiene contenido
    if (observacion.trim() !== "" && observacion !== cotizacion.observaciones) {
      await onSaveObservacion(cotizacion.id, observacion);
    }
    // Actualizar estado si cambió
    if (estadoSeleccionado && estadoSeleccionado !== cotizacion.estado) {
      await onChangeEstado(cotizacion.id, estadoSeleccionado, observacion);
    }
    onClose();
  };

  return (
    <div className={style.modalOverlay}>
      <div className={style.modalContent}>
        <h2>Actualizar estado</h2>
        <p>Numero: {cotizacion.numeroCotizacion}</p>
        <p>Cliente: {cotizacion.clienteNombre}</p>

        <label>
          Observaciones
          <textarea
            className={style.textarea}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Agrega una observación"
          />
        </label>

        <label>
          Estado
          <CustomSelect
            options={options}
            onChange={(value) =>
              setEstadoSeleccionado(value as EstadoCotizacion)
            }
            placeholder={
              options.find((option) => option.value === estadoSeleccionado)
                ?.label || "Selecciona un estado"
            }
          />{" "}
        </label>

        <div className={style.modalActions}>
          <button onClick={handleConfirm} className={style.addButton}>
            Confirmar
          </button>
          <button onClick={onClose} className={style.cancelButton}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalObservacionEstado;
