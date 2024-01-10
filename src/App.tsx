import { useState, useEffect, useRef, MutableRefObject } from 'react'
import './App.css'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgpu';
import * as cocossd from "@tensorflow-models/coco-ssd"

function App() {
   // const [isLoading, setIsLoading] = useState(true)
   const [model, setModel] = useState<null | cocossd.ObjectDetection>(null)
   // const modelRef: undefined | any = useRef(undefined)
   const videoRef: MutableRefObject<HTMLVideoElement | null> = useRef(null)
   const canvasRef: MutableRefObject<HTMLCanvasElement | null> = useRef(null)

   async function setUp(): Promise<void> {
      // Make sure TensorFlow.js is ready
      await tf.ready();
      
      // Set the backend to WebGPU and wait for the module to be ready.
      tf.setBackend('webgpu')
      // setModel(await cocossd.load())
      await cocossd.load().then(model => {
         console.log("lmao", model)
         setModel(model)
      })
   }

  // onMount
  useEffect(() => {
   setUp()


   const All_mediaDevices=navigator.mediaDevices
   if (!All_mediaDevices || !All_mediaDevices.getUserMedia) {
      console.log("getUserMedia() not supported.");
      return;
   }
   All_mediaDevices.getUserMedia({
      audio: true,
      video: true
   })
   .then(function(vidStream) {
      let video = document.getElementById('videoCam')! as HTMLVideoElement
      
   //  if(!video){
   //   video = document.createElement("video")
   //   video.id = 'videoCam'
   //   document.body.appendChild(video)
   //  }

   //  if (videoRef.current) {
   //   // Use type assertion to tell TypeScript that videoRef.current is an HTMLVideoElement
   //   video = videoRef.current as HTMLVideoElement;

   //   // Now you can access video-specific properties like 'src'
   //   video.src = 'your-video-source.mp4';
   // }

      if ("srcObject" in video) {
         video.srcObject = vidStream;
      }

      video.onloadedmetadata = function() {
         video.play();
      }

      canvasRef.current = document.getElementById("canvas") as HTMLCanvasElement

      setInterval(() => {
         if(model && videoRef.current) {
            model.detect(videoRef.current).then(predictions => {
               // console.log("P", predictions)
               // draw overlay
               if(canvasRef.current && videoRef.current){
                  // Set canvas height and width
                  canvasRef.current.width = videoRef.current.videoWidth
                  canvasRef.current.height = videoRef.current.videoHeight
                  const ctx = canvasRef.current.getContext("2d")
                  // console.log("INSIDE")
                  if(ctx) {
                     predictions.forEach(prediction => {
                        const [x,y,width,height] = prediction['bbox']
                        const label = prediction['class']
                        
                        const color = "green"
                        const font = '18px Arial'
                        ctx.strokeStyle = ctx.fillStyle = color
                        ctx.font = font

                        ctx.beginPath()
                        ctx.fillText(label,x,y)
                        ctx.rect(x,y,width,height)
                        ctx.stroke()
                     })
                  }
                  
               }
            })
            
            
            
         }
         // console.log("=====", model)
      }, 10)

    })
    .catch(function(e) {
       console.log(e.name + ": " + e.message);
    });  }, []);


  return (
    <>
      <video ref={videoRef} id="videoCam" style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            width: 640,
            height: 480,
          }}></video>
      <canvas id='canvas' style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            width: 640,
            height: 480,
          }}></canvas>
    </>
  )
}

export default App
