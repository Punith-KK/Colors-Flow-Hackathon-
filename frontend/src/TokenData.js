import React, { useState } from "react";
import * as fcl from "@onflow/fcl";
import "./TokenData.css"
const TokenData = () => {
  const [nftInfo, setNftInfo] = useState(null)
  const fetchTokenData = async () => {
    
    const encoded = await fcl
      .send([
        fcl.script`
        import ColorItems from "../../contracts/ColorItems.cdc"

        pub fun main() : {String : String} {
            let nftOwner = getAccount(0xd929bd6c5ce17fe1)
            // log("NFT Owner")   
            let capability = nftOwner.getCapability<&{ColorItems.NFTReceiver}>(/public/NFTReceiver)

            let receiverRef = capability.borrow()
                ?? panic("Could not borrow the receiver reference")

            return receiverRef.getMetadata(id: 1)
        }
      `
      ])
    
    const decoded = await fcl.decode(encoded)
    setNftInfo(decoded)
  };

  return (
    <div className="token-data">
      <div className="center">
        <button className="btn-primary" onClick={fetchTokenData}>Fetch Token Data</button>        
      </div>
      {
        nftInfo &&
        <div>
        <div className = "colorToken" style={{backgroundColor: nftInfo.color}}></div>
        <h1>Color: {nftInfo.name}</h1>
        <h1>{nftInfo.price} Tokens</h1>
          <button onClick={() => setNftInfo(null)} className="btn-secondary">Clear</button>
        </div>
      }
    </div>
  );
};

export default TokenData;