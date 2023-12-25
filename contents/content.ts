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
  if (metaData === null) {
    anchor.textContent = "?/5";
    anchor.href = "https://www.ratemyprofessors.com/search/professors?q=" + span.innerText.replace(" ", "%20");
  } else {
    anchor.textContent = metaData.avgRating.toString() + "/5";
    anchor.href = "https://www.ratemyprofessors.com/professor/" + metaData.legacyId.toString();
  }

    let space = document.createTextNode(" ");

    span.appendChild(space);
    span.appendChild(anchor);
}

function handleDOM() {
    const iframe  = document.getElementById('ptifrmtgtframe') as HTMLIFrameElement;
    if (iframe) {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      // fix the above line

            iframeDocument.querySelectorAll('span[id^="MTG_INSTR$"]').forEach(async function (span: HTMLSpanElement) {
                // Skip iteration if the instructor name is "To Be Announced"
                if (span.innerText === "To be Announced") {
                    return true; // true to bypass the warning
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

const observer = new MutationObserver((mutations, observer) => {
  for (const mutation of mutations) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'data-gh-page') {
      // handleDOM();
        const bodyElement = mutation.target as HTMLBodyElement;
      if (bodyElement.getAttribute('data-gh-page') === "SSR_CLSRCH_RSLT") {
          handleDOM();
        }
      }
  }
});

observer.observe(document.body, { attributes: true });