import React from 'react';
import './Download.css'

const Download = (props) => {
  return (
    <div className='download-card'>
      <div className='info'>
        <img src={props.iData.song.body.album.images[1].url}/>
        <div className="name">
          <h1>{props.iData.song.body.name}</h1>
          <h3>{props.iData.song.body.artists[0].name}</h3>
        </div>
        
      </div>
        <a href={props.url} download={props.songName}>download</a>

        
    </div>
  )
}

export default Download
