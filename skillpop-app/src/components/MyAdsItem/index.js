import React from 'react'
import './index.sass'
const API_URL = process.env.REACT_APP_API_URL


export default function ({ ad: { id, title, price }, adDetail, onDeleteAd, onToUpdateAd }) {
    return <><a href="#" className="item" onClick={event => {
            event.preventDefault()

            adDetail(id)
            }}>
            <img className="item__image" src={`${API_URL}/ads/load/${id}?timestamp=${Date.now()}`}/>
            {/* <img className="item__image" src="https://dummyimage.com/120x130/949494/1f1f1f"/> */}
            <div className="item__pf">
                <span className="item__price">{price}€</span>
            </div>
            <h2 className="item__title">{title}</h2>
        </a>
        <div className="item__actions">
            <form className="item__form" onSubmit={function (event) {
            event.preventDefault()

            onDeleteAd(id)
            }}>
                <input type="hidden" name="id"/>
                <button className="item__delete">Delete</button>
            </form>
            <form className="item__form" onSubmit={function (event) {
            event.preventDefault()

            onToUpdateAd(id)
            }}>
                <input type="hidden" name="id"/>
                <button className="item__update">Update</button>
            </form>
        </div></>
}