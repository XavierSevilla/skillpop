import React from 'react'
import './index.sass'

export default function({ onLogin, onBack, error }) {
    return  <section className='login'>
         <h1 className="login__title">Log In</h1>
            <form className="login__form"onSubmit={function (event) {
            event.preventDefault()

            const { email: { value: email }, password: { value: password } } = event.target

            onLogin(email, password)
            }}>
                <p className="login__petition">Please, enter your <b>email</b></p>
                <input type="email" className="login__email" name="email" placeholder="hello@gmail.com"/>
                <p className="login__petition">Please, enter your <b>password</b></p>
                <input type="password" className="login__password" name="password" placeholder="Password"/>
                <button className="login__button">Login</button>
            </form>
            </section>
}