
import ColorItems from "../contracts/ColorItems.cdc"

pub fun main() : {String : String} {
    let nftOwner = getAccount(0xd929bd6c5ce17fe1)
    // log("NFT Owner")   
    let capability = nftOwner.getCapability<&{ColorItems.NFTReceiver}>(/public/NFTReceiver)

    let receiverRef = capability.borrow()
        ?? panic("Could not borrow the receiver reference")

    return receiverRef.getMetadata(id: 1)
}