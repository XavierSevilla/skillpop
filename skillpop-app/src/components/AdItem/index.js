import React from 'react'
import './index.sass'
const API_URL = process.env.REACT_APP_API_URL

export default function ({ ad: { id, title, price, isFav }, adDetail, onFav, comeFrom }) {
    return <a href="#" className="item" onClick={event => {
            event.preventDefault()

            adDetail(id)
        }}>
            <img className="item__image" src={`${API_URL}/ads/load/${id}?timestamp=${Date.now()}`}/>
            <div className="item__pf">
                <span className="item__price">{price}€</span>
                <span className="item__fav-submit" onClick={event => {
                event.preventDefault()
                event.stopPropagation()

                onFav(id, comeFrom)
                }}> {isFav ? <i className="fas fa-heart"></i> : <i className="far fa-heart"></i>} </span>
            </div>
            <h2 className="item__title">{title}</h2>
        </a>
}