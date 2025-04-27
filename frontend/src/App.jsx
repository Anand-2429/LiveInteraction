
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer/simplepeer.min.js'; // 👈 New import

const socket = io('https://liveinteraction.onrender.com'); // Tumhara backend URL

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [caller, setCaller] = useState("");

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const [stream, setStream] = useState();

  useEffect(() => {
    // Chat receive
    socket.on('receive_message', (data) => {
      console.log('Message received:', data);
      setChat((prev) => [...prev, data]);
    });

    // Call receive
    socket.on('callUser', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      connectionRef.current.signal(signal);
    });

    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      });

    return () => {
      socket.off('receive_message');
      socket.off('callUser');
      socket.off('callAccepted');
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;

    socket.emit('send_message', {
      message,
    });
    setMessage('');
  };

  const callUser = () => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: 'target', // 🛑 Abhi dummy id, backend me manage karenge
        signalData: data,
        from: socket.id,
      });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: caller });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.signal(callerSignal);

    connectionRef.current = peer;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Chat Room 🩺 + Call 📞</h2>

      {/* Chat Area */}
      <div style={{ marginBottom: '20px', border: '1px solid gray', padding: '10px', height: '300px', overflowY: 'auto' }}>
        {chat.map((msg, index) => (
          <div key={index}>
            <b>User:</b> {msg.message}
          </div>
        ))}
      </div>

      {/* Send Message */}
      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: '300px', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 12px', marginLeft: '10px' }}>
          Send
        </button>
      </form>

      <hr style={{ margin: '30px 0' }} />

      {/* Calling Section */}
      <div>
        <video playsInline muted ref={myVideo} autoPlay style={{ width: '300px' }} />
        <video playsInline ref={userVideo} autoPlay style={{ width: '300px' }} />
      </div>

      <div style={{ marginTop: '20px' }}>
        {receivingCall && !callAccepted ? (
          <button onClick={answerCall} style={{ padding: '10px 20px', marginRight: '10px' }}>
            Answer Call
          </button>
        ) : (
          <button onClick={callUser} style={{ padding: '10px 20px' }}>
            Call User
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
