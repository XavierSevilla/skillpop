import React from 'react'
import './index.sass'
import AdItem from '../AdItem'
import CommentItem from '../CommentItem'
const API_URL = process.env.REACT_APP_API_URL

export default function ({comments, ads, user: {id, name}, adDetail, OnCreateComment, onFav}) {
    return <section className='publiProfile'>
            <div className="publiProfile__head">
                <img className="publiProfile__image" src={`${API_URL}/users/load/${id}?timestamp=${Date.now()}`}/>
                <h3 className="publiProfile__user">{name}</h3>
            </div>
            <h2 className="publiProfile__titlead">ADS</h2>
            <ul className="results">
                {ads && ads.map(ad => <li className="results__item" key={ad.id}><AdItem ad={ad} adDetail={adDetail} onFav={onFav} comeFrom={`publicprofile/${id}`}/></li>)}
            </ul>
            <div className="comments">
                 <h2 className="comments__title">Comments:</h2>
                <form className="comments__form" onSubmit={event => {
                        event.preventDefault()

                        const { comment: { value: comment } } = event.target
                

                        OnCreateComment(comment, id)
                     }}>
                    <textarea className="comments__textarea" name="comment" placeholder="Add you comment"></textarea>
                    <input type="hidden" name="id"/>
                    <button className="comments__submit"><i className="fas fa-arrow-circle-right"></i></button>
                </form>
            </div>
            <ul className="resultComments">
                {comments && comments.map(comment => <li className="resultComments__item" key={comment.id}><CommentItem comment={comment} name={name}/></li>)}
            </ul>
    </section>
             
}