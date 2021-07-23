import styles from "./header.module.scss";

const Header = () => {
  return (
    <header className={styles.headerContainer}>
      <img src="/images/logo.svg" alt="ig.blog" />
    </header>
  );
};

export default Header;
