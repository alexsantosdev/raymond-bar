import Head from 'next/head'
import { useState, useEffect } from 'react'
import { child, get, onValue, ref, set } from 'firebase/database'
import axios from 'axios'

import { database } from '../services/firebase'

import bg from '../../public/images/Background.png'

import styles from './home.module.scss'
import toast, { Toaster } from 'react-hot-toast'

type ResponseCompanionType = {
  name: string,
  age: number,
  document: string,
  user: number
}

type CompanionType = {
  name: string,
  age: number,
  document: string
}

type GuestType = {
  name : string,
  age: number,
  document: string,
  companions: CompanionType[]
}

export default function Home() {

  const [guests, setGuests] = useState(0)

  const [guest, setGuest] = useState<GuestType[]>([])

  const [name, setName] = useState('')
  const [age, setAge] = useState(0)
  const [document, setDocument] = useState('')
  const [hasCompanion, setHasCompanion] = useState('')
  const [companions, setCompanions] = useState<CompanionType[]>([])
  const [confirm, setConfirm] = useState(false)

  // const api = axios.create({
  //   baseURL: 'http://localhost:8080'
  // })

  async function saveData() {
    const db = database
    let guestId = name.toLowerCase().trim()
    await set(ref(db, 'guests/' + guestId), {
      name: name,
      age: age,
      document: document
    })

    if(companions.length !== 0) {
      companions.map(c => {
        let uniqueId = c.name.toLowerCase().trim()
        set(ref(db, 'companions/' + uniqueId), {
          name: c.name,
          document: c.document,
          age: c.age,
          guest_name: name
        })
      })
    }
  }

  const listGuests = async () => {
    let guestLength = 0
    // await api.get('/api/v1/guests')
    // .then(res => {
    //   const guest: GuestType[] = res.data ?? {}
    //   guestLength = guest.length
    //   setGuest(guest)
    // })

    // await api.get('/api/v1/companions')
    // .then(res => {
    //   const companion: ResponseCompanionType[] = res.data ?? {}
    //   guestLength += companion.length
    // })

    const db = database

    const guestRef = ref(db, 'guests')
    onValue(guestRef, snapshot => {
      const data: GuestType[] = snapshot.val() ?? {}
      const parsedData = Object.entries(data).map(([key, value]) => {
        return {
          name: value.name,
          age: value.age,
          document: value.document
        }
      })
      guestLength = parsedData.length
    })

    const companionRef = ref(db, 'companions')
    onValue(companionRef, snapshot => {
      const data: CompanionType[] = snapshot.val() ?? {}
      const parsedData = Object.entries(data).map(([key, value]) => {
        return {
          name: value.name,
          age: value.age,
          document: value.document
        }
      })
      guestLength += parsedData.length

    })

    setGuests(guestLength)
  }

  useEffect(() => {
    listGuests()
  }, [])

  function addNewGuess() {
    setCompanions([
      ...companions,
      {name: '', age: 0, document: ''}
    ])
  }

  function setCompanionItemValue(position: number, field: string, value: string) {
    const updateCompanionItem = companions.map((companionItem, index) => {
      if(index === position) {
        return { ...companionItem, [field]: value }
      }

      return companionItem;
    })

    setCompanions(updateCompanionItem)
  }

  async function handleConfirm() {

    if(name.trim() === '') {
      return toast.error('O nome não pode estar vazio :(')
    }

    if(age === 0) {
      return toast.error('O campo idade deve ser preenchido.')
    }

    if(hasCompanion.trim() === '') {
      return toast.error('É necessário informar se levará acompanhante.')
    }

    if(hasCompanion.trim() === 'sim') {
      companions.map(item => {
        if(item.name.trim() === '') {
          setConfirm(false)
          return toast.error('Um dos campos de nome dos convidados está vazio.')
        }

        if(item.age === 0) {
          setConfirm(false)
          return toast.error('Um dos campos de idade dos convidados está vazio.')
        }

        if(item.document.trim() === '') {
          setConfirm(false)
          return toast.error('Um dos campos de documento está vazio.')
        }

        if(item.name.trim() !== '' && item.document.trim() !== '' && item.age !== 0) {
          setConfirm(true)
        }
      })
    }else if(hasCompanion.trim() === 'nao') {
      setConfirm(true)
    }

    if(guests === 50) {
      return toast.error('Infelizmente a lista está cheia :(')
    }else {
      if(confirm) {
        toast.promise(
          saveData(),
          {
            loading: 'Estamos confirmando sua presença...',
            success: <b>Presença confirmada!</b>,
            error: <b>Não conseguimos confirmar sua presença :(</b>,
          }
        )

        // toast.promise(
        //   api.post('/api/v1/guest/create', {
        //     name: name,
        //     age: age,
        //     document: document,
        //     companions: companions ? companions : []
        //   }),
        //   {
        //     loading: 'Estamos confirmando sua presença...',
        //     success: <b>Presença confirmada!</b>,
        //     error: <b>Não conseguimos confirmar sua presença :(</b>,
        //   }
        // );
        listGuests()
      }
    }
  }

  return (
    <>
      <Head>
        <title>Boteco do Raymond 5.0</title>
      </Head>

      <Toaster position='top-right' />

      <main className={styles.mainContainer} style={{backgroundImage: `url(${bg.src})`, width: '100vw', height: 'max-content', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}>
        <div className={styles.contentContainer}>
          <h2>Boteco do Raymond <b>5.0</b></h2>
          <span>Você está sendo convidado para a primeira comemoração do ano, sua presença é muito importante.</span>
          <span className={styles.boldSpan}>Traga uma bebida da sua preferência e um kit churrasco, sua mesa já está reservada!</span>
          <div className={styles.formContainer}>
            <div className={styles.row}>
              <input type='text' placeholder='Digite seu nome' value={name} onChange={e => setName(e.target.value)} />
              <input type='number' placeholder='Sua idade' value={age === 0 ? '' : age} onChange={e => setAge(Number(e.target.value))} />
            </div>
            <div className={styles.row}>
              <input type="text" placeholder='RG' value={document} onChange={e => setDocument(e.target.value)} />
              <select value={hasCompanion} onChange={e => setHasCompanion(e.target.value)}>
                <option value='' hidden>Possui acompanhante?</option>
                <option value='sim'>Sim</option>
                <option value='nao'>Não</option>
              </select>
            </div>

            {hasCompanion === 'sim' && <button className={styles.addGuess} onClick={addNewGuess}>Adicionar acompanhante</button> }
            {hasCompanion === 'sim' && companions.map((guessItem, index) => {
              return(
                <div className={styles.row}>
                  <input name='name' type='text' placeholder='Nome do acompanhante' value={guessItem.name} onChange={e => setCompanionItemValue(index, 'name', e.target.value)} />
                  <input type="text" placeholder='RG' value={guessItem.document} onChange={e => setCompanionItemValue(index, 'document', e.target.value)} />
                  <input name='age' type='number' placeholder='Idade' value={guessItem.age === 0 ? '' : guessItem.age} onChange={e => setCompanionItemValue(index, 'age', e.target.value)} />
                </div>
              )
            })}
          </div>
          <p>Ao clicar em "Confirmar" você está ciente de que se você for <b>BEBER</b> não dirija, chame um <b>UBER</b>!</p>
          <button onClick={handleConfirm}>
            <img src="/images/beer-button.svg" alt="icon" />
            Confirmar presença
          </button>
          <h3>Restam apenas {50 - guests} de 50 vagas.</h3>

          <div className={styles.address}>
            <img src="/images/map.svg" alt="map pin" />
            <span>Av. Nicola Accieri, S/N - Condomínio 7763, Reserva da mata. | 11/02 - 18h às 22h</span>
          </div>
        </div>
      </main>
    </>
  )
}
