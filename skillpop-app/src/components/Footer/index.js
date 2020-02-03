import React from 'react'
import './index.sass'

export default function({onBack}) {
    return <section className="footer">
        <div className="footer__div">
            <p className="footer__title">Skillpop S.L.</p>
            <img className="footer__logo" src="./images/sklogo.png" alt=""/>
        </div>
        <p className="footer__text">Copyright © 2019 | Todos los derechos reservados</p>
        </section>  
}