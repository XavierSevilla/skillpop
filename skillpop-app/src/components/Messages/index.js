import React from 'react'
import './index.sass'
import MessageItem from '../MessageItem'

export default function ({ chat, user, OnCreateMessage }) {
    const { idChat } = chat
    return  <section className='messagesDetail'>
            <h1 className="messagesDetail__title">Chat</h1>
            <ul className="messagesDetail__box">
                {chat && chat.map(message => <li className="itemMessage" key={message.id}><MessageItem message={message} user={user} /></li>)}
            </ul>
            <form className="messagesDetail__form"onSubmit={event => {
                        event.preventDefault()

                        const { message: { value: message } } = event.target
                

                        OnCreateMessage(message, idChat)
                     }}>
                <input className="messagesDetail__send" type="text" name="message" placeholder="message"/>
                <button className="messagesDetail__submit"><i className="fas fa-arrow-circle-right"></i></button>
            </form>
            </section>
}