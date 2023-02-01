import Head from 'next/head'
import { useEffect, useState } from 'react'
import { child, get, onValue, ref, set } from 'firebase/database'
import axios from 'axios'

import { database } from '../services/firebase'

import bg from '../../public/images/Background.png'

import styles from './home.module.scss'
import toast, { Toaster } from 'react-hot-toast'
import { Modal } from '@/components/modal'

// type ResponseCompanionType = {
//   name: string,
//   age: number,
//   document: string,
//   user: number
// }

type CompanionType = {
  name: string,
  phone: string,
  rg: string
}

type GuestType = {
  name : string,
  phone: string,
  rg: string,
  companions: CompanionType[]
}

export default function Home() {

  const [guests, setGuests] = useState(0)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [rg, setRG] = useState('')
  const [hasCompanion, setHasCompanion] = useState('')
  const [companions, setCompanions] = useState<CompanionType[]>([])
  const [confirm, setConfirm] = useState(false)
  const [length, setLength] = useState(0)
  const [count, setCount] = useState(0)

  const [isModalOpen, setIsModalOpen] = useState(false)

  // const api = axios.create({
  //   baseURL: 'http://localhost:8080'
  // })

  useEffect(() => {
    if(count >= 10) {
      setCount(0)
    }else {
      setCount((count) => count + 1)
    }
    listGuests()
    console.log(count)
  }, [count])

  const clearData = () => {
    setName('')
    setPhone('')
    setRG('')
    setCompanions([])
  }

  async function saveData() {
    const db = database
    let guestId = name.toLowerCase().trim()
    await set(ref(db, 'guests/' + guestId), {
      name: name,
      phone: phone,
      rg: rg
    })

    if(companions.length !== 0) {
      companions.map(c => {
        let uniqueId = c.name.toLowerCase().trim()
        set(ref(db, 'companions/' + uniqueId), {
          name: c.name,
          rg: c.rg,
          phone: c.phone,
          guest_name: name
        })
      })
    }
  }

  const listGuests = async () => {
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

    let g = 0

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
      g = parsedData.length
      // setLength(parsedData.length)
    })

    const companionRef = ref(db, 'companions')
    onValue(companionRef, snapshot => {
      const data: CompanionType[] = snapshot.val() ?? {}
      const parsedData = Object.entries(data).map(([key, value]) => {
        return {
          name: value.name,
          phone: value.phone,
          rg: value.rg
        }
      })
      g += parsedData.length
    })

    setGuests(g)
    setLength(g)
  }

  function addNewGuess() {
    setCompanions([
      ...companions,
      {name: '', phone: '', rg: ''}
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

    if(phone.trim() === '') {
      return toast.error('O campo telefone deve ser preenchido.')
    }

    if(rg.trim() === '') {
      return toast.error('O campo RG deve ser preenchido.')
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

        if(item.phone.trim() === '') {
          setConfirm(false)
          return toast.error('Um dos campos de telefone dos convidados está vazio.')
        }

        if(item.rg.trim() === '') {
          setConfirm(false)
          return toast.error('Um dos campos de RG está vazio.')
        }

        if(item.name.trim() !== '' && item.rg.trim() !== '' && item.phone.trim() !== '') {
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

        clearData()
        setIsModalOpen(true)

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
      <Modal isOpen={isModalOpen} />

      <main className={styles.mainContainer} style={{backgroundImage: `url(${bg.src})`, width: '100vw', height: 'max-content', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}>
        <div className={styles.contentContainer}>
          <h2>Boteco do Raymond <b>5.0</b></h2>
          <span>Você está sendo convidado para a primeira comemoração do ano, sua presença é muito importante.</span>
          <span className={styles.boldSpan}>Traga uma bebida da sua preferência e um kit churrasco, sua mesa já está reservada!</span>
          <div className={styles.formContainer}>
            <div className={styles.row}>
              <input type='text' placeholder='Digite seu nome' value={name} onChange={e => setName(e.target.value)} />
              <input type='text' placeholder='Seu telefone' value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className={styles.row}>
              <input type="text" placeholder='RG' value={rg} onChange={e => setRG(e.target.value)} />
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
                  <input type="text" placeholder='RG' value={guessItem.rg} onChange={e => setCompanionItemValue(index, 'rg', e.target.value)} />
                  <input name='phone' type='text' placeholder='Telefone' value={guessItem.phone} onChange={e => setCompanionItemValue(index, 'phone', e.target.value)} />
                </div>
              )
            })}
          </div>
          <p>Ao clicar em "Confirmar" você está ciente de que se você for <b>BEBER</b> não dirija, chame um <b>UBER</b>!</p>
          <button onClick={handleConfirm}>
            <img src="/images/beer-button.svg" alt="icon" />
            Confirmar presença
          </button>
          <h3>Restam apenas {50 - length} de 50 vagas.</h3>

          <div className={styles.address}>
            <img src="/images/map.svg" alt="map pin" />
            <span><a style={{color: '#2eb2ff'}} href="https://www.google.com/maps/place/Reserva+da+Mata+-+JUNDIA%C3%8D+%2F+CONDOM%C3%8DNIO/@-23.1176252,-46.9217467,17z/data=!3m1!4b1!4m5!3m4!1s0x94cf2f23addbb079:0x68798f85b22b916!8m2!3d-23.1176252!4d-46.919558" target="_blank">Av. Nicola Accieri, S/N - Condomínio 7763, Reserva da mata.</a> | 11/02 - 17h às 22h</span>
          </div>
        </div>
      </main>
    </>
  )
}