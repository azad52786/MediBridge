class Peer {
    constructor(){
        if(!this.peer){
            this.peer = new RTCPeerConnection({
                iceServers : [
                    {
                        urls : [
                            'stun:stun.l.google.com:19302' , 
                            'stun:global.stun.twilio.com:3478'
                        ]
                    }
                ]
            })
        }
    }
    
    async disconnectPeer(){
        if(this.peer){
            this.peer.close();
            this.peer = null; // Reset the peer connection
        }
    }
    
    async getOffer(){
        if(this.peer){
            const offer = await this.peer.createOffer();
            // await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            await this.peer.setLocalDescription(offer);
            return offer;
        }
    }
    
    async getAnswer (offer){
        if(this.peer){
            const answer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(answer);
            await this.peer.setRemoteDescription(offer);
            return answer;
        }
    }
    
    async setRemoteDesc(answer){
        if(this.peer){
            await this.peer.setRemoteDescription(answer);
        }
    }
}

const peer = new Peer();
export default peer.peer;