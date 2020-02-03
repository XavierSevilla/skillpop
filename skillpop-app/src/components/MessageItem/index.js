import React from 'react'
import './index.sass'
const API_URL = process.env.REACT_APP_API_URL

export default function ({ message:{user: userM, body, date}, user:{id: user} }) {
    let me = false
    if (userM === user) {me = true}
    return  me ? 
            <><div>
            <img className="itemMessage__image-right" src={`${API_URL}/users/load/${user}?timestamp=${Date.now()}`}/>
            <p className="itemMessage__text">{body}</p>
            <span className="itemMessage__time-right">{date}</span>
            </div>
            </> 
            :
            <><div className="darker">
            <img className="itemMessage__image-left" src={`${API_URL}/users/load/${userM}?timestamp=${Date.now()}`}/>
            <p className="itemMessage__text">{body}</p>
            <span className="itemMessage__time-left">{date}</span>
            </div>
            </> 
}