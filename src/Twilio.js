import React, { Component } from 'react';
import Video from 'twilio-video';

import { getTracks,
  attachTrack,
  attachTracks,
  detachTrack,
  detachParticipantTracks
} from './util';


const ROOM_NAME = 'Where is Jessica Hyde?';

const styles = {
  videoContainer: {
    display: 'flex',
  }
}

class Twilio extends Component {
  state = { identity: undefined, token: undefined };

  constructor(props) {
    super(props);

    this.video = React.createRef();
    this.remoteVideo = React.createRef();

    this.joinRoom = this.joinRoom.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);

    this.participantConnected = this.participantConnected.bind(this);

    this.handleRoomDisconnect = this.handleRoomDisconnect.bind(this);
    this.handleParticipantConnected = this.handleParticipantConnected.bind(this);
    this.handleParticipantTrackPublished = this.handleParticipantTrackPublished.bind(this);
  }

  async componentDidMount() {
    try {
      const { identity, token } = await fetch('/api/token').then(res => res.json());
      this.setState({ identity, token });
    } catch (e) {
      console.error(e)
    }
  }

  componentWillUnmount() {
    if (this.room) {
      this.room.disconnect();
    }
  }

  render() {
    return (
      <>
        <h3>{ROOM_NAME}</h3>
        <div style={styles.videoContainer}>
          <div ref={this.video} />
          <div ref={this.remoteVideo} />
        </div>

        <br />
        <button onClick={this.joinRoom}>Join</button>
        <button onClick={this.leaveRoom}>Leave</button>
      </>
    )
  }

  leaveRoom() {
    alert('ha, you wish!');
    alert('jk!');
    this.room.disconnect();
  }

  handleParticipantConnected(participant) {
    this.participantConnected(participant, this.remoteVideo.current);
  }

  handleRoomDisconnect() {
    detachParticipantTracks(this.room.localParticipant);
    this.room.participants.forEach(detachParticipantTracks);
    this.room = null;
  }

  handleParticipantTrackPublished(container) { 
    return function (publication) {
      this.trackPublished(publication, container);
    }
  }

  participantConnected(participant, container) {
    participant.tracks.forEach((publication) => {
      this.trackPublished(publication, container);
    });

    participant.on('trackPublished', this.handleParticipantTrackPublished(container));

  }

  trackPublished(publication, container) {
    if (publication.isSubscribed) {
      attachTrack(publication.track, container);
    }

    publication.on('subscribed', (track) => {
      attachTrack(track, container);
    });

    publication.on('unsubscribed', detachTrack);
  }

  async joinRoom() {
    const { token } = this.state;

    try {
      const room = await Video.connect(token, { name: ROOM_NAME });
      this.room = room;

      attachTracks(getTracks(room.localParticipant), this.video.current)

      room.participants.forEach(this.handleParticipantConnected);

      room.on('participantConnected', this.handleParticipantConnected);
      room.on('disconnected', this.handleRoomDisconnect);

    } catch (err) {
      console.error(err);
    }
  }
}

export default Twilio;
