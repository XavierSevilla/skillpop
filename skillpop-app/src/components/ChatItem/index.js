import React from 'react'
import './index.sass'
const API_URL = process.env.REACT_APP_API_URL


export default function ({ chat: {id: idChat, idPublic, namePublic}, users, onDeleteChat, onChat}) {
    return <><a href="#" className="itemchat" onClick={event => {
               event.preventDefault()

               onChat(idChat)
               }}>
                <img className="itemchat__image" src={`${API_URL}/users/load/${idPublic}?timestamp=${Date.now()}`}/>
                <h2 className="itemchat__user">{namePublic}</h2>
             </a>
             <form className="itemchat__form" onSubmit={function (event) {
                event.preventDefault()

                onDeleteChat(idChat)
             }}>
                <input type="hidden" name="id"/>
                <button className="itemchat__delete">Delete</button>
             </form></>
}