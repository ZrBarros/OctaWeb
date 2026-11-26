import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/data/products";
import { mapEvent, mapProduct } from "@/lib/api-mappers";
import { apiServer } from "@/lib/server-api";
import { displayImageUrl } from "@/lib/display-image-url";
import type { ApiEvent, ApiItem, ApiPage, ApiProduct, ApiResult } from "@/lib/api-types";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const sports = ["Futsal", "Basquete", "Vôlei", "Handebol", "E-sports"];

export default async function Home() {
  const now = new Date().toISOString();
  const [eventResponse, productResponse, resultResponse, featuredResponse] = await Promise.all([
    apiServer<ApiPage<ApiEvent>>(`/events?pageSize=100&sort=asc&from=${encodeURIComponent(now)}`),
    apiServer<ApiPage<ApiProduct>>("/products?pageSize=4"),
    apiServer<ApiPage<ApiResult>>(`/results?pageSize=1&sort=desc&to=${encodeURIComponent(now)}`),
    apiServer<ApiItem<ApiResult | null>>("/results/featured"),
  ]);
  const upcomingEvents = eventResponse.data.map(mapEvent);
  const nextGame = eventResponse.data.find((item) => item.tipo === "JOGO" || item.tipo === "CAMPEONATO");
  const latestResult = featuredResponse.data ?? resultResponse.data[0];
  const resultStatus = latestResult && (latestResult.placarOcta > latestResult.placarAdversario ? "Vitória" : latestResult.placarOcta < latestResult.placarAdversario ? "Derrota" : "Empate");
  const products = productResponse.data.map(mapProduct);

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
          <div className={styles.arenaIntro}>
            <div className={styles.sectionKicker}><span>Competições</span><i /></div>
            <h2 id="arena-title" className={styles.sectionTitle}>Destaques de arena</h2>
          </div>
          <section className={styles.arenaGrid} aria-labelledby="arena-title">
            {nextGame ? <Link className={styles.arenaCard} href={`/agenda/${nextGame.slug}`} aria-label={`Ver detalhes do próximo jogo: ${nextGame.titulo}`}>
              <p className={styles.cardLabel}>Próximo jogo · {nextGame.modalidade?.nome ?? "Octacore"}</p>
              <strong className={styles.arenaTitle}>{nextGame.titulo}</strong>
              <p className={styles.cardMeta}>▣ {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Maceio" }).format(new Date(nextGame.dataHora))} · {nextGame.local}</p>
              <span className={styles.cardAction}>Ver jogo →</span>
            </Link> : <Link className={styles.arenaCard} href="/agenda">
              <p className={styles.cardLabel}>Próximo jogo</p>
              <strong className={styles.arenaTitle}>Nenhum jogo futuro cadastrado.</strong>
              <span className={styles.cardAction}>Ver agenda →</span>
            </Link>}
            {latestResult ? <Link className={`${styles.arenaCard} ${styles.resultCard}`} href={latestResult.evento?.slug ? `/agenda/${latestResult.evento.slug}` : `/modalidades/${latestResult.modalidade.slug}`} aria-label={`Ver resultado de Octacore contra ${latestResult.adversario}`}>
              <p className={styles.cardLabel}>Resultado cadastrado · {latestResult.modalidade.nome}</p>
              <strong className={styles.score}>Octacore {latestResult.placarOcta} <span>×</span> {latestResult.placarAdversario} {latestResult.adversario}</strong>
              <span className={`${styles.winBadge} ${resultStatus === "Derrota" ? styles.lossBadge : resultStatus === "Empate" ? styles.drawBadge : ""}`}>{resultStatus}</span>
              <span className={styles.cardAction}>Ver detalhes →</span>
            </Link> : <Link className={`${styles.arenaCard} ${styles.resultCard}`} href="/modalidades">
              <p className={styles.cardLabel}>Resultado recente</p>
              <strong className={styles.arenaTitle}>Nenhum resultado cadastrado.</strong>
              <span className={styles.cardAction}>Conhecer modalidades →</span>
            </Link>}
          </section>

          <section className={styles.eventsCard} aria-labelledby="events-title">
            <h2 id="events-title">Próximos compromissos</h2>
            <ul>{upcomingEvents.slice(0, 3).map((event) => (
              <li key={event.id}><Link href={`/agenda/${event.detailSlug}`} aria-label={`Ver detalhes de ${event.title}`}><time dateTime={event.dateTime}>{event.day}/{event.month} · {event.time}</time><div><strong>{event.title}</strong><span>{event.category}</span></div></Link></li>
            ))}</ul>
            {upcomingEvents.length === 0 && <p className={styles.noUpcomingEvents}>Nenhum compromisso futuro cadastrado.</p>}
            <Link className={styles.moreEvents} href="/agenda">Ver mais</Link>
          </section>

          <div className={styles.shopIntro}>
            <div className={styles.sectionKicker}><span>Loja</span><i /></div>
            <h2 id="shop-title" className={styles.sectionTitle}>Armadura do polvo</h2>
            <p className={styles.sectionDescription}>Garanta as roupas e acessórios oficiais da maior do estado.</p>
          </div>
          <section className={styles.sportsSection} aria-labelledby="sports-title">
            <h2 id="sports-title">Nossas modalidades</h2>
            <div className={styles.sportTags}>{sports.map((sport) => <span key={sport}>{sport}</span>)}</div>
          </section>
          <section className={styles.productGrid} aria-labelledby="shop-title">
            {products.map((product) => (
              <article className={styles.productCard} key={product.slug}>
                <Link className={styles.productLink} href={`/loja/${product.slug}`} aria-label={`Ver detalhes de ${product.name}`}>
                  {product.image ? (
                    <Image className={styles.productImage} src={displayImageUrl(product.image)} alt={product.alt ?? ""} width={300} height={220} unoptimized />
                  ) : (
                    <div className={styles.productPlaceholder} aria-label={`Imagem de ${product.name} pendente`} role="img" />
                  )}
                  <h3>{product.name}</h3><p>{formatPrice(product.priceCents)}</p>
                </Link>
              </article>
            ))}
          </section>
          <section className={styles.joinCard} aria-labelledby="join-title">
            <h2 id="join-title">Faça parte da Octacore</h2>
            <p>Seja como atleta, torcedor organizado ou apoiador acadêmico. Descubra nossas seletivas e junte-se ao time!</p>
            <Link className="button buttonPrimary" href="/agenda">Ver seletivas</Link>
            <Link className="button buttonOutline" href="/modalidades">Conhecer modalidades</Link>
            <a className="button buttonOutline" href="mailto:contato@octacore.com.br">Entrar em contato</a>
          </section>
        </div>
      </div>
    </main>
  );
}
