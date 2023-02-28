pub contract Profile {
  pub let publicPath: PublicPath
  pub let privatePath: StoragePath

  pub resource interface Public {
    pub fun getName(): String
    pub fun getAvatar(): String
    pub fun getColor(): String
    pub fun getInfo(): String
    pub fun getVerified(): Bool
    pub fun asReadOnly(): Profile.ReadOnly
    
    access(contract) fun internal_setVerifiedStatus(_ val: Bool)
  }
  
  pub resource interface Owner {
    pub fun getName(): String
    pub fun getAvatar(): String
    pub fun getColor(): String
    pub fun getInfo(): String
    pub fun getVerified(): Bool
    
    pub fun setName(_ name: String) {
      pre {
        !self.getVerified():
          "Verified Profiles can't change their name."
        name.length <= 15:
          "Names must be under 15 characters long."
      }
    }
    pub fun setAvatar(_ src: String)
    pub fun setColor(_ color: String)
    pub fun setInfo(_ info: String) {
      pre {
        info.length <= 280:
          "Profile Info can at max be 280 characters long."
      }
    }
    
    pub fun grantVerifiedStatus(_ address: Address) {
      pre {
        self.getVerified():
          "Only Verified Profiles can Verify another Profile."
      }
    }
    
    pub fun revokeVerifiedStatus(_ address: Address) {
      pre {
        self.getVerified():
          "Only Verified Profiles can revoke a Verification from another Profile."
      }
    }
  }
  
  pub resource Base: Owner, Public {
    access(self) var name: String
    access(self) var avatar: String
    access(self) var color: String
    access(self) var info: String
    access(self) var verified: Bool
    
    init() {
      self.name = "Anon"
      self.avatar = ""
      self.color = "#232323"
      self.info = ""
      self.verified = false
    }
    
    pub fun getName(): String { return self.name }
    pub fun getAvatar(): String { return self.avatar }
    pub fun getColor(): String {return self.color }
    pub fun getInfo(): String { return self.info }
    pub fun getVerified(): Bool { return self.verified }
    
    pub fun setName(_ name: String) { self.name = name }
    pub fun setAvatar(_ src: String) { self.avatar = src }
    pub fun setColor(_ color: String) { self.color = color }
    pub fun setInfo(_ info: String) { self.info = info }
    
    access(contract) fun internal_setVerifiedStatus(_ val: Bool) { self.verified = val }
  
    pub fun grantVerifiedStatus(_ address: Address) {
      Profile.fetch(address).internal_setVerifiedStatus(true)
    }
    
    pub fun revokeVerifiedStatus(_ address: Address) {
      Profile.fetch(address).internal_setVerifiedStatus(false)
    }
    
    pub fun asReadOnly(): Profile.ReadOnly {
      return Profile.ReadOnly(
        address: self.owner?.address,
        name: self.getName(),
        avatar: self.getAvatar(),
        color: self.getColor(),
        info: self.getInfo(),
        verified: self.getVerified()
      )
    }
  }

  pub struct ReadOnly {
    pub let address: Address?
    pub let name: String
    pub let avatar: String
    pub let color: String
    pub let info: String
    pub let verified: Bool
    
    init(address: Address?, name: String, avatar: String, color: String, info: String, verified: Bool) {
      self.address = address
      self.name = name
      self.avatar = avatar
      self.color = color
      self.info = info
      self.verified = verified
    }
  }
  
  pub fun new(): @Profile.Base {
    return <- create Base()
  }
  
  pub fun check(_ address: Address): Bool {
    return getAccount(address)
      .getCapability<&{Profile.Public}>(Profile.publicPath)
      .check()
  }
  
  pub fun fetch(_ address: Address): &{Profile.Public} {
    return getAccount(address)
      .getCapability<&{Profile.Public}>(Profile.publicPath)
      .borrow()!
  }
  
  pub fun read(_ address: Address): Profile.ReadOnly? {
    if let profile = getAccount(address).getCapability<&{Profile.Public}>(Profile.publicPath).borrow() {
      return profile.asReadOnly()
    } else {
      return nil
    }
  }
  
  pub fun readMultiple(_ addresses: [Address]): {Address: Profile.ReadOnly} {
    let profiles: {Address: Profile.ReadOnly} = {}
    for address in addresses {
      let profile = Profile.read(address)
      if profile != nil {
        profiles[address] = profile!
      }
    }
    return profiles
  }

    
  init() {
    self.publicPath = /public/profile
    self.privatePath = /storage/profile
    
    self.account.save(<- self.new(), to: self.privatePath)
    self.account.link<&Base{Public}>(self.publicPath, target: self.privatePath)
    
    self.account
      .borrow<&Base{Owner}>(from: self.privatePath)!
      .setName("qvvg")

    self.account
      .getCapability<&{Profile.Public}>(Profile.publicPath)
      .borrow()!
      .internal_setVerifiedStatus(true)
  }
}