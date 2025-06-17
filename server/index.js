require('dotenv').config();
const fetch = require('node-fetch');
const express = require('express');
const ytdl = require("@distube/ytdl-core");
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const HttpsProxyAgent = require('https-proxy-agent');
const cors = require('cors');
const path = require('path');
const yt = require('yt-search');
const SpotifyWebApi = require('spotify-web-api-node');
const { title } = require('process');

const app = express();

const port = 3000;

app.use(express.json());
app.use(cors());
// Remove 'user:pass@' if you don't need to authenticate to your proxy.
// const proxy = 'http://111.111.111.111:8080';
// const agent = HttpsProxyAgent(proxy);

// Set the path to the ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);

const spotifyapi = new SpotifyWebApi({
    clientId:process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET,
    redirectUri:process.env.REDIRECT_URI
})



app.post('/download', async (req, res) => {

    const data = await spotifyapi.clientCredentialsGrant();
    spotifyapi.setAccessToken(data.body['access_token']);
    
    let songurl = req.body.song;
    let songid = songurl.slice((songurl.indexOf("track") + 6),songurl.length);

    console.log(songid);

    const song = await spotifyapi.getTrack(songid);
    let artist = song.body.artists[0].name;
    let songname = song.body.name;
    console.log(artist);
    

    try{
        const songquery = artist + songname + "lyrics";

        const video = await yt(songquery);
        
        const videoUrl = video.videos[0];

        const imagePath = path.join(__dirname, 'cover.jpg');

        console.log(videoUrl);

        if (!videoUrl.url || !ytdl.validateURL(videoUrl.url)) {
            return res.status(400).send('Invalid YouTube URL');
        }

        const info = await ytdl.getInfo(videoUrl.url);
        const format = ytdl.chooseFormat(info.formats, { quality: 18 });

        console.log(song.body.name);
        console.log(song.body.album.images[0].url);

        let ar = song.body.artists[0].name;
        let al = song.body.album.name;
        let yr = song.body.album.release_date.substring(0,4);

        const stream = ytdl(videoUrl.url, {format: format})
            .on('error', (err) => {
                console.error('ytdl error:', err.message);
                res.status(500).send('Error downloading video')
            })

        const downloadImage = async (url, imagePath) => {
            const response = await fetch(url);
            const buffer = await response.buffer();
            require("fs").writeFileSync(imagePath, buffer);
            console.log("Album cover downloaded successfully");
        }

        await downloadImage(song.body.album.images[0].url, imagePath);

        const conversionPromise = new Promise((resolve, reject) => {
            ffmpeg(stream)
                .input(imagePath)

                .outputOptions(
                    "-id3v2_version", "3",
                    '-c:v', 'mjpeg',  
                    '-map', ' 0:a',
                    '-map', '1:v',
                    "-metadata", `title=${songname}`,
                    '-metadata', `artist=${ar}`,
                    '-metadata', `album=${al}`,
                    '-metadata', `TDRC=${yr}`,
                    '-metadata', `TYER=${yr}`
                )
                .on('error', (err) => {
                    console.error('ffmpeg error:', err.message);
                    res.status(500).send('Error converting video');
                })
                .on('end', () => {
                    console.log('Conversion finished.');
                    res.json({song});
                })
                .save(songname + ".mp3"); 
        })
        await conversionPromise;


        
        
        
    } catch (error) {
        console.error("error:",error.message);
    }   
    
});

app.get("/downloadfile", (req,res) => {
    const filename = req.query.filename + ".mp3";
    const filepath = path.join(__dirname, filename);
    const coverpath = "cover.jpg";

    res.download(filepath, (err) => {
        if (err){
            console.error(err);
        } else{
            require('fs').unlink(filepath, (err) => {
                if (err){
                    console.error(err);
                } else{
                    console.log("file deleted");
                }
            });
            require('fs').unlink(coverpath, (err) => {
                if (err){
                    console.error(err);
                } else{
                    console.log("file deleted");
                }
            });
        }
        
    })
})



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
