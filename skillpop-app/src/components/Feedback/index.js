import React from 'react'
import './index.sass'

export default function({error:{message}, onBack}) {
    return <section className='feedback'>
        <div className='feedback__div'>
            <button className="feedback__goback-button"onClick={event => {
                event.preventDefault()
                onBack()
            }}><i className="fas fa-times"></i></button>
            <p className='feedback__message'>❗ {message} ❗</p>
        </div>
        </section>

}