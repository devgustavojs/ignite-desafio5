import styles from './style.module.scss'

import Link from "next/link";


export default function ExitPreviewButton(){
  return(
    <Link href="/api/exit-preview">
      <div className={styles.exitButton}>
        <a>Sair do modo Preview</a>
      </div>
    </Link>
  )
}