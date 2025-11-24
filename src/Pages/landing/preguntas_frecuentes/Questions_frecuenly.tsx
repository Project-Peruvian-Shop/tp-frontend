import { useState } from "react";
import { faqs } from "./data";
import styles from "./Questions_frecuenly.module.css";
import { Link } from "react-router-dom";
import { FAQCard } from "../../../Components/landing/FAQ/FAQ_card";
import Banner from "../../../Components/banner/Banner";

function linkWhatsapp(text: string) {
  return text.replace(/(\+51\s?\d{9})/g, (match) => {
    const num = match.replace(/\D/g, "");
    return `${" "}<a class="linkWhatsapp" href="https://api.whatsapp.com/send/?phone=${num}&text=Hola+Tuber%C3%ADas+Peruanito%2C+vengo+de+la+p%C3%A1gina+web%2C+tengo+una+consulta+&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">${match}</a>`;
  });
}

const Questions_frecuenly = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <main>
      <Banner title="Preguntas Frecuentes" />
      <div className={styles.questionsContainer}>
        <div className={styles.questionsHeader}>
          <h1>Todo lo que necesitas saber</h1>
          <p>
            Respuestas rápidas a las preguntas más importantes sobre nuestra
            plataforma
          </p>
        </div>

        {/* Grid */}
        <div className={styles.questionsGrid}>
          {faqs.map((faq, index) => (
            <FAQCard
              key={index}
              img={faq.img}
              title={faq.question}
              description={linkWhatsapp(faq.answer)}
              color={faq.color}
              index={index}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
            />
          ))}
        </div>

        {/* CTA */}
        <div className={styles.questionsFooter}>
          <div className={styles.footerBox}>
            <span>¿Tienes más preguntas?</span>
            <Link to="/contactenos">
              <button>Contáctanos</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Questions_frecuenly;
