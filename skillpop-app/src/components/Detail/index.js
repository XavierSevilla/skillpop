import React from 'react'
import './index.sass'
const API_URL = process.env.REACT_APP_API_URL


export default function ({ ad: { id, title, description, price, name, idPublic, isFav}, user:{id: idUser}, adDetail, onCreateChat, onToPubliProfile, onFav}) {
        return <section className='detailAd'>
        <img className="item__image" src={`${API_URL}/ads/load/${id}?timestamp=${Date.now()}`}/>
        <div className="detailAd__pf">
            <span className="detailAd__price">{price}€</span>
            <span className="detailAd__fav-submit" onClick={event => {
                event.preventDefault()
                event.stopPropagation()

                onFav(id, `ad`)
                }}> {isFav ? <i className="fas fa-heart"></i> : <i className="far fa-heart"></i>} </span>
        </div>
        <h2 className="detailAd__title">{title}</h2>
        <p className="detailAd__descr">{description}</p>
        <a href="#" className="detailAd__user" onClick={event => {
                event.preventDefault()

                onToPubliProfile(idPublic)

                }}>{name}</a>
        <form className="chat__form" onSubmit={function (event) {
                        event.preventDefault()

                        onCreateChat(idPublic)
        }}>
            <input type="hidden" name="id"/>
            <button className="chat__button">Chat</button>
        </form>
        </section> 

}
//     return me ? (
//         <section className='detailAd'>
//         <img className="item__image" src={`${API_URL}/ads/load/${id}?timestamp=${Date.now()}`}/>
//         <div className="detailAd__pf">
//             <span className="detailAd__price">{price}€</span>
//             <span className="detailAd__fav">
//                 <form className="detailAd_fav-form" method="post" action="">
//                     <input type="hidden" name="id"/>
//                     <button className="detailAd__fav-submit" type="submit"><i className="far fa-heart"></i></button>
//                 </form>
//             </span>
//         </div>
//         <h2 className="detailAd__title">{title}</h2>
//         <p className="detailAd__descr">{description}</p>
//         <a href="#" className="detailAd__user" onClick={event => {
//                 event.preventDefault()

//                 onToPubliProfile(idPublic)

//                 }}>{name}</a>
//         </section> 
//         ) : (
//         <section className='detailAd'>
//         <img className="item__image" src={`${API_URL}/ads/load/${id}?timestamp=${Date.now()}`}/>
//         <div className="detailAd__pf">
//             <span className="detailAd__price">{price}€</span>
//             <span className="detailAd__fav">
//                 <form className="detailAd_fav-form" method="post" action="">
//                     <input type="hidden" name="id"/>
//                     <button className="detailAd__fav-submit" type="submit"><i className="far fa-heart"></i></button>
//                 </form>
//             </span>
//         </div>
//         <h2 className="detailAd__title">{title}</h2>
//         <p className="detailAd__descr">{description}</p>
//         <a href="#" className="detailAd__user" onClick={event => {
//                 event.preventDefault()

//                 onToPubliProfile(idPublic)

//                 }}>{name}</a>
//         <form className="chat__form" onSubmit={function (event) {
//                         event.preventDefault()

//                         onCreateChat(idPublic)
//         }}>
//             <input type="hidden" name="id"/>
//             <button className="chat__button">Chat</button>
//         </form>
//         </section> 

//         )  
// }