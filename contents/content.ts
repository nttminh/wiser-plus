import { sendToBackground } from "@plasmohq/messaging";
import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  // matches: ["https://campus.sa.umasscs.net/psp/csm/EMPLOYEE/*"],
  all_frames: true,
}

function updateInstructorNames(span, metaData) {
  let anchor = document.createElement("a");
  anchor.className = "rate-my-professor-link";
  anchor.target = "_blank";
  if (metaData === null || metaData.avgRating === 0) {
    anchor.textContent = "Rate Professor!";
    anchor.href = "https://www.ratemyprofessors.com/search/professors?q=" + span.innerText.replace(" ", "%20");
  } else {
    anchor.textContent = metaData.avgRating.toString() + "/5";
    anchor.href = "https://www.ratemyprofessors.com/professor/" + metaData.legacyId.toString();
  }

  let space = document.createTextNode(" ");

  span.appendChild(space);
  span.appendChild(anchor);
}

function updateMultipleInstructorNames(span, metaData) {
  // Clear the span
  span.innerHTML = "";

  metaData.forEach((data, index) => {
    // Create a text node for the instructor's name and append it
    let name = document.createTextNode(data.firstName + " " + data.lastName);
    span.appendChild(name);

    // Create a link (anchor) element
    let anchor = document.createElement("a");
    anchor.className = "rate-my-professor-link";
    anchor.target = "_blank";

    // Set text content and href based on whether legacyId is available
    if (data.legacyId === null) {
      anchor.textContent = " ?/5";
      anchor.href = "https://www.ratemyprofessors.com/search/professors?q=" + encodeURIComponent(data.firstName) + "%20" + encodeURIComponent(data.lastName);
    } else {
      anchor.textContent = " " + data.avgRating.toString() + "/5";
      anchor.href = "https://www.ratemyprofessors.com/professor/" + data.legacyId.toString();
    }

    // Append the anchor
    span.appendChild(anchor);

    // If it's not the last item, append a comma and space
    if (index < metaData.length - 1) {
      span.appendChild(document.createTextNode(", "));
    }
  });
}



function updateMultipleInstructorNames(span, metaData) {
  // Clear the span
  span.innerHTML = "";

  metaData.forEach((data, index) => {
    // Create a text node for the instructor's name and append it
    let name = document.createTextNode(data.firstName + " " + data.lastName);
    span.appendChild(name);

    // Create a link (anchor) element
    let anchor = document.createElement("a");
    anchor.className = "rate-my-professor-link";
    anchor.target = "_blank";

    // Set text content and href based on whether legacyId is available
    if (data.legacyId === null) {
      anchor.textContent = " ?/5";
      anchor.href = "https://www.ratemyprofessors.com/search/professors?q=" + encodeURIComponent(data.firstName) + "%20" + encodeURIComponent(data.lastName);
    } else {
      anchor.textContent = " " + data.avgRating.toString() + "/5";
      anchor.href = "https://www.ratemyprofessors.com/professor/" + data.legacyId.toString();
    }

    // Append the anchor
    span.appendChild(anchor);

    // If it's not the last item, append a comma and space
    if (index < metaData.length - 1) {
      span.appendChild(document.createTextNode(", "));
    }
  });
}

function modernViewDOMHandler() {
  const iframe = document.getElementById('ptifrmtgtframe') as HTMLIFrameElement;
  if (iframe) {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    // fix the above line
    iframeDocument.querySelectorAll('span[id^="MTG_INSTR$"]').forEach(async function (span: HTMLSpanElement) {
      // Skip iteration if the instructor name is "To Be Announced"
      if (span.innerText === "To be Announced") {
        return true; // true to bypass the warning
      }
      
      // If the name contains a comma, it's a list of instructors
      if (span.innerText.includes(",")) {
        const instructorNames = span.innerText.split(",\n");
        const multiRes = [];
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
          multiRes.push(res);
        }
        // console.log(multiRes);
        updateMultipleInstructorNames(span, multiRes);
        return multiRes;
      }

      const res = await sendToBackground({
        name: "getTeacher",
        body: {
          teacherName: span.innerText,
          schoolId: "U2Nob29sLTM5ODA="
        },
        extensionId: process.env.PLASMO_PUBLIC_EXTENSION_ID
      })
      updateInstructorNames(span, res);
      return res
    });
  }
}

function classicViewDOMHandler() {
  document.querySelectorAll('span[id^="MTG_INSTR$"]').forEach(async function (span: HTMLSpanElement) {
    if (span.getAttribute('data-processed')) {
      // Skip this span as it has already been processed
      return;
    }
    span.setAttribute('data-processed', 'true'); // Mark as processed
    
    // console.log(span.innerText);
    if (span.innerText === "To be Announced") {
      return true;
    }
    
    if (span.innerText.includes(",")) {
      const instructorNames = span.innerText.split(",\n");
      const multiRes = [];
      for (const instructorName of instructorNames) {
        let res = await sendToBackground({
          name: "getTeacher",
          body: {
            teacherName: instructorName,
            schoolId: "U2Nob29sLTM5ODA="
          },
          extensionId: process.env.PLASMO_PUBLIC_EXTENSION_ID
        });
        if (res === null) {
          res = {
            avgRating: null,
            legacyId: null,
            firstName: instructorName.split(" ")[0],
            lastName: instructorName.split(" ")[1]
          };
        }
        multiRes.push(res);
      }
      // console.log(multiRes);
      updateMultipleInstructorNames(span, multiRes);
      return multiRes;
    }

    const res = await sendToBackground({
      name: "getTeacher",
      body: {
        teacherName: span.innerText,
        schoolId: "U2Nob29sLTM5ODA="
      },
      extensionId: process.env.PLASMO_PUBLIC_EXTENSION_ID
    });
    updateInstructorNames(span, res);
    return res;
  });
}

const observer = new MutationObserver((mutations, observer) => {
  for (const mutation of mutations) {
    if (mutation.type === 'attributes') {
      const targetElement = mutation.target as HTMLElement;

      if (mutation.attributeName === 'data-gh-page' && targetElement.getAttribute('data-gh-page') === "SSR_CLSRCH_RSLT") {
        modernViewDOMHandler();
        continue; 
      }

      if (document.head.querySelector('title').innerText === "Class Search") {
        classicViewDOMHandler();
        // console.log("Title detected");
        continue; 
      }
    }
  }
});

observer.observe(document.body, { attributes: true });