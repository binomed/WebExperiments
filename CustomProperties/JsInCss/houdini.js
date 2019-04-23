"use strict";


function processHoudiniStuff(){

    const houdinReady = "paintWorklet" in CSS;
    
    
    if (!houdinReady) {
      return;
    }
    
    const houdiniElt = document.getElementById("houdini");
    houdiniElt.style.display = "";
    (CSS.paintWorklet || paintWorklet).addModule("./module.js");
    
    houdiniElt.style.setProperty(
      "--circle-js-in-css",
      `(ctx, geom) => {
        const color = \`var(--circle-color)\`;
        ctx.fillStyle = color;
        const x = geom.width / 2;
        const y = geom.height / 2;
        let radius = Math.min(x, y);
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }`
    );
    houdiniElt.style.setProperty("--circle-color", "black");
    houdiniElt.style.setProperty("background-image", "paint(circle-from-css)");
}

processHoudiniStuff();
