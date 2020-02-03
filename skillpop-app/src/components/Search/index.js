import React from 'react'
import './index.sass'
import AdsResults from '../AdsResults'
// import { Link } from 'react-router-dom'

export default function({ onSearch, onLogout, ads, adDetail, onProfile, onToCreateAd, onToPubliProfile, onToFavorites, onFav, onToChats, query }) {
    return  <><section className="search">
        <div className="search__header">
            <nav>
                <div id="menuToggle">
                    <input type="checkbox" />
                    <span></span>
                    <span></span>
                    <span></span>
                    <ul className="menu">
                        <li><a className="menu__item" onClick={event => {
                             event.preventDefault()

                              onProfile()
                        }}>My Profile</a></li>
                        <li><a className="menu__item" onClick={event => {
                             event.preventDefault()

                              onToPubliProfile()
                        }}>Public Profile</a></li>
                        <li><a className="menu__item" onClick={event => {
                             event.preventDefault()

                              onToCreateAd()
                        }}>Create Ad</a></li>
                        <li><a className="menu__item" onClick={event => {
                             event.preventDefault()

                              onToFavorites()
                        }}>Favorites</a></li>
                        <li><a className="menu__item" onClick={event => {
                             event.preventDefault()

                              onToChats()
                        }}>Chats</a></li>
                        <li><a className="menu__item" onClick={event => {
                             event.preventDefault()

                              onLogout()
                        }}>Logout</a></li>
                    </ul>
                </div>
            </nav>
            <form className="search__form" onSubmit={event => {
                event.preventDefault()

                    const query = event.target.query.value
                

                    onSearch(query)
                }}>
                <input className="search__criteria" type="text" name="query" placeholder="criteria" defaultValue={query}/>
                <button className="search__submit">🔍</button>
            </form>
            <img className="search__logo" src="./images/sklogo.png" alt=""/>
        </div>
        <div className="title__landing">
            <h2>Productos cerca de ti</h2>
        </div> 
    </section>
     <AdsResults ads={ads} adDetail={adDetail} onFav={onFav} /> </> 
}
