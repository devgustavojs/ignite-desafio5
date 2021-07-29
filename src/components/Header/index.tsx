import styles from './header.module.scss';
import Link from 'next/link'
export default function Header() {
  return(
    <div className={styles.headerDiv}>
    <Link href="/">
        <img src='/images/Logo.svg' alt="logo" />
    </Link>
    </div>
  )
}
