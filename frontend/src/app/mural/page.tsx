import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Mural | Octacore" };

const sections = [
  {
    symbol: "◷",
    title: "Linha do Tempo",
    description: "Descubra como o Polvo nasceu e acompanhou a evolução da nossa atlética.",
    action: "Ver história completa",
    href: "/mural/historia",
  },
  {
    symbol: "♧",
    title: "Diretoria & Integrantes",
    description: "Conheça as pessoas que fazem parte da Octacore dentro e fora das quadras.",
    action: "Ver diretoria",
    href: "/mural/integrantes",
  },
  {
    symbol: "♜",
    title: "Galeria de Troféus",
    description: "Reviva conquistas e momentos marcantes da nossa trajetória.",
    action: "Ver conquistas",
    href: "/mural/conquistas",
  },
];

export default function MuralPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <section className={styles.hero} aria-labelledby="mural-title">
          <div>
            <span className={styles.badge}>Mural oficial</span>
            <h1 id="mural-title">Esporte &amp; comunidade</h1>
            <p>A Octacore não é apenas esporte. Somos o ponto de encontro da computação UFAL. Unimos comunicação transparente, competições eletrizantes, história rica, eventos lendários e o comércio de nossas armaduras oficiais.</p>
          </div>
          <Image src="/images/polvo-robo.png" alt="Ilustração do polvo robô da Octacore" width={340} height={220} priority />
        </section>

        <section aria-labelledby="pillars-title" className={styles.pillars}>
          <div className={styles.kicker}><span>Saiba mais</span><i /></div>
          <h2 id="pillars-title">Pilares da nossa história</h2>
          <div className={styles.grid}>
            {sections.map((section, index) => (
              <article className={`${styles.card} hoverCard`} key={section.href}>
                <span className={`${styles.icon} ${index === 1 ? styles.orangeIcon : ""}`} aria-hidden="true">{section.symbol}</span>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
                <Link href={section.href}>{section.action} <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
