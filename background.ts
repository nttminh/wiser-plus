import { SecureStorage } from "@plasmohq/storage/secure";

export { };

if (process.env.NODE_ENV === "development") {
  console.log("This is a development build")
}

if (process.env.NODE_ENV === "production") {
  console.log("This is a production build")
}

// console.log("SITE_URL:", process.env.PLASMO_PUBLIC_SITE_URL)

const storage = new SecureStorage({
    copiedKeyList: ["shield-modulation"]
})

// const TEST_KEY = "[Wiser-Plus]"
// const TEST_DATA = "1701"

const InitiateStorage = async () => {  
  // await storage.clear()
  // use password from env
  await storage.setPassword(process.env.PLASMO_PUBLIC_STORAGE_PASSWORD)
  // Must set password then watch, otherwise the namespace key will mismatch
  // storage.watch({
  // [TEST_KEY]: (c) => {
  //     console.log(TEST_KEY, c)
  // }
  // })
  //   await storage.set(TEST_KEY, TEST_DATA)
}
InitiateStorage()