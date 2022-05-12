import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router"
import io, { Socket } from 'socket.io-client'

export const PC_CONFIG: RTCConfiguration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302', 'stun:stun2.l.google.com:19305'],
    },
  ],
};
const SOCKET_DOMAIN = `ws://localhost:3001`;

const Room = () => {
  const { id } = useParams()
  const streamRef = useRef<MediaStream>()
  const connectionRef = useRef<RTCPeerConnection>()
  const socketRef = useRef<Socket>()
  const myVideoRef = useRef<HTMLVideoElement>(null)
  const peerVideoRef = useRef<HTMLVideoElement>(null)

  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const roomName = `room${id}`

  const getMedia = async () => {
    streamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    })
    if (myVideoRef.current) {
      myVideoRef.current.srcObject = streamRef.current
    }
  }

  const handleIce = (event: RTCPeerConnectionIceEvent) => {
    if (!socketRef.current) return 

    socketRef.current.emit('ice', event.candidate, roomName)
  }
  
  const handleAddStream = (event: RTCTrackEvent) => {
    if (!peerVideoRef.current) return 

    peerVideoRef.current.srcObject = event.streams[0]
  }

  const makeConnection = () => {
    if (!streamRef.current || connectionRef.current) return

    connectionRef.current = new RTCPeerConnection(PC_CONFIG)
    connectionRef.current.addEventListener('icecandidate', handleIce)
    connectionRef.current.addEventListener('track', handleAddStream)
    streamRef.current?.getTracks().forEach(track => {
      if (connectionRef.current && streamRef.current) {
        connectionRef.current.addTrack(track, streamRef.current)
      }
    })
  }

  const initSocket = () => {
    socketRef.current = io(SOCKET_DOMAIN);

    socketRef.current.on('welcome', async () => {
      console.log('welcome')
      if (!connectionRef.current || !socketRef.current) return

      const offer = await connectionRef.current.createOffer()
      console.log('create offer')
    
      await connectionRef.current.setLocalDescription(offer)
      console.log('Set Local Offer')
      console.log('state: ', connectionRef.current.signalingState)
    
      socketRef.current.emit('offer', offer, roomName)
    })
    
    socketRef.current.on('offer', async (offer) => {
      if (!connectionRef.current || !socketRef.current) return

      await connectionRef.current.setRemoteDescription(offer)
      console.log('Set Remote Offer')
      console.log('state: ', connectionRef.current.signalingState)
    
      const answer = await connectionRef.current.createAnswer()
      console.log('Create Answer')
    
      await connectionRef.current.setLocalDescription(answer)
      console.log('Set Local Answer')
      console.log('state: ', connectionRef.current.signalingState)
    
      socketRef.current.emit('answer', answer, roomName)
    })
    
    socketRef.current.on('answer', async (answer) => {
      if (!connectionRef.current) return

      await connectionRef.current.setRemoteDescription(answer)
      console.log('Set Remote Answer')
      console.log('state: ', connectionRef.current.signalingState)
    })
    
    socketRef.current.on('ice', ice => {
      if (!connectionRef.current) return

      connectionRef.current.addIceCandidate(ice)
    })
  }

  const initCall = async () => {
    await getMedia()
    makeConnection()
  }
  

  useEffect(function init() { 
    initSocket()
    initCall()

    socketRef.current!.emit('join_room', roomName)
  }, [])

  const toggleMute = () => {
    streamRef.current?.getAudioTracks().forEach(track => track.enabled = muted)
    setMuted(prev => !prev)
  }

  const toggleVideo = () => {
    streamRef.current?.getVideoTracks().forEach(track => track.enabled = videoOff)
    setVideoOff(prev => !prev)
  }
  
  return (
    <main>
      <div>
        <video ref={myVideoRef} autoPlay playsInline muted width="400" height="400"/>
        <button onClick={toggleMute}>{muted ? 'Unmute' : 'Mute'}</button>
        <button onClick={toggleVideo} style={{ marginLeft: '10px' }}>{videoOff ? 'Video On' : 'Video Off'}</button>
      </div>
      <div>
        <video ref={peerVideoRef} autoPlay playsInline width="400" height="400"/>
      </div>
    </main>
  )
}

export default Room