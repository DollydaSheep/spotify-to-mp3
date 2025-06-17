import React, { useState } from 'react'
import './Home.css'
import Download from './download';

const Home = () => {

    const [song, setSong] = useState('');
    

    const [downloads,setDownloads] = useState([]);

    const handleForm = async (event) => {
        try {
            event.preventDefault();
            console.log("clicked");
            if(!song){
              alert("Form is empty!");
            }else{
              const response = await fetch('http://localhost:3000/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ song }),
              });

              if (!response.ok) {
                  throw new Error('Download failed');
              }

              const data = await response.json();
              console.log(data);
            
              let encodedName = encodeURIComponent(data.song.body.name);
              const file = await fetch(`http://localhost:3000/downloadfile?filename=${encodedName}`);

              const blob = await file.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              console.log(url);
              // a.href = url;
              // a.download = `${data.songname}.mp3`;  // Customize file name as needed
              // document.body.appendChild(a);

        
              setDownloads(prevDownloads => [
                ...prevDownloads,
                {url:url, songName:`${data.song.body.name}.mp3`, iData:data}
              ]);
            }
            
            

        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    };
    

  return (
    <>
    <div className='home'>
      <h1>Spotify to MP3</h1>
      <form onSubmit={handleForm} autoComplete='off'>
        <input type="text" name="song" onChange={e=>setSong(e.target.value)} />
        <input type="submit" />
      </form>
    </div>

    {
      downloads.map((download,index) => <Download key={index} url={download.url} songName={download.songName} iData={download.iData} />)
    }
    {/* {url ? <Download url={url} songName={songName} iData={iData}/> : ""} */}
    
    </>
  )
}

export default Home
