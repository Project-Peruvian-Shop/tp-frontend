import { useState } from "react";
// import { Download, Eye, MessageSquare } from "lucide-react";
// import ActionModal from "./action-modal";
import styles from "./ModalEstadoCotizacion.module.css";

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
  const [showModal, setShowModal] = useState(false);

  const statusLabels = {
    enviada: "Enviada",
    aceptada: "Aceptada",
    rechazada: "Rechazada",
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
            onClick={() => setShowModal(true)}
            disabled={quote.status !== "enviada"}
            className={`${styles.responseBtn} ${
              quote.status === "enviada"
                ? styles.responseEnabled
                : styles.responseDisabled
            }`}
          >
            {/* <MessageSquare className={styles.icon} /> */}
            {quote.status === "enviada"
              ? "Responder"
              : `${statusLabels[quote.status]} anteriormente`}
          </button>
        </div>
      </div>

      {/* <ActionModal quote={quote} open={showModal} onOpenChange={setShowModal} /> */}
    </>
  );
}
