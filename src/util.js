function getTracks(participant) {
  return Array.from(participant.tracks.values()).filter(function(publication) {
    return publication.track;
  }).map(function(publication) {
    return publication.track;
  });
}

function attachTrack(track, container) {
  container.appendChild(track.attach());
}

function attachTracks(tracks, container) {
  tracks.forEach((track) => {
    attachTrack(track, container);
  });
}

// Detach given track from the DOM
function detachTrack(track) {
  track.detach().forEach(function(element) {
    element.remove();
  });
}

function detachParticipantTracks(participant) {
  const tracks = getTracks(participant);
  tracks.forEach(detachTrack);
}

export {
  getTracks,
  attachTrack,
  attachTracks,
  detachTrack,
  detachParticipantTracks
}
