"use strict";
import './houdini.js';

let propertieValue = "";

document.addEventListener("DOMContentLoaded", _ => {
  const pureCssElt = document.getElementById("pure-css");
  
  

  document.body.style.setProperty(
    "--test",
    `() => {
                let color = \`var(--color)\`.replace(' ','');
                return color;
            }`
  );
  /*document.body.style.setProperty('--url', `() => {
                let scheme = \`var(--scheme)\`.replace(' ','');
                let host = \`var(--hostmane)\`.replace(' ','');
                let port = var(--port);
                let img = \`var(--img1)\`.replace(' ','');
                let url = scheme+'://'+host+':'+port+'/'+img;
                return url;
            }`);*/
  /*document.body.style.setProperty('--url', `() => {
                let scheme = var(--scheme);
                return scheme;
            }`);*/
  /*document.body.style.setProperty('--randomColor', `() => {
                let red = Math.random()*255;
                let green = Math.random()*255;
                let blue = Math.random()*255;
                return 'rgb('+red+','+green+','+blue+')';
            }`);*/

  applyStylePureCss(pureCssElt);
});

function applyStylePureCss(elt) {
  const value = window.getComputedStyle(elt).getPropertyValue("--randomColor");
  console.log("--randomColor", value);
  propertieValue = eval(value)();

  console.log("eval --randomColor", propertieValue);
  elt.style.setProperty("--computeUrl", propertieValue);

  console.log(
    "testDependancy",
    window.getComputedStyle(elt).getPropertyValue("--testDependancy")
  );
  console.log(
    "testDependancy",
    window.getComputedStyle(document.querySelector('#pure-css h1')).getPropertyValue("--img1")
  );

  applyBackground(document.getElementById('bg1'));
  applyBackground(document.getElementById('bg2'));

}

function applyBackground(elt){

    const computeStyle = window.getComputedStyle(elt);
    
    const computeUrl = computeStyle.getPropertyValue("--url");
    const imgToUse = computeStyle.getPropertyValue('--imgToUse');
    console.log("url", computeUrl);
    const evalUrl = eval(computeUrl)(imgToUse);
    console.log('eval Url', evalUrl);
    elt.style.setProperty('--computeUrl', `url(${evalUrl})`);

}

function checkProperties() {
  const value = document.body.style.getPropertyValue("--url");
  let temp = eval(value)();
  if (temp !== propertieValue) {
    console.log(value);
    propertieValue = temp;
    document.body.style.setProperty("--computeUrl", propertieValue);
  }

  window.requestAnimationFrame(checkProperties);
}


