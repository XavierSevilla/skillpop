import React from 'react'
import './index.sass'
import ChatItem from '../ChatItem'

export default function ({chats, user, onDeleteChat, onChat }) {
    return <section className='messages'>
        <h1 className="messages__title">Messages</h1>
        <h2 className="messages__subtitle">My Chats</h2>
        <ul className="chats">
            {chats && chats.map(chat => <li className="chats__item" key={chat.id}><ChatItem chat={chat} user={user} onDeleteChat={onDeleteChat} onChat={onChat}/></li>)}
        </ul>
        </section>

}




