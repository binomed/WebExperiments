"use strict";
import './houdini.js';

import {HelperJsInCss} from './helperJsInCss.js'


document.addEventListener("DOMContentLoaded", _ => {
  const pureCssElt = document.getElementById("pure-css");
  applyStylePureCss(pureCssElt);
});

function applyStylePureCss(elt) {
  new HelperJsInCss(elt, "--randomColor");
  new HelperJsInCss(document.body.querySelector('#pure-css h1'), "--testDependancy", true);

  new HelperJsInCss(document.getElementById('bg1'), '--url', true, ['--imgToUse']);
  new HelperJsInCss(document.getElementById('bg2'), '--url', true, ['--imgToUse']);

}




