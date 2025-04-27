import { v4 as uuidv4 } from 'uuid';

export class WebRTCManager {
  private peerConnection: RTCPeerConnection;
  private localStream: MediaStream;
  private remoteStream: MediaStream;
  private signalingChannel: (message: any) => void;
  private activeCall: { did: string; connectionId: string } | null = null;
  private audioElement: HTMLAudioElement | null = null;

  constructor(signalingChannel: (message: any) => void) {
    this.signalingChannel = signalingChannel;
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    });

    this.localStream = new MediaStream();
    this.remoteStream = new MediaStream();

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate = event.candidate as RTCIceCandidate;
        const candidateString = candidate.candidate; // Extract the ICE candidate string
        if (!candidateString) {
          console.warn('No candidate string found');
          return;
        }
    
        const candidateJson = JSON.stringify({
          candidate: candidateString,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex,
        });
    
        this.signalingChannel({
          type: 'candidate',
          candidate: candidateJson,
          mid: candidate.sdpMid,
          to: this.activeCall.did,
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream.addTrack(event.track);

      // Attach the remote stream to an audio element for playback
      const audioElement = new Audio();
      audioElement.srcObject = this.remoteStream;
      audioElement.autoplay = true;

      // Store the audio element for cleanup
      this.audioElement = audioElement;
    };
  }

  async startCall(did: string): Promise<string | null> {
    if (this.activeCall && this.activeCall.did === did) {
      console.warn('Call already active for this DID');
      return null;
    }

    if (this.activeCall) {
      console.warn('Another call is active. Ending it before starting a new one.');
      this.endCall();
    }
    
    const connectionId = uuidv4();
    this.activeCall = { did, connectionId };

    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.signalingChannel({
      type: 'offer',
      sdp: offer.sdp,
      connectionId,
      to: did,
    });

    return connectionId;
  }

  async handleOffer(msg, offer: RTCSessionDescriptionInit, did: string, connectionId: string) {
    if (this.activeCall && this.activeCall.did !== did) {
      console.warn('Another call is active. Ending it before accepting a new one.');
      this.endCall();
    }

    this.activeCall = { did, connectionId };

    await this.peerConnection.setRemoteDescription(offer);

    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    this.signalingChannel({
      type: 'answer',
      sdp: answer.sdp,
      connectionId,
      to: did || msg.from,
    });
  }

  async handleAnswer(msg, answer: RTCSessionDescriptionInit) {
    await this.peerConnection.setRemoteDescription(answer);
  }

  async handleCandidate(msg, candidate: RTCIceCandidate | object) {
    if (typeof candidate === 'string') {
      candidate = JSON.parse(candidate) as RTCIceCandidate;
    }
    if (typeof candidate === 'object' && !(candidate instanceof RTCIceCandidate)) {
      candidate = new RTCIceCandidate(candidate);
    }
    await this.peerConnection.addIceCandidate(candidate).catch(window.reportError);
  }

  getLocalStream(): MediaStream {
    return this.localStream;
  }

  getRemoteStream(): MediaStream {
    return this.remoteStream;
  }

  getActiveCall(): { did: string; connectionId: string } | null {
    return this.activeCall;
  }

  getPeerConnection(): RTCPeerConnection {
    return this.peerConnection;
  }

  endCall() {
    if (!this.activeCall) {
      console.warn('No active call to end.');
      return;
    }

    // Stop the audio playback and clean up the audio element
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.srcObject = null;
      this.audioElement = null;
    }

    this.peerConnection.close();
    this.localStream.getTracks().forEach((track) => track.stop());
    this.activeCall = null;
  }
}