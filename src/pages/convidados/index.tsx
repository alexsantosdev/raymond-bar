import { database } from '@/services/firebase'
import { onValue, ref } from 'firebase/database'
import Head from 'next/head'
import { useEffect, useState } from 'react'

import styles from './styles.module.scss'

type CompanionType = {
    name: string,
    phone: string,
    rg: string,
    guest_name: string
}
  
type GuestType = {
    name : string,
    phone: string,
    rg: string
}

export default function Convidados() {

    const [guests, setGuests] = useState<GuestType[]>([])
    const [companions, setCompanions] = useState<CompanionType[]>([])

    function documentMask(v0: string,errChar='?'){
        const v = v0.toUpperCase().replace(/[^\dX]/g,'');
        return (v.length==8 || v.length==9)?
           v.replace(/^(\d{1,2})(\d{3})(\d{3})([\dX])$/,'$1.$2.$3-$4'):
           (errChar+v0)
        ;
    }

    const phoneMask = (value: string) => {
        if (!value) return ""
        value = value.replace(/\D/g,'')
        value = value.replace(/(\d{2})(\d)/,"($1) $2")
        value = value.replace(/(\d)(\d{4})$/,"$1-$2")
        return value
    }

    const listGuests = () => {
        const db = database
    
        const guestRef = ref(db, 'guests')
        onValue(guestRef, snapshot => {
          const data: GuestType[] = snapshot.val() ?? {}
          const parsedData = Object.entries(data).map(([key, value]) => {
            return {
              name: value.name,
              phone: value.phone,
              rg: value.rg
            }
          })
          setGuests(parsedData)
        })
    
        const companionRef = ref(db, 'companions')
        onValue(companionRef, snapshot => {
          const data: CompanionType[] = snapshot.val() ?? {}
          const parsedData = Object.entries(data).map(([key, value]) => {
            return {
              name: value.name,
              phone: value.phone,
              rg: value.rg,
              guest_name: value.guest_name
            }
          })
          setCompanions(parsedData)
        })
    }

    useEffect(() => {
        listGuests()
    }, [])

    return(
        <>
            <Head>
                <title>Lista de convidados</title>
            </Head>
        
            <main className={styles.mainContainer}>
                <div>
                    <h2>Lista de confirmados</h2>
                    <div className={styles.confirmedRow}>
                        <div className={styles.group}>
                            <span>Convidados</span>
                            <h3>{guests.length}</h3>
                        </div>

                        <div className={styles.group}>
                            <span>Acompanhantes</span>
                            <h3>{companions.length}</h3>
                        </div>
                            
                        <div className={styles.group}>
                            <span>Reservas</span>
                            <h3>{companions.length + guests.length}/50</h3>
                        </div>
                    </div>
                    <div className={styles.guestCard}>
                        <ul>
                            {guests.map(g => {
                                return(
                                    <li key={g.rg}>
                                        <span>{g.name}</span>
                                        <div className={styles.guestData}>
                                            <h4>Cel: {g.phone}</h4>
                                            <h4>RG: {g.rg}</h4>
                                        </div>
                                        <span className={styles.subtitle}>Acompanhantes:</span>
                                        <div className={styles.companionsList}>
                                            <ul>
                                                {companions.filter(c => c.guest_name === g.name).map(comp => {
                                                    return(
                                                        <li key={comp.rg}>
                                                            <span>{comp.name}</span>
                                                            <div className={styles.companionData}>
                                                                <h4>Cel: {comp.phone}</h4>
                                                                <h4>RG: {comp.rg}</h4>
                                                            </div>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                        <hr />
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </main>
        </>
    )
}