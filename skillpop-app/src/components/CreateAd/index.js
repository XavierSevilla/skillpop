import React from 'react'
import './index.sass'

export default function ({onCreateAd}) {
    return  <section className='newAd'>
        <h2 className="newAd__title">New AD</h2>
        <form className="newAd__form" onSubmit={function (event) {
                        event.preventDefault()

                        const { file: { files : [image]}, title: { value: title }, price: { value: price }, 
                                description: { value: description } } = event.target

                        onCreateAd(image, title, price, description)
        }}>
            <label>Title</label>
            <input type="text" className="newAd__titlead" name="title" placeholder="New Title"/>
            <label>Price</label>
            <input type="number" className="newAd__price" name="price" placeholder="New Price"/>
            <label>Description</label>
            <textarea name="description" className="newAd__field" cols="28" rows="15"
                placeholder="New Description"></textarea>
            <h2 className="newAd__title2">Add Image</h2>
            <input className="modifyAd__upImage" type="file" name="file" accept="image/*"/>
            <button className="newAd__button">Submit</button>
        </form>
    </section>
}