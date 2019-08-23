import React, { Component } from 'react';
import Video from 'twilio-video';

import { getTracks,
  attachTrack,
  attachTracks,
  detachTrack,
  detachParticipantTracks
} from './util';

import styles from './Twilio.module.css';

const ROOM_NAME = 'Where is Jessica Hyde?';

class Twilio extends Component {
  state = { identity: undefined, token: undefined, room: null };

  constructor(props) {
    super(props);

    this.dom = React.createRef();
    this.sub = React.createRef();

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
    const { room } = this.state;
    if (room) {
      room.disconnect();
    }
  }

  render() {
    const { room } = this.state;

    return (
      room === null ? (
        <>
          <h3>{ROOM_NAME}</h3>
          <br />
          <button onClick={this.joinRoom}>Join</button>
        </>
      ): (
        <div className={styles.videoContainer}>
          <div
            className={styles.dom}
            ref={this.dom}
          />
          <div className={styles.subContainer}>
            <div
              className={styles.sub}
              ref={this.sub}
            />
          </div>
          <button
            className={styles.leaveBtn}
            onClick={this.leaveRoom}
          >
            Leave
          </button>
        </div>
      )
    )
  }

  leaveRoom() {
    alert('ha, you wish!');
    alert('jk!');
    const { room } = this.state
    room.disconnect();
  }

  handleParticipantConnected(participant) {
    this.participantConnected(participant, this.sub.current);
  }

  handleRoomDisconnect() {
    const { room } = this.state
    detachParticipantTracks(room.localParticipant);
    room.participants.forEach(detachParticipantTracks);

    this.setState({ room: null });
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
      const room = await Video.connect(
        token, 
        { name: ROOM_NAME, dominantSpeaker: true }
      );

      this.setState({ room }, () => {
        attachTracks(getTracks(room.localParticipant), this.dom.current)

        room.participants.forEach(this.handleParticipantConnected);
        room.on('participantConnected', this.handleParticipantConnected);
        room.on('disconnected', this.handleRoomDisconnect);
      })


    } catch (err) {
      console.error(err);
    }
  }
}

export default Twilio;
