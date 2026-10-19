import Image from "next/image";
import Link from "next/link";
import { getUpcomingAgendaEvents } from "@/data/events";
import { formatPrice, products } from "@/data/products";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const sports = ["Futsal", "Basquete", "Vôlei", "Handebol", "E-sports"];

export default function Home() {
  const upcomingEvents = getUpcomingAgendaEvents();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroMascot} aria-hidden="true">
            <Image src="/images/polvo-octacore-isolado.png" alt="" width={1254} height={1254} priority />
          </div>
          <p className={styles.eyebrow}>Bem-vindo à maior do estado</p>
          <h1 id="hero-title">Somos a Octacore.<br />Esporte, integração e história.</h1>
          <div className={styles.heroActions}>
            <Link className="button buttonPrimary" href="/mural">Conheça a Octa <span aria-hidden="true">→</span></Link>
            <Link className="button buttonOutline" href="/modalidades">Faça parte</Link>
          </div>
        </section>

        <div className={styles.contentGrid}>
          <div className={styles.leftColumn}>
            <section aria-labelledby="arena-title">
              <div className={styles.sectionKicker}><span>Competições</span><i /></div>
              <h2 id="arena-title" className={styles.sectionTitle}>Destaques de arena</h2>
              <div className={styles.arenaGrid}>
                <article className={styles.arenaCard}>
                  <p className={styles.cardLabel}>Próximo jogo · Futsal</p>
                  <div className={styles.matchup}><strong>Octacore</strong><span>vs</span><strong>Atlética adversária</strong></div>
                  <p className={styles.cardMeta}>▣ 25/09 às 20h | Quadra UFAL</p>
                </article>
                <article className={`${styles.arenaCard} ${styles.resultCard}`}>
                  <p className={styles.cardLabel}>Resultado recente · Basquete</p>
                  <strong className={styles.score}>Octacore 72 <span>×</span> 64 Adversário</strong>
                  <span className={styles.winBadge}>Vitória</span>
                </article>
              </div>
            </section>

            <section className={styles.shopSection} aria-labelledby="shop-title">
              <div className={styles.sectionKicker}><span>Loja</span><i /></div>
              <h2 id="shop-title" className={styles.sectionTitle}>Armadura do polvo</h2>
              <p className={styles.sectionDescription}>Garanta as roupas e acessórios oficiais da maior do estado.</p>
              <div className={styles.productGrid}>
                {products.map((product) => (
                  <article className={styles.productCard} key={product.slug}>
                    <Link className={styles.productLink} href={`/loja/${product.slug}`} aria-label={`Ver detalhes de ${product.name}`}>
                      {product.image ? (
                        <Image className={styles.productImage} src={product.image} alt={product.alt ?? ""} width={300} height={220} />
                      ) : (
                        <div className={styles.productPlaceholder} aria-label={`Imagem de ${product.name} pendente`} role="img" />
                      )}
                      <h3>{product.name}</h3><p>{formatPrice(product.priceCents)}</p>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles.rightColumn} aria-label="Agenda e modalidades">
            <section className={styles.eventsCard} aria-labelledby="events-title">
              <h2 id="events-title">Próximos compromissos</h2>
              <ul>{upcomingEvents.slice(0, 3).map((event) => (
                <li key={event.id}><Link href={`/agenda/${event.detailSlug}`} aria-label={`Ver detalhes de ${event.title}`}><time dateTime={event.dateTime}>{event.day}/{event.month} · {event.time}</time><div><strong>{event.title}</strong><span>{event.category}</span></div></Link></li>
              ))}</ul>
              {upcomingEvents.length === 0 && <p className={styles.noUpcomingEvents}>Nenhum compromisso futuro cadastrado.</p>}
              <Link className={styles.moreEvents} href="/agenda">Ver mais</Link>
            </section>
            <section className={styles.sportsSection} aria-labelledby="sports-title">
              <h2 id="sports-title">Nossas modalidades</h2>
              <div className={styles.sportTags}>{sports.map((sport) => <span key={sport}>{sport}</span>)}</div>
            </section>
            <section className={styles.joinCard} aria-labelledby="join-title">
              <h2 id="join-title">Faça parte da Octacore</h2>
              <p>Seja como atleta, torcedor organizado ou apoiador acadêmico. Descubra nossas seletivas e junte-se ao time!</p>
              <Link className="button buttonPrimary" href="/agenda">Ver seletivas</Link>
              <Link className="button buttonOutline" href="/modalidades">Conhecer modalidades</Link>
              <a className="button buttonOutline" href="mailto:contato@octacore.com.br">Entrar em contato</a>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
