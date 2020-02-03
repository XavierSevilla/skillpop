import React from 'react'
import './index.sass'

export default function({onBack}) {
    return   <section>
             <div className="view">
             <a className="view__goback-button" href="" onClick={event => {
                event.preventDefault()
                const webant = ''
                onBack(webant)
            }}><i className="fas fa-angle-left"></i></a>


            <img className="view__logo" src="./images/sklogo.png" alt="logo"/>
            </div>
            </section>

}