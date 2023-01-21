import { useState } from 'react'

import styles from './styles.module.scss'

type ModalProps = {
    isOpen: boolean
}

export function Modal({ isOpen }: ModalProps) {
    return isOpen ? (
        <>
            <div className={styles.darkBG} />
            <div className={styles.centered}>
                <div className={styles.modal}>
                    <div className={styles.modalHeader}>
                        <h5 className={styles.heading}>Sua presença foi confirmada!</h5>
                    </div>
                </div>
            </div>
        </>
    ) : <></>
}