import React from 'react'
import './index.sass'
const API_URL = process.env.REACT_APP_API_URL

export default function ({ comment: { user, date, body}, name }) {
    return  <><h5 className="itemComents__user">{name}:</h5>
            <span className="itemComents__date">{date}</span>
            <p className="itemComents__text">{body}</p>
            </>
}