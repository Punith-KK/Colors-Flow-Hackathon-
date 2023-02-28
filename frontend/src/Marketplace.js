import React, { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types"
import "./Marketplace.css"
const TokenData = () => {
  const [tokensToSell, setTokensToSell] = useState([])
  useEffect(() => {
    checkMarketplace();
  }, []);

  const checkMarketplace = async () => {
    try {
      const encoded = await fcl.send([
        fcl.script`
        import MarketplaceContract from 0xd929bd6c5ce17fe1
        pub fun main(): [UInt64] {
            let account1 = getAccount(0xd929bd6c5ce17fe1)
        
            let acct1saleRef = account1.getCapability<&AnyResource{MarketplaceContract.SalePublic}>(/public/NFTSale)
                .borrow()
                ?? panic("Could not borrow acct2 nft sale reference")
        
            return acct1saleRef.getIDs()
        }
        `,
      ]);
      const decoded = await fcl.decode(encoded);
      let marketplaceMetadata = [];
      for (const id of decoded) {
        const encodedMetadata = await fcl.send([
          fcl.script`
            import ColorItems from 0xd929bd6c5ce17fe1
            pub fun main(id: Int) : {String : String} {
              let nftOwner = getAccount(0xd929bd6c5ce17fe1)  
              let capability = nftOwner.getCapability<&{ColorItems.NFTReceiver}>(/public/NFTReceiver)
          
              let receiverRef = capability.borrow()
                  ?? panic("Could not borrow the receiver reference")
          
              return receiverRef.getMetadata(id: 1)
            }
          `,
          fcl.args([
            fcl.arg(id, t.Int)    
          ]),
        ]);

        const decodedMetadata = await fcl.decode(encodedMetadata);
        const encodedPrice = await fcl.send([
          fcl.script`
            import MarketplaceContract from 0xd929bd6c5ce17fe1
            pub fun main(id: UInt64): UFix64? {
                let account1 = getAccount(0xd929bd6c5ce17fe1)
            
                let acct1saleRef = account1.getCapability<&AnyResource{MarketplaceContract.SalePublic}>(/public/NFTSale)
                    .borrow()
                    ?? panic("Could not borrow acct nft sale reference")
            
                return acct1saleRef.idPrice(tokenID: id)
            }
          `, 
          fcl.args([
            fcl.arg(id, t.UInt64)
          ])
        ])
        const decodedPrice = await fcl.decode(encodedPrice)
        decodedMetadata["price"] = decodedPrice;
        marketplaceMetadata.push(decodedMetadata);
      }
      setTokensToSell(marketplaceMetadata);
    } catch (error) {
      console.log("NO NFTs FOR SALE");
      console.log("ERROR: " + error)
    }
  };

  const buyToken = async (tokenId) => {
    const txId = await fcl
    .send([
      fcl.proposer(fcl.authz),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(50),
      fcl.args([
        fcl.arg(tokenId, t.UInt64)
      ]),
      fcl.transaction`
        import ColorItems from 0xd929bd6c5ce17fe1
        import NonfungibleToken from 0xd929bd6c5ce17fe1
        import MarketplaceContract from 0xd929bd6c5ce17fe1
        
        transaction {
            let collectionRef: &AnyResource{ColorItems.NFTReceiver}
            let temporaryVault: @NonfungibleToken.Vault
        
            prepare(acct: AuthAccount) {
                self.collectionRef = acct.borrow<&AnyResource{ColorItems.NFTReceiver}>(from: /storage/NFTCollection)!
                let vaultRef = acct.borrow<&NonfungibleToken.Vault>(from: /storage/MainVault)
                    ?? panic("Could not borrow owner's vault reference")
        
                self.temporaryVault <- vaultRef.withdraw(amount: 10.0)
            }
        
            execute {
                let seller = getAccount(0xd929bd6c5ce17fe1)
                let saleRef = seller.getCapability<&AnyResource{MarketplaceContract.SalePublic}>(/public/NFTSale)
                    .borrow()
                    ?? panic("Could not borrow seller's sale reference")
        
                saleRef.purchase(tokenID: tokenId, recipient: self.collectionRef, buyTokens: <-self.temporaryVault)
            }
        }
      `,      
    ])
    const decoded = await fcl.decode(txId);
    console.log(decoded);
    console.log(fcl.tx(txId).onceSealed());
    checkMarketplace();
  }
  return (
    <div className="token-data">
      <h1>NFT Markeplace</h1>
      {
        
        tokensToSell.map(token => {
          return (
            <div key={token.uri} className="listing">
              <div>
                <h3>{token.name}</h3>
                <h4>Stats</h4>
                <p>Color Code: {token.color}</p>
                <h4>Price</h4>
                <p>{token.price} Pinnies</p>
                <button className="btn-primary">Buy Now</button>
              </div>
            </div>
          )
        })
      }
    </div>
  );
};

export default TokenData;