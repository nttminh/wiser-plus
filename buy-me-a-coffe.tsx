import React, { useEffect, useState } from "react"
import CoffeImg from "data-base64:~assets/buy-me-a-coffee-logo-F1878A1EB2-seeklogo.com.png"

export const BuyMeACoffee = () => {
  return (
    // <a href="https://www.buymeacoffee.com/wiserplus">
    //   <img src={CoffeImg} style={{ width: "17px" }} />
    // </a>
    <a href="https://www.buymeacoffee.com/wiserplus" target="_blank">
      <img src="https://img.buymeacoffee.com/button-api/?text=coffee&emoji=&slug=wiserplus&button_colour=5F7FFF&font_colour=ffffff&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00" 
     style={{ width: "120px" }}/>
    </a>
  );
}

export default BuyMeACoffee
