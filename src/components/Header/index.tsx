import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.headerContainer}>
      <div>
        <img src="/images/logo.svg" alt="ig.blog" />
      </div>
    </header>
  );
}
