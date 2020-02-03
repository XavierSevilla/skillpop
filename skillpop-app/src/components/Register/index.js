import React from 'react'
import './index.sass'

export default function({ onRegister, onBack, error }) {
    return <section className='register'>
            <h1 className="register__title">Register</h1>
            <form className="register__form" onSubmit={function (event) {
            event.preventDefault()

            const { name: { value: name }, surname: { value: surname }, city: { value: city },  address: { value: address }, email: { value: email }, password: { value: password } } = event.target

            onRegister(name, surname, city, address, email, password)
            }}>
                <input type="text" className="register__field" name="name" placeholder="Name"/>
                <input type="text" className="register__field" name="surname" placeholder="Surname"/>
                <input type="text" className="register__field" name="city" placeholder="city"/>
                <input type="text" className="register__field" name="address" placeholder="address"/>
                <input type="email" className="register__field" name="email" placeholder="hello@gmail.com"/>
                <input type="password" className="register__field" name="password" placeholder="Password"/>
                <button className="register__button">Register</button>
            </form>
            </section>

}