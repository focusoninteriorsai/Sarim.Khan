/* Sarim Khan — a two-second, Apple “hello”-inspired handwritten introduction.
   Loaded at the start of <body>, independently of the portfolio interactions.
   No font, image, framework, session-storage or window.load dependency. */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var DURATION = 2000;
  var FADE_DURATION = 260;

  // Respect the visitor's accessibility preference: no animation or forced wait.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var loader = doc.createElement("div");
  loader.className = "site-loader";
  loader.id = "site-loader";
  loader.setAttribute("data-duration", String(DURATION));
  loader.innerHTML = [
    '<div class="site-loader__masthead" aria-hidden="true">',
      '<span class="site-loader__brand"><span class="site-loader__monogram">SK</span> Sarim Khan</span>',
      '<span class="site-loader__location">Delhi-NCR, India</span>',
    '</div>',
    '<div class="site-loader__center">',
      '<p class="sr-only" role="status">Loading Sarim Khan\'s portfolio.</p>',
      '<p class="site-loader__eyebrow" aria-hidden="true">A personal introduction</p>',
      '<svg class="site-loader__signature" viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
        '<defs><linearGradient id="intro-ink" gradientUnits="userSpaceOnUse" x1="60" y1="65" x2="630" y2="125">',
          '<stop offset="0%" stop-color="#0a2459"/>',
          '<stop offset="45%" stop-color="#3977d5"/>',
          '<stop offset="70%" stop-color="#557ca9"/>',
          '<stop offset="100%" stop-color="#bd8b37"/>',
        '</linearGradient></defs>',
        '<g fill="none" stroke="url(#intro-ink)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">',
          // These are pen-centreline strokes, not traced letter outlines.
          '<path pathLength="1" style="--delay:80ms;--duration:260ms" d="M149 55 C139 36 110 40 93 51 C66 69 89 83 112 90 C147 100 142 125 119 135 C102 143 74 139 67 128 C62 120 70 109 84 106"/>',
          '<path pathLength="1" style="--delay:340ms;--duration:120ms" d="M180 102 C168 90 152 105 149 124 C146 143 164 144 177 122 L183 99 C178 115 170 142 184 139 L198 126"/>',
          '<path pathLength="1" style="--delay:460ms;--duration:90ms" d="M198 126 C204 115 207 104 211 99 C207 114 207 128 202 140 C206 122 216 100 226 100 C234 100 232 112 224 116 C230 115 236 116 241 112"/>',
          '<path pathLength="1" style="--delay:550ms;--duration:80ms" d="M243 101 C240 111 233 127 236 136 C240 146 252 135 262 122"/>',
          '<path pathLength="1" style="--delay:630ms;--duration:160ms" d="M262 122 L270 101 L260 141 C267 122 279 99 287 101 C296 103 284 128 283 138 C290 118 303 98 311 102 C321 109 301 139 312 140 C319 142 330 132 337 123"/>',
          '<path pathLength="1" style="--delay:790ms;--duration:50ms" d="M248 78 L248.5 77.5"/>',
          '<path pathLength="1" style="--delay:820ms;--duration:130ms" d="M408 50 C402 80 388 111 379 142"/>',
          '<path pathLength="1" style="--delay:950ms;--duration:160ms" d="M461 51 C447 64 421 90 396 105 C414 91 424 99 428 115 C433 135 442 144 459 133"/>',
          '<path pathLength="1" style="--delay:1110ms;--duration:180ms" d="M459 133 C472 111 489 80 492 58 C495 33 468 67 462 90 C457 109 455 129 452 141 C462 120 478 98 486 102 C495 107 479 128 486 138 C491 143 500 133 506 125"/>',
          '<path pathLength="1" style="--delay:1290ms;--duration:100ms" d="M537 104 C526 93 510 106 507 123 C503 141 519 145 533 124 L542 101 C536 119 528 140 541 140 C548 140 556 130 561 123"/>',
          '<path pathLength="1" style="--delay:1390ms;--duration:130ms" d="M561 123 L569 103 L559 141 C570 121 582 99 591 103 C603 108 582 136 593 141 C601 145 617 135 631 118"/>',
          '<path class="site-loader__flourish" pathLength="1" style="--delay:1510ms;--duration:120ms" d="M124 170 C245 154 420 153 573 157"/>',
        '</g>',
      '</svg>',
      '<p class="site-loader__role" aria-hidden="true">Project Director <span>·</span> Turnkey Interiors</p>',
      '<div class="site-loader__track" aria-hidden="true"><span></span></div>',
    '</div>',
    '<div class="site-loader__footer">',
      '<span aria-hidden="true">Every detail. Every space.</span>',
      '<button class="site-loader__skip" type="button">Skip intro <span aria-hidden="true">↗</span></button>',
    '</div>'
  ].join("");

  var released = false;
  var finished = false;
  var fadeTimer;
  var endTimer;

  function releasePage() {
    if (released) return;
    released = true;
    root.classList.remove("site-loading");
    // Scroll reveals and counters begin only when the page can actually be seen.
    doc.dispatchEvent(new CustomEvent("portfolio:ready"));
  }

  function finish() {
    if (finished) return;
    finished = true;
    window.clearTimeout(fadeTimer);
    window.clearTimeout(endTimer);
    releasePage();
    loader.remove();
    doc.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("pagehide", finish);
    window.removeEventListener("pageshow", onPageShow);
  }

  function skip(event) {
    finish();
    // Keep a keyboard visitor's focus on the page, not on a removed button.
    if (event && (event.type === "keydown" || event.detail === 0)) {
      var focusContent = function () {
        var main = doc.getElementById("main");
        if (main) {
          main.setAttribute("tabindex", "-1");
          main.focus({ preventScroll: true });
        }
      };
      if (doc.readyState === "loading") {
        doc.addEventListener("DOMContentLoaded", focusContent, { once: true });
      } else {
        focusContent();
      }
    }
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      skip(event);
    }
  }

  function onPageShow(event) {
    if (event.persisted) finish();
  }

  doc.body.appendChild(loader);
  root.classList.add("site-loading");
  fadeTimer = window.setTimeout(function () {
    releasePage();
    loader.classList.add("is-leaving");
  }, DURATION - FADE_DURATION);
  // Total intro time includes the fade; it is not 2 seconds plus a transition.
  endTimer = window.setTimeout(finish, DURATION);

  loader.querySelector(".site-loader__skip").addEventListener("click", skip);
  doc.addEventListener("keydown", onKeyDown);
  // Never restore a frozen loading overlay when navigating back from another page.
  window.addEventListener("pagehide", finish);
  window.addEventListener("pageshow", onPageShow);
})();
