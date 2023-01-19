import Head from 'next/head'
import { useState, useEffect } from 'react'
import { child, get, onValue, ref, set } from 'firebase/database'

import { database } from '../services/firebase'

import bg from '../../public/images/Background.png'

import styles from './home.module.scss'
import toast, { Toaster } from 'react-hot-toast'

type ConvidadosType = {
  id: string,
  nome: string,
  idade: number
}

type Convidados = Record<string, {
  nome: string,
  idade: number
}>

export default function Home() {

  const [guest, setGuest] = useState<ConvidadosType[]>([])

  const [name, setName] = useState('')
  const [age, setAge] = useState(0)
  const [hasGuess, setHasGuess] = useState('')
  const [guessItems, setGuessItems] = useState([
    {name: '', age: 0}
  ])

  const getGuessList = () => {
    const db = database

    const guessCount = ref(db, 'convidados');
    onValue(guessCount, (snapshot) => {
      const res: Convidados = snapshot.val() ?? {}
      const parsedRes = Object.entries(res).map(([key, value]) => {
        return {
          id: key,
          nome: value.nome,
          idade: value.idade
        }
      })

      setGuest(parsedRes)
    }) 
  }

  useEffect(() => {
    getGuessList()
  }, [])

  function addNewGuess() {
    setGuessItems([
      ...guessItems,
      {name: '', age: 0}
    ])
  }

  function setGuessItemValue(position: number, field: string, value: string) {
    const updatedGuessItems = guessItems.map((guessItem, index) => {
      if(index === position) {
        return { ...guessItem, [field]: value}
      }

      return guessItem;
    })

    setGuessItems(updatedGuessItems)
  }

  async function handleConfirm() {

    if(name.trim() === '') {
      return toast.error('O nome não pode estar vazio :(')
    }

    if(age === 0) {
      return toast.error('O campo idade deve ser preenchido.')
    }

    if(hasGuess.trim() === '') {
      return toast.error('É necessário informar se levará acompanhante.')
    }

    if(hasGuess.trim() === 'sim') {
      guessItems.map(item => {
        if(item.name.trim() === '') {
          return toast.error('Um dos campos de nome dos convidados está vazio.')
        }

        if(item.age === 0) {
          return toast.error('Um dos campos de idade dos convidados está vazio.')
        }
      })

      return
    }

    if(guest.length === 50) {
      return toast.error('Infelizmente a lista está cheia :(')
    }else {
      const db = database

      await set(ref(db, 'convidados/' + name.trim()), {
        nome: name,
        idade: age,
        possuiAcompanhante: hasGuess,
        acompanhantes: guessItems
      })
  
      return toast.success('Você está confirmado!')
    }
  }

  return (
    <>
      <Head>
        <title>Boteco do Raymond 5.0</title>
      </Head>

      <Toaster position='bottom-right' />

      <main className={styles.mainContainer} style={{backgroundImage: `url(${bg.src})`, width: '100vw', height: '100vh', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}>
        <div className={styles.contentContainer}>
          <h2>Boteco do Raymond <b>5.0</b></h2>
          <span>Você está sendo convidado para a primeira comemoração do ano, sua presença é muito importante.</span>
          <span className={styles.boldSpan}>Traga uma bebida da sua preferência, sua mesa já está reservada!</span>
          <div className={styles.formContainer}>
            <div className={styles.row}>
              <input type='text' placeholder='Digite seu nome' value={name} onChange={e => setName(e.target.value)} />
              <input type='number' placeholder='Sua idade' value={age} onChange={e => setAge(Number(e.target.value))} />
              <select value={hasGuess} onChange={e => setHasGuess(e.target.value)}>
                <option value='' hidden>Possui acompanhante?</option>
                <option value='sim'>Sim</option>
                <option value='nao'>Não</option>
              </select>
            </div>
            <div className={styles.row}>
              
            </div>

            {hasGuess === 'sim' && <button className={styles.addGuess} onClick={addNewGuess}>+ Acompanhante</button> }
            {hasGuess === 'sim' && guessItems.map((guessItem, index) => {
              return(
                <div className={styles.row}>
                  <input name='name' type='text' placeholder='Nome do acompanhante' value={guessItem.name} onChange={e => setGuessItemValue(index, 'name', e.target.value)} />
                  <input name='age' type='number' placeholder='Idade' value={guessItem.age} onChange={e => setGuessItemValue(index, 'age', e.target.value)} />
                </div>
              )
            })}
          </div>
          <p>Ao clicar em "Confirmar" você está ciente de que se <b>BEBER</b> não dirija, chame um <b>UBER</b>!</p>
          <button onClick={handleConfirm}>
            <img src="/images/beer-button.svg" alt="icon" />
            Confirmar presença
          </button>
          <h3>Restam apenas {50 - guest.length} de 50 vagas.</h3>

          <div className={styles.address}>
            <img src="/images/map.svg" alt="map pin" />
            <span>Av. Nicola Accieri, S/N - Condomínio 7763, Reserva da mata. | 18h às 22h</span>
          </div>
        </div>
      </main>
    </>
  )
}
