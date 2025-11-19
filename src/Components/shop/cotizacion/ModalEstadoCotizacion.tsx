import { useState } from "react";
// import { Download, Eye, MessageSquare } from "lucide-react";
// import ActionModal from "./action-modal";
import styles from "./ModalEstadoCotizacion.module.css";

export interface Quote {
  id: string;
  clientName: string;
  amount: string;
  date: string;
  status: "pendiente" | "aceptada" | "rechazada";
  fileName: string;
}

export default function QuoteCard({ quote }: { quote: Quote }) {
  const [showModal, setShowModal] = useState(false);

  const statusLabels = {
    pendiente: "Pendiente",
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
          <p className={styles.date}>{quote.date}</p>
        </div>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <div className={styles.pdfActions}>
            <button className={styles.pdfButton}>
              {/* <Eye className={styles.icon} /> */}
              <span className={styles.pdfLabel}>Ver PDF</span>
            </button>

            <button className={styles.pdfButton}>
              {/* <Download className={styles.icon} /> */}
              <span className={styles.pdfLabel}>Descargar PDF</span>
            </button>
          </div>

          {/* RESPONSE BUTTON */}
          <button
            onClick={() => setShowModal(true)}
            disabled={quote.status !== "pendiente"}
            className={`${styles.responseBtn} ${
              quote.status === "pendiente"
                ? styles.responseEnabled
                : styles.responseDisabled
            }`}
          >
            {/* <MessageSquare className={styles.icon} /> */}
            {quote.status === "pendiente"
              ? "Responder"
              : `${statusLabels[quote.status]} anteriormente`}
          </button>
        </div>
      </div>

      {/* <ActionModal quote={quote} open={showModal} onOpenChange={setShowModal} /> */}
    </>
  );
}
