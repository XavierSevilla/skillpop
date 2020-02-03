import React from 'react'
import './index.sass'
import MyAdsItem from '../MyAdsItem'

export default function ({ ads, adDetail, onDeleteAd, onToUpdateAd }) {
    return <>
    <h2>{ ads ? 'My ADS' : '' }</h2>
    <ul className="results">
        {ads && ads.map(ad => <li className="results__item" key={ad.id}><MyAdsItem ad={ad} adDetail={adDetail} onDeleteAd={onDeleteAd} onToUpdateAd={onToUpdateAd}/></li>)}
    </ul>
    </>
}