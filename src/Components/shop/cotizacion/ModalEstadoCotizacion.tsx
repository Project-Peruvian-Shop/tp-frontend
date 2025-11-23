import styles from "./ModalEstadoCotizacion.module.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { change_state } from "../../../services/cotizacion.service";

export interface Quote {
  id: string;
  clientName: string;
  date: string;
  status: "enviada" | "aceptada" | "rechazada";
  fileName: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function QuoteCard({ quote }: { quote: Quote }) {
  const MySwal = withReactContent(Swal);

  const statusLabels = {
    enviada: "Enviada",
    aceptada: "Aceptada",
    rechazada: "Rechazada",
  };

  const handleResponder = async () => {
    const result = await MySwal.fire({
      title: "Responder cotización",
      html: `
      <textarea id="comentario" class="swal2-textarea" placeholder="Comentario (opcional)"></textarea>
    `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Aceptar",
      denyButtonText: "Rechazar",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        return (document.getElementById("comentario") as HTMLTextAreaElement)
          .value;
      },
    });

    if (result.isConfirmed || result.isDenied) {
      const comentario = typeof result.value === "string" ? result.value : "";
      const estado = result.isConfirmed ? "ACEPTADA" : "RECHAZADA";

      try {
        await change_state(parseInt(quote.id), estado, comentario);
        Swal.fire(
          "¡Listo!",
          `Cotización ${estado.toLowerCase()} correctamente.`,
          "success"
        );
        window.location.reload();
      } catch (error) {
        Swal.fire("Error", "No se pudo enviar la respuesta " + error, "error");
      }
    }
  };

  return (
    <>
      <div className={styles.card}>
        {/* HEADER */}
        <div className={styles.amountContainer}>
          <h3 className={styles.clientName}>Atendido por</h3>
          <p className={styles.amount}>{quote.clientName}</p>
          <p className={styles.date} style={{ marginTop: "8px" }}>
            Enviado el
          </p>
          <p className={styles.date}>{formatDate(quote.date)}</p>
        </div>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <div className={styles.pdfActions}>
            {/* Botón Ver */}
            <button
              className={styles.pdfButton}
              onClick={() => window.open(quote.fileName, "_blank")}
            >
              <span className={styles.pdfLabel}>Ver PDF</span>
            </button>

            {/* Botón Descargar */}
            <button
              className={styles.pdfButton}
              onClick={() => {
                const link = document.createElement("a");
                link.href = quote.fileName;
                link.download = `cotizacion-${quote.id}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <span className={styles.pdfLabel}>Descargar PDF</span>
            </button>
          </div>

          {/* RESPONSE BUTTON */}
          <button
            onClick={handleResponder}
            disabled={quote.status !== "enviada"}
            className={`${styles.responseBtn} ${
              quote.status === "enviada"
                ? styles.responseEnabled
                : styles.responseDisabled
            }`}
          >
            {quote.status === "enviada"
              ? "Responder"
              : `${statusLabels[quote.status]} anteriormente`}
          </button>
        </div>
      </div>
    </>
  );
}
