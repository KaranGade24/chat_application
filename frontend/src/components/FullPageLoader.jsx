import styles from "./FullPageLoader.module.css";

const FullPageLoader = () => {
  return (
    <div className={styles.fullPageLoader}>
      <div className={styles.loader} />
    </div>
  );
};

export default FullPageLoader;
