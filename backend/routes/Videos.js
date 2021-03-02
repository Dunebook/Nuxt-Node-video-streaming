const express = require('express')
const router = express.Router()
const videos = require('../mockData')
const fs = require('fs')

// get list of video
router.get('/', (req,res)=>{
    res.json(videos)
})

// make request for a particular video
router.get('/:id/data', (req,res)=> {
    const id = parseInt(req.params.id, 10)
    res.json(videos[id])
})

//streaming route
router.get('/video/:id', (req, res) => {
    const videoPath = `assets/${req.params.id}.mp4`;
    const videoStat = fs.statSync(videoPath);
    const fileSize = videoStat.size;
    const videoRange = req.headers.range;
    if (videoRange) {
        const parts = videoRange.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize-1;
        const chunksize = (end-start) + 1;
        const file = fs.createReadStream(videoPath, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});

// captions route
const captionPath = '/home/madfinger/Desktop/MyProjects/streaming-app/backend'
router.get('/video/:id/caption', (req, res) => res.sendFile(`assets/captions/${req.params.id}.vtt`, { root: captionPath }));
module.exports = router;