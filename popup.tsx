import testDataURL from "raw-env:./test.json"
import { useEffect, useState } from "react"

function IndexPopup() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(testDataURL)
      .then((res) => res.json())
      .then((data) => setData(data))
  })

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 300,
        padding: 16
      }}>
      <h1>Wiser Plus</h1>
      <p>This extension only supports UMass Boston as of now. I'm working on it to make it possible for other schools (as long as they use Wiser).</p>
      <span>Made by <a target="_blank" href="https://www.minh.boston/">Minh Nguyen</a> with ❤️
      </span>
    </div>
  )
}

export default IndexPopup
