import React from 'react'
import './index.sass'

export default function ({ ad: { id, title, price, description }, onUpdateAd }) {
    return <section className='modifyAd'>
        <h2 className="modifyAd__title">Modify AD</h2>
        <form className="modifyAd__form" onSubmit={function (event) {
            event.preventDefault()

            const { file: { files : [image]}, title: { value: title }, price: { value: price }, description: { value: description } } = event.target

            onUpdateAd(image, id, title, description, price)
            }}>
            <label>Title</label>
            <input  className="modifyAd__titlead" type="text" name="title" defaultValue={title}/>
            <label>Price</label>
            <input type="number" className="modifyAd__price" name="price" defaultValue={price}/>
            <label>Description</label>
            <textarea name="description" className="modifyAd__field" cols="28" rows="15"
                placeholder={description} defaultValue={description}></textarea>
            <h2 className="modifyAd__title2">Add Image</h2>
            <input type="file" name="file" accept="image/*"/>
            <button className="modifyAd__button">Submit</button>
        </form>
    </section>
}