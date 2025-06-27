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
  
  
  export const captureVideoThumbnail = (videoElement) => {
    console.log(videoElement.readyState)
    return new Promise((resolve, reject) => {
      if(!videoElement && (videoElement.readyState < 2)){
        reject("Video is not ready!!!");
        return;
      }
      
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const ctx = canvas.getContext("2d");
      
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if(blob){
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          } // Resolved Base64 url 
          reader.onerror = () => reject("Failed to Covert blob to Base64");
          reader.readAsDataURL(blob);
        }else{
          reject("Failed to get blob");
        }
      },"image/jpeg", 0.8)
    })
  }