import { TRACKS } from "./constant";

  export const muteAndUnmuteHandeler = (tracks , enableValue) => {
    tracks.forEach((track) => {
      track.enabled = enableValue;
    })
  }
  
  export const findTracksHandler = (stream , element) => {
    if (stream) {
      let tracks;
      if(element === TRACKS.AUDIO_TRACK) tracks = stream.getAudioTracks();
      else if(element === TRACKS.VIDEO_TRACK) tracks = stream.getVideoTracks();
      return tracks;
    }
  }