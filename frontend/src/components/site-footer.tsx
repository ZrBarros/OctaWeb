import Image from "next/image";
import { InstagramIcon } from "./instagram-icon";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.columns}>
          <div className={styles.about}>
            <div className={styles.brand}>
              <Image src="/images/logo-octacore.png" alt="" width={42} height={42} />
              <strong>Atlética Octacore</strong>
            </div>
            <p>A Associação Atlética Acadêmica de Computação da UFAL fomenta o esporte universitário, a integração acadêmica e o orgulho do polvo de Maceió.</p>
            <a className={styles.instagram} href="https://www.instagram.com/atleticaoctacore/" target="_blank" rel="noopener noreferrer">
              <InstagramIcon className={styles.instagramIcon} />
              <span>@atleticaoctacore</span>
            </a>
          </div>
          <div>
            <h2>Contato &amp; endereço</h2>
            <a href="mailto:contato@octacore.com.br">contato@octacore.com.br</a>
            <p>Campus A.C. Simões, Tabuleiro<br />do Martins, Maceió · AL</p>
          </div>
          <div>
            <h2>Patrocinadores &amp; parceiros</h2>
            <div className={styles.partners}>
              <span>Comunidade acadêmica</span>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>© 2026 Atlética Octacore. Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
