class peerService{
    constructor(){
        if(!this.peer){
            this.peer = new RTCPeerConnection({
                // find public address
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

    async disconnect() {
        if (this.peer) {
            this.peer.close(); // This closes the connection to the ICE server
            this.peer = null; // Optionally reset the peer connection
        }
    }
    async getOffer(){
        if(this.peer){
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }

    async setRemoteDesc(ans) {
        if(this.peer){
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
    }

    async getAnswer(offer){
        if(this.peer){
            await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans;
        }
    }

}

const peerObject = new peerService();
export default peerObject