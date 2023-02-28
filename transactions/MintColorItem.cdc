//!For Emulator
//import ColorItems from 0x631e88ae7f1d7c20
import ColorItems from "../contracts/ColorItems.cdc"
transaction {
  let receiverRef: &{ColorItems.NFTReceiver}
  let minterRef: &ColorItems.NFTMinter

  prepare(acct: AuthAccount) {
      self.receiverRef = acct.getCapability<&{ColorItems.NFTReceiver}>(/public/NFTReceiver)
          .borrow()
          ?? panic("Could not borrow receiver reference")        
      
      self.minterRef = acct.borrow<&ColorItems.NFTMinter>(from: /storage/NFTMinter)
          ?? panic("could not borrow minter reference")
  }

  execute {
      let metadata : {String : String} = {
          "color": "#90323d",
          "name": "red violet color wheel",
          "price": "40"
      }
      let newNFT <- self.minterRef.mintNFT()
  
      self.receiverRef.deposit(token: <-newNFT, metadata: metadata)

      log("NFT Minted and deposited to Account 2's Collection")
  }
}