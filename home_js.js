var resume_button = document.getElementById('Resume_button'); //get relevant variables
var cover_letter_button = document.getElementById("Cover_Letter_button");
var resume = document.getElementById("Resume");
var cover_letter = document.getElementById("Cover_Letter");
var style_element = document.querySelector("style");
var phone_button = document.querySelector("button:nth-child(3)");
var tooltip = document.querySelector(".tooltipcustom .tooltiptextcustom");
resume_button.style.backgroundColor = "#0f469a"; //initialize the resume button. It is clicked initially.
resume.style.opacity = 1; //initialize the page
cover_letter.style.opacity = 0; //initalize the page

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
    /*
    Uses the modern clipboard api if possible, then falls back to the deprecated execCommand("copy") if needed
    Discussion here: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    */
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

//copy number to clipboard and change tooltip when user clicks button
phone_button.addEventListener('click', function (e) {
    tooltip.innerHTML = "Copied!";
    copyTextToClipboard("+1 (916) 572-9078");
});

//reset tooltip
phone_button.addEventListener('mouseleave', function(e) {
    if (tooltip.innerHTML == "Copied!") {
    tooltip.innerHTML = "Copy phone number";
    }
});

//switch the cover letter and resume
function switch_view(appear, disappear) {
    if (appear.style.opacity == 0 && disappear.style.opacity == 1) {
        appear.style.opacity = "1";
        disappear.style.opacity = "0";
        setTimeout(function () {
            appear.style.zIndex = 1;
            disappear.style.zIndex = -1;
        }, 500);
    } else { //if something is messed up, just reset it
        appear.style.opacity = "1";
        disappear.style.opacity = "0";
    }
}

function toggle_buttons(clicked, unclicked, e) {
    clicked.disabled = true; //disable buttons so weird stuff doesn't happen if user clicks quick
    unclicked.disabled = true;
    var location = clicked.getBoundingClientRect(); //get location of button on page
    //make background grow from user click
    style_element.innerHTML = "#" + clicked.id + "::before {transform-origin: " + ((e.clientX-location.x)/location.width*100).toString() + "% " + ((e.clientY-location.y)/location.height*100).toString() + "% !important;}";
    clicked.classList.add("clicked"); //start background animations
    unclicked.classList.remove("clicked");
    setTimeout(function () {
        unclicked.style.backgroundColor = "#c8e3f3"; //reset background color. Wait so it looks better
    }, 150);
    //switch resume and cover letter view
    if (clicked.id == "Resume_button") {
        switch_view(resume, cover_letter);
    } else {
        switch_view(cover_letter, resume);
    }
    setTimeout(function () {
        clicked.style.backgroundColor = "#0f469a"; //set background to same as ::before element to fix weirdness with border size.
        style_element.innerHTML = ""; //reset transform origin
        clicked.disabled = false; //enable buttons
        unclicked.disabled = false;
    }, 500); //wait until end of animation
}

//button animation and show resume when user clicks button
resume_button.addEventListener('click', function (e) {
    toggle_buttons(resume_button, cover_letter_button, e); //abstraction is nice :)
});

//button animation and show cover letter when user clicks button
cover_letter_button.addEventListener('click', function (e) {
    toggle_buttons(cover_letter_button, resume_button, e); //abstraction is nice :)
});

let userAgentString = navigator.userAgent;

// Detect Safari
let safariAgent = userAgentString.indexOf("Safari") > -1;

// Detect Chrome
let chromeAgent = userAgentString.indexOf("Chrome") > -1;
  
// Discard Safari since it also matches Chrome
if ((chromeAgent) && (safariAgent)) safariAgent = false;

//do this because SAFARI SUCKS. The security is good tho.
//Fixes animations with contact buttons and spinning cube
const root = document.querySelector(':root'); //this is also for moving the cube later
const _C = document.querySelector('.cube'); //cube

if (safariAgent) {
    setTimeout(function () {_C.style.animation = "cube_rotate 8s linear infinite forwards";}, 5500) //changing animation fixes bug with resizing window for some reason
    var style = document.createElement("style");
    style.innerHTML = "div#contact > * {margin: 0 !important;}"; //fix this because margin mess up the small button raise animations I have for some reason
    document.body.appendChild(style);
    function fix_animation() {
        _C.style.animation = "cube_rotate 8s linear infinite forwards";
        _C.style.width = "calc(var(--cubeSize)/2)";
        _C.style.height = "calc(var(--cubeSize)/2)";
    }
    document.body.onresize = function () {fix_animation()}; //have to do this in case window resized before beginning animation is done. Not ideal but it works
}

//rotate cube on click
const A = .2 //sensitivity
var cube_style = document.createElement("style"); //to define the cube rotation. Doesn't work as inline style so this is necessary
document.body.appendChild(cube_style);

let drag = false, x0 = null, y0 = null; //values for rotating

function getE(ev) {
    return ev.touches ? ev.touches[0] : ev;
};

function lock(ev) { //initalize the rotation
    root.style.setProperty('--p', getComputedStyle(_C).transform.replace('none', ''));
    if (_C.style.animation == "" || _C.style.animation == "cube_rotate 8s linear infinite forwards") {
        _C.style.animation = "none";
        cube_style.innerHTML = ".cube {transform: rotate3d(var(--i), var(--j), 0, var(--a)) var(--p);}";
    }
    _C.style.animation = "none";
    let e = getE(ev);
    drag = true;
    x0 = e.clientX;
    y0 = e.clientY;
};

function rotate(ev) { //do the rotation
    if (drag) { //only if user has clicked
        let e = getE(ev), 
                x = e.clientX, y = e.clientY, //current x and y
                dx = x - x0, dy = y - y0, //change in x and y
                d = Math.hypot(dx, dy); //distance from previous point
        
        if(d) { //if cursor moved
            root.style.setProperty('--p', getComputedStyle(_C).transform.replace('none', '')); //current position of cube
            root.style.setProperty('--i', +(-dy).toFixed(2)); //rotation about x axis
            root.style.setProperty('--j', +(dx).toFixed(2)); //rotation about y axis
            root.style.setProperty('--a', `${+(A*d).toFixed(2)}deg`); //degree of rotation
                        
            x0 = x; //set current point as the previous point
            y0 = y;
        }
    }
};

function release(ev) {
    if (drag) { //clear variables
        drag = false;
        x0 = y0 = null;
    }
    _C.style.animation = "cube_rotate 7s linear infinite forwards"; //startup rotation again
};

var start_card = document.querySelector(".start"); //start card
setTimeout(function () { //wait until the initial cube animation is done
    _C.style.width = "calc(var(--cubeSize)/2)"; //set width and height to full
    _C.style.height = "calc(var(--cubeSize)/2)";

    start_card.addEventListener('mousedown', lock, false); //user click
    start_card.addEventListener('touchstart', lock, false);

    start_card.addEventListener('mousemove', rotate, false); //user cursor move
    start_card.addEventListener('touchmove', rotate, false);

    start_card.addEventListener('mouseup', release, false); //user release
    start_card.addEventListener('touchend', release, false);
}, 5500);