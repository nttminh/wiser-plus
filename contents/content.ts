import type { PlasmoCSConfig } from "plasmo";
import { sendToBackground } from "@plasmohq/messaging";

export const config: PlasmoCSConfig = {
  matches: ["https://campus.sa.umasscs.net/psp/csm/EMPLOYEE/*"],
  all_frames: true
}
interface IInstructorInfo {
  avgDifficulty: number;
  avgRating: number;
  department: string;
  firstName: string;
  id: string;
  lastName: string;
  legacyId: number;
  numRatings: number;
  school: {
    city: string;
    id: string;
    name: string;
    state: string;
  };
  wouldTakeAgainPercent: number;
}

function getInstructorsSpans(): HTMLSpanElement[] {
  const iframe = document.getElementById("ptifrmtgtframe") as HTMLIFrameElement;
  if (!iframe) {
    console.error("No iframe found");
    return
  }  // Exit if no iframe found

  const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDocument) {
    console.error("No document found in iframe");
    return
  }  // Exit if no document found in iframe

  const spans = iframeDocument.querySelectorAll<HTMLSpanElement>('span[id^="MTG_INSTR$"]');

  return Array.from(spans);
}

function updateAndAddRatings(instructors: IInstructorInfo[]): void {
  console.log("Update and add ratings")
  const spans = getInstructorsSpans();

  spans.forEach(span => {
    // Skip iteration if the instructor name is "To Be Announced"
    if (span.innerText === "To be Announced") return;

    const originalText = span.innerText;  // Store original text before clearing
    span.innerHTML = "";  // Clear the span to prepare for new content

    // Split names by comma, and process each name
    const professorNames = originalText.split(',');
    professorNames.forEach((name, index) => {
      const trimmedName = name.trim();
      const foundInstructor = instructors.find(instructor =>
        trimmedName.includes(instructor.firstName) || trimmedName.includes(instructor.lastName)
      );

      if (foundInstructor) {
        // Append the instructor's full name
        if (index > 0) span.appendChild(document.createTextNode(", "));  // Add comma before names except the first
        const fullName = document.createTextNode(`${foundInstructor.firstName} ${foundInstructor.lastName}`);
        span.appendChild(fullName);

        // Create and append the rating link
        const ratingLink = document.createElement("a");
        ratingLink.className = "rate-my-professor-link";
        ratingLink.target = "_blank";
        ratingLink.textContent = ` ${foundInstructor.avgRating || "?"}/5`;
        ratingLink.href = `https://www.ratemyprofessors.com/professor/${foundInstructor.legacyId}`;
        span.appendChild(ratingLink);
      }
    });
  });
}

// function updateAndAddRatings(span, metaData) {
//   // Clear the span
//   span.innerHTML = ""

//   metaData.forEach((data, index) => {
//     // Create a text node for the instructor's name and append it
//     const name = document.createTextNode(
//       data.firstName + (data.lastName ? " " + data.lastName : "")
//     )
//     span.appendChild(name)

//     // Create a link (anchor) element
//     const anchor = document.createElement("a")
//     anchor.className = "rate-my-professor-link"
//     anchor.target = "_blank"

//     // Set text content and href based on whether legacyId is available
//     if (data.legacyId === null || data.avgRating === 0) {
//       anchor.textContent = " Rate Professor!"
//       anchor.href =
//         "https://www.ratemyprofessors.com/search/professors?q=" +
//         encodeURIComponent(data.firstName) +
//         "%20" +
//         encodeURIComponent(data.lastName)
//     } else {
//       anchor.textContent = " " + data.avgRating.toString() + "/5"
//       anchor.href =
//         "https://www.ratemyprofessors.com/professor/" + data.legacyId.toString()
//     }

//     // Append the anchor
//     span.appendChild(anchor)

//     // If it's not the last item, append a comma and space
//     if (index < metaData.length - 1) {
//       span.appendChild(document.createTextNode(", "))
//     }
//   })
// }

// function modernViewDOMHandler() {
//   const iframe = document.getElementById("ptifrmtgtframe") as HTMLIFrameElement
//   if (iframe) {
//     const iframeDocument =
//       iframe.contentDocument || iframe.contentWindow.document
//     // fix the above line
//     iframeDocument
//       .querySelectorAll('span[id^="MTG_INSTR$"]')
//       .forEach(async function (span: HTMLSpanElement) {
//         // Skip iteration if the instructor name is "To Be Announced"
//         if (span.innerText === "To be Announced") {
//           return true // true to bypass the warning
//         }

//         // Create an array to store the results for instructors
//         const multiRes = []

//         // If the name contains a comma, it's a list of instructors
//         if (span.innerText.includes(",")) {
//           const instructorNames = span.innerText.split(",\n")
//           for (const instructorName of instructorNames) {
//             let res = await sendToBackground({
//               name: "getTeacher",
//               body: {
//                 teacherName: instructorName,
//                 schoolId: "U2Nob29sLTM5ODA="
//               },
//               extensionId: process.env.PLASMO_PUBLIC_EXTENSION_ID
//             })

//             // if null is returned, manually create a instructor object
//             if (res === null) {
//               res = {
//                 avgRating: null,
//                 legacyId: null,
//                 firstName: instructorName.split(" ")[0],
//                 lastName: instructorName.split(" ")[1]
//               }
//             }
//             // save the results for each instructor
//             multiRes.push(res)
//           }
//           // console.log(multiRes);
//           updateAndAddRatings(span, multiRes)
//           return multiRes
//         }

//         // For a single professor
//         let res = await sendToBackground({
//           name: "getTeacher",
//           body: {
//             teacherName: span.innerText,
//             schoolId: "U2Nob29sLTM5ODA="
//           },
//           extensionId: process.env.PLASMO_PUBLIC_EXTENSION_ID
//         })
//         if (res === null) {
//           res = {
//             avgRating: null,
//             legacyId: null,
//             firstName: span.innerText,
//             lastName: null
//           }
//         }
//         multiRes.push(res)
//         updateAndAddRatings(span, multiRes)
//         return multiRes
//       })
//   }
// }

function modernViewDOMHandler() {
  const instructorElements = getInstructorsSpans();
  const instructors = new Set<string>();

  // Collect unique instructors
  instructorElements.forEach(span => {
    if (span.innerText === "To be Announced") return;
    if (span.innerText.includes(",")) {
      span.innerText.split(",\n").forEach(name => instructors.add(name.trim()));
    } else {
      instructors.add(span.innerText.trim());
    }
  });

  const fetchPromises = Array.from(instructors).map(async instructorName => {
    return await sendToBackground({
      name: "getTeacher",
      body: {
        teacherName: instructorName,
        schoolId: "U2Nob29sLTM5ODA="
      },
      extensionId: process.env.PLASMO_PUBLIC_EXTENSION_ID
    });
  });

  Promise.all(fetchPromises).then(results => {
    console.log(results);
    updateAndAddRatings(results);
  });
}


function classicViewDOMHandler() {
  const instructorElements = document.querySelectorAll<HTMLSpanElement>('span[id^="MTG_INSTR$"]');
  const instructors = new Set<string>();

  // Collect unique instructors
  instructorElements.forEach(span => {
    if (span.getAttribute("data-processed")) {
      // Skip this span as it has already been processed
      return;
    }
    span.setAttribute("data-processed", "true"); // Mark as processed

    // Skip iteration if the instructor name is "To be Announced"
    if (span.innerText === "To be Announced") return;

    if (span.innerText.includes(",")) {
      span.innerText.split(",\n").forEach(name => instructors.add(name.trim()));
    } else {
      instructors.add(span.innerText.trim());
    }
  });

  const fetchPromises = Array.from(instructors).map(async instructorName => {
    return await sendToBackground({
      name: "getTeacher",
      body: {
        teacherName: instructorName,
        schoolId: "U2Nob29sLTM5ODA="
      },
      extensionId: process.env.PLASMO_PUBLIC_EXTENSION_ID
    });
  });

  Promise.all(fetchPromises).then(results => {
    console.log(results);
    updateAndAddRatings(results);
  });
}

const observer = new MutationObserver((mutations) => {
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
      }
    }
  }
})

observer.observe(document.body, { attributes: true })
