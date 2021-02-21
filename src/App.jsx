import React, { useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
// import VideoThumbnail from 'react-video-thumbnail';

import './App.css';
import { v4 as uuid } from 'uuid'

import Amplify, { API, graphqlOperation, Storage } from 'aws-amplify'
import awscofig from './aws-exports'
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react'

import { listVideos } from './graphql/queries'
import { createVideo, updateVideo } from './graphql/mutations';

import { IconButton, Paper, TextField, Grid, Modal, Backdrop, Fade } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import FavoriteIcon from '@material-ui/icons/Favorite'
import PauseIcon from '@material-ui/icons/Pause'
import AddIcon from '@material-ui/icons/Add'
import PublishIcon from '@material-ui/icons/Publish'
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';


Amplify.configure(awscofig)

function App() {

  const [videos, setVideos] = useState([])
  const [videoPlaying, setVideoPlaying] = useState('')
  const [videoURL, setVideoURL] = useState('')
  const [showAddVideo, setShowAddNewVideo] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [])

  const toggleVideo = async idx => {
    if (videoPlaying === idx) {
      setVideoPlaying('')
      return
    }

    const videoFilePath = videos[idx].filepath
    try {
      const fileAccessURL = await Storage.get(videoFilePath, { expires: 60 })
      console.log('access url', fileAccessURL)
      setVideoPlaying(idx)
      setVideoURL(fileAccessURL)
      return
    }
    catch (error) {
      console.log('error accessing file from s3', error)
      setVideoURL('')
      setVideoPlaying('')
    }


  }

  const fetchVideos = async () => {
    try {
      const videoData = await API.graphql(graphqlOperation(listVideos))
      const videoList = videoData.data.listVideos.items
      console.log('video list', videoList)
      setVideos(videoList)
    }
    catch (error) {
      console.log('error on fetching videos', error)
    }
  }

  const addLike = async (idx) => {
    try {
      const video = videos[idx]
      video.like = video.like + 1;
      delete video.createdAt
      delete video.updatedAt

      const videoData = await API.graphql(graphqlOperation(updateVideo, { input: video }))
      const videoList = [...videos]
      videoList[idx] = videoData.data.updateVideo
      setVideos(videoList)

    }
    catch (error) {
      console.log('error on liking the video', error)
    }

  }

  const handleOpen = () => {
    setShowAddNewVideo(true);
  };

  const handleClose = () => {
    setShowAddNewVideo(false);
  };

  return (
    <div className="App">
      <header className="App-header">

        {/* <Paper variant='outlined' elevation={2}>
        {
          showAddVideo ? (

            <AddVideo onUpload={() => {
              setShowAddNewVideo(false)
              fetchVideos()
            }} />
          ) : <IconButton onClick={() => { setShowAddNewVideo(true) }}>
              <AddIcon />UPLOAD VIDEO
            </IconButton>

        }
      </Paper> */}


        {
          <Paper variant='outlined' elevation={2} className="modalPaper">
            {
              showAddVideo ? (

                <Modal
                  aria-labelledby="transition-modal-title"
                  aria-describedby="transition-modal-description"
                  // className="modal"
                  open={showAddVideo}
                  onClose={handleClose}
                  closeAfterTransition
                  BackdropComponent={Backdrop}
                  BackdropProps={{
                    timeout: 500,
                  }}
                >
                  <Fade in={showAddVideo}>
                    <Paper>
                      <AddVideo onUpload={() => {
                        setShowAddNewVideo(false)
                        fetchVideos()
                      }} />
                    </Paper>
                  </Fade>
                </Modal>

              ) : <IconButton onClick={handleOpen}>
                  <AddIcon />
                  <div style={{ fontSize: 14, fontWeight: 'bold' }}>UPLOAD</div>
                </IconButton>
            }
          </Paper>

        }
        <AmplifySignOut />

      </header>



      <Grid
        container
        // spacing={4}
        // className="gridContainer"
        justify="center"
      >

        <Grid item xs={12} sm={12} md={12} lg={9} >
          {/* <Card className="videoPlayerBox"> */}
          <Card>
            {/* <div className="videoPlayerBox"> */}
            <CardActionArea>

              <CardMedia
                className='react-player'
                src={videoURL}
                component="video"
                controls
              />
              {/* 
              <ReactPlayer
                className='react-player'
                url={videoURL}
                playing={true}
                controls
                width='100%'
                height='80%'
              /> */}

              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">

                </Typography>

                {/* </div> */}

                <Typography variant="body2" color="textSecondary" component="p">
                  Comments Section Here in Progress
                </Typography>
              </CardContent>
            </CardActionArea>

          </Card>
        </Grid>

        <Grid item xs={12} sm={12} md={12} lg={3}>
          {/* <div className="videoList"> */}
          {videos.map((video, idx) => {
            return (
              // <Paper variant="outlined" elevation={2} square key={`video${idx}`}>
              // /* <div className="videoCard"> */
              <Card>
                <CardContent>

                  <Typography gutterBottom variant="h5" component="h2">
                    <div className="videoTitle">{video.title}</div>
                  </Typography>

                  <Typography variant="body2" color="textSecondary" component="p">
                    <div className="videoOwner">{video.owner}</div>
                  </Typography>

                  <Typography paragraph>
                    <div className="videoDescrption">{video.description}</div>
                  </Typography>

                  <CardActions>

                    <IconButton aria-label="play" onClick={() => toggleVideo(idx)}>
                      {videoPlaying === idx ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>

                    <IconButton aria-label="like" onClick={() => addLike(idx)}>
                      <FavoriteIcon />
                      {video.like}
                    </IconButton>

                  </CardActions>

                </CardContent>
              </Card>

              //  </div> 
              //   {/* {
              //   videoPlaying === idx ? (
              //     <div className="videoPlayerBox">
              //       <ReactPlayer
              //         url={videoURL}
              //         playing={true}
              //         controls
              //         height="200px"
              //         onPause={() => toggleVideo(idx)} />
              //     </div>
              //   ) : null
              // } */}

              // </Paper>


            )
          })
          }

          {/* </div> */}
        </Grid>
      </Grid>


    </div >
  );
}

export default withAuthenticator(App);


const AddVideo = ({ onUpload }) => {

  const [videoData, setVideoData] = useState({})
  const [mp4Data, setMp4Data] = useState()

  const uploadVideo = async () => {
    console.log('videoData', videoData)

    const { title, description, owner } = videoData
    const { key } = await Storage.put(`${uuid()}.mp4`, mp4Data, { contentType: 'video/mp4' })

    const createVideoInput = {
      id: uuid(),
      title,
      description,
      owner,
      filepath: key,
      like: 0
    }
    await API.graphql(graphqlOperation(createVideo, { input: createVideoInput }))
    onUpload()
  }



  return (
    <div className="modalPaper">
      <TextField
        label="Title"
        value={videoData.title}
        onChange={e => setVideoData({ ...videoData, title: e.target.value })}
      />
      <TextField
        label="Owner"
        value={videoData.owner}
        onChange={e => setVideoData({ ...videoData, owner: e.target.value })}
      />
      <TextField
        label="Description"
        value={videoData.description}
        onChange={e => setVideoData({ ...videoData, description: e.target.value })}
      />

      <input type="file" accept="video/mp4" onChange={e => setMp4Data(e.target.files[0])} />

      <IconButton onClick={uploadVideo}>
        <PublishIcon />
      </IconButton>
    </div >
  )
}