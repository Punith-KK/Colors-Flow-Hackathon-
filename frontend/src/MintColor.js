import * as fcl from "@onflow/fcl";
import * as sdk from "@onflow/sdk"
import "./MintColor.css"

const MintColor = () => {
  
  const MintColorToken = async () => {
    await sdk
      .build([
        fcl.script`
        import ColorItems from 0xProfile
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

            log("NFT Minted and deposited")
            
            }
        }
      `
      ])
    
    //const decoded = await fcl.decode(encoded)
    //console.log("Return: " + decoded)
  };
  return (
    <div className="mint">
         <button onClick={MintColorToken} className="minter">Mint Token</button>
    </div>
  );
};

export default MintColor;