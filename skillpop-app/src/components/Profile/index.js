import React from 'react'
import './index.sass'
import MyAds from '../MyAds'
export default function ({ ads, user: {name, surname, city, address}, adDetail, onDeleteAd, onToUpdateAd, onUpdateUser }) {
    return <section className='profile'>
                <h1 className="profile__title">Profile</h1>
                <form className="profile__form" onSubmit={function (event) {
                        event.preventDefault()

                        const { file: { files : [image]}, name: { value: name }, surname: { value: surname }, 
                                city: { value: city }, address: { value: address } } = event.target

                        onUpdateUser(image, name, surname, city, address)
                    }}>
                    <label>Name</label>
                    <input type="text" className="profile__field" name="name" defaultValue={name}/>
                    <label>Surname</label> 
                    <input type="text" className="profile__field" name="surname" defaultValue={surname} />
                    <label>City</label>
                    <input type="text" className="profile__field" name="city" defaultValue={city}/>
                    <label>Address</label>
                    <input type="text" className="profile__field" name="address" defaultValue={address}/>
                    <h2 className="profile__title2">Add Image</h2>
                    <input type="file" name="file" accept="image/*"/>
                    <button className="profile__button">Update</button>
                </form>
                <MyAds ads={ads} adDetail={adDetail} onDeleteAd={onDeleteAd} onToUpdateAd={onToUpdateAd}/>
            </section> 
             
}