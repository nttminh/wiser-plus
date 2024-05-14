import Darkmode from 'darkmode-js'
import type {PlasmoCSConfig} from "plasmo";
export const config: PlasmoCSConfig = {
    matches: ["https://campus.sa.umasscs.net/psp/csm/EMPLOYEE/*"],
    all_frames: true
}

const darkmode = new Darkmode();

// Select all elements with the class 'darkmode-layer' and 'darkmode-toggle'
const darkmodeElements = document.querySelectorAll('.darkmode-layer, .darkmode-toggle');

// Loop through each element and change the z-index
darkmodeElements.forEach((element) => {
    (element as HTMLElement).style.zIndex = '1003';
});

// on .darkmode-toggle, change the style to make the padding 10px and the cursor a pointer
const darkmodeToggle = document.querySelector('.darkmode-toggle');
if (darkmodeToggle) {
    (darkmodeToggle as HTMLElement).style.padding = '0px';
    (darkmodeToggle as HTMLElement).style.cursor = 'pointer';
}

// Select the element with the 'ui-title' class
const uiTitleElement = document.querySelector('.ui-title');

if (uiTitleElement) {
    // Create the dark mode button
    const darkModeButton = document.createElement('span');
    darkModeButton.innerText = '◐';
    darkModeButton.id = 'dark-mode-button';
    darkModeButton.style.padding = '10px';
    darkModeButton.style.cursor = 'pointer';
    darkModeButton.style.color = 'white';
    darkModeButton.style.fontSize = '2.4rem';

    // Add event listener to toggle dark mode
    darkModeButton.addEventListener('click', () => {
        darkmode.toggle();
    });

    // Insert the button after the uiTitleElement
    uiTitleElement.insertAdjacentElement('afterend', darkModeButton);
}