import React from 'react'
import './index.sass'

export default function ({ onLogin, onRegister }) {
    return <section className='landing'>
            <div className='landing__welcome'>
                <img className="landing__logo" src="./images/sklogo.png" alt=""/>
                <h1 className='landing__title'>Welcome to SKILLPoP</h1>
            </div>
            <div className='landing__actions'>
                <a className='landing__login' href="#" onClick={event => {
                             event.preventDefault()

                              onLogin()
                        }}>Login</a>
                <label>OR</label>
                <a className='landing__register' href="#"onClick={event => {
                             event.preventDefault()

                              onRegister()
                        }}>Register</a>
            </div>
    </section>
}