import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

export const config: PlasmoCSConfig = {
  matches: ["https://campus.sa.umasscs.net/psp/csm/EMPLOYEE/*"],
  all_frames: true
}

function updateAndAddRatings(span, metaData) {
  // Clear the span
  span.innerHTML = ""

  metaData.forEach((data, index) => {
    // Create a text node for the instructor's name and append it
    const name = document.createTextNode(
      data.firstName + (data.lastName ? " " + data.lastName : "")
    )
    span.appendChild(name)

    // Create a link (anchor) element
    const anchor = document.createElement("a")
    anchor.className = "rate-my-professor-link"
    anchor.target = "_blank"

    // Set text content and href based on whether legacyId is available
    if (data.legacyId === null || data.avgRating === 0) {
      anchor.textContent = " Rate Professor!"
      anchor.href =
        "https://www.ratemyprofessors.com/search/professors?q=" +
        encodeURIComponent(data.firstName) +
        "%20" +
        encodeURIComponent(data.lastName)
    } else {
      anchor.textContent = " " + data.avgRating.toString() + "/5"
      anchor.href =
        "https://www.ratemyprofessors.com/professor/" + data.legacyId.toString()
    }

    // Append the anchor
    span.appendChild(anchor)

    // If it's not the last item, append a comma and space
    if (index < metaData.length - 1) {
      span.appendChild(document.createTextNode(", "))
    }
  })
}

function modernViewDOMHandler() {
  const iframe = document.getElementById("ptifrmtgtframe") as HTMLIFrameElement
  if (iframe) {
    const iframeDocument =
      iframe.contentDocument || iframe.contentWindow.document
    // fix the above line
    iframeDocument
      .querySelectorAll('span[id^="MTG_INSTR$"]')
      .forEach(async function (span: HTMLSpanElement) {
        // Skip iteration if the instructor name is "To Be Announced"
        if (span.innerText === "To be Announced") {
          return true // true to bypass the warning
        }

        // Create an array to store the results for instructors
        const multiRes = []

        // If the name contains a comma, it's a list of instructors
        if (span.innerText.includes(",")) {
          const instructorNames = span.innerText.split(",\n")
          for (const instructorName of instructorNames) {
            let res = await sendToBackground({
              name: "getTeacher",
              body: {
                teacherName: instructorName,
                schoolId: "U2Nob29sLTM5ODA="
              },
              extensionId: process.env.PLASMO_PUBLIC_EXTENSION_ID
            })

            // if null is returned, manually create a instructor object
            if (res === null) {
              res = {
                avgRating: null,
                legacyId: null,
                firstName: instructorName.split(" ")[0],
                lastName: instructorName.split(" ")[1]
              }
            }
            // save the results for each instructor
            multiRes.push(res)
          }
          // console.log(multiRes);
          updateAndAddRatings(span, multiRes)
          return multiRes
        }

        // For a single professor
        let res = await sendToBackground({
          name: "getTeacher",
          body: {
            teacherName: span.innerText,
            schoolId: "U2Nob29sLTM5ODA="
          },
          extensionId: process.env.PLASMO_PUBLIC_EXTENSION_ID
        })
        if (res === null) {
          res = {
            avgRating: null,
            legacyId: null,
            firstName: span.innerText,
            lastName: null
          }
        }
        multiRes.push(res)
        updateAndAddRatings(span, multiRes)
        return multiRes
      })
  }
}

function classicViewDOMHandler() {
  document.querySelectorAll('span[id^="MTG_INSTR$"]').forEach(async function (
    span: HTMLSpanElement
  ) {
    if (span.getAttribute("data-processed")) {
      // Skip this span as it has already been processed
      return
    }
    span.setAttribute("data-processed", "true") // Mark as processed

    // Skip iteration if the instructor name is "To Be Announced"
    if (span.innerText === "To be Announced") {
      return true // true to bypass the warning
    }

    // Create an array to store the results for instructors
    const multiRes = []

    // If the name contains a comma, it's a list of instructors
    if (span.innerText.includes(",")) {
      const instructorNames = span.innerText.split(",\n")
      for (const instructorName of instructorNames) {
        let res = await sendToBackground({
          name: "getTeacher",
          body: {
            teacherName: instructorName,
            schoolId: "U2Nob29sLTM5ODA="
          },
          extensionId: process.env.PLASMO_PUBLIC_EXTENSION_ID
        })

        // if null is returned, manually create a instructor object
        if (res === null) {
          res = {
            avgRating: null,
            legacyId: null,
            firstName: instructorName.split(" ")[0],
            lastName: instructorName.split(" ")[1]
          }
        }
        // save the results for each instructor
        multiRes.push(res)
      }
      // console.log(multiRes);
      updateAndAddRatings(span, multiRes)
      return multiRes
    }

    // For a single professor
    let res = await sendToBackground({
      name: "getTeacher",
      body: {
        teacherName: span.innerText,
        schoolId: "U2Nob29sLTM5ODA="
      },
      extensionId: process.env.PLASMO_PUBLIC_EXTENSION_ID
    })
    if (res === null) {
      res = {
        avgRating: null,
        legacyId: null,
        firstName: span.innerText,
        lastName: null
      }
    }

    multiRes.push(res)
    updateAndAddRatings(span, multiRes)
    return multiRes
  })
}

const observer = new MutationObserver((mutations, observer) => {
  for (const mutation of mutations) {
    if (mutation.type === "attributes") {
      const targetElement = mutation.target as HTMLElement

      if (
        mutation.attributeName === "data-gh-page" &&
        targetElement.getAttribute("data-gh-page") === "SSR_CLSRCH_RSLT"
      ) {
        modernViewDOMHandler()
        continue
      }

      if (document.head.querySelector("title").innerText === "Class Search") {
        classicViewDOMHandler()
        // console.log("Title detected");
        continue
      }
    }
  }
})

observer.observe(document.body, { attributes: true })
