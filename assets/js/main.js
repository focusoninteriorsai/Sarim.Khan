/* Sarim Khan — Portfolio interactions. Dependency-free, progressive enhancement. */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  root.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ---------- Header: elevation on scroll + mobile menu ---------- */
  var header = $(".site-header");
  var toggle = $(".nav-toggle");
  var nav = $("#primary-nav");

  function setMenu(open, restoreFocus) {
    if (!header || !toggle || !nav) return;
    var wasOpen = header.classList.contains("is-open");
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    doc.body.classList.toggle("menu-open", open);
    if (open) {
      var firstLink = $("a", nav);
      if (firstLink) firstLink.focus({ preventScroll: true });
    } else if (wasOpen && restoreFocus) {
      toggle.focus({ preventScroll: true });
    }
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!header.classList.contains("is-open"), true);
    });
  }
  if (nav) {
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false, false); });
    });
  }
  doc.addEventListener("keydown", function (e) {
    if (!header || !header.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setMenu(false, true);
    }
    // Keep keyboard navigation inside the open mobile menu.
    if (e.key === "Tab") {
      var focusable = $$("a", nav).concat([toggle]);
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && doc.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && doc.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (focusable.indexOf(doc.activeElement) === -1) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  doc.addEventListener("click", function (e) {
    if (header && header.classList.contains("is-open") && !header.contains(e.target)) {
      setMenu(false, true);
    }
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1240) setMenu(false, false);
  });

  /* ---------- Scroll-driven UI (throttled with rAF) ---------- */
  var topBtn = $(".fab-top");
  var progressBar = $(".progress span");
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (topBtn) topBtn.classList.toggle("show", y > 640);
    if (progressBar) {
      var max = root.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;
      progressBar.parentNode.style.setProperty("--p", pct.toFixed(2) + "%");
    }
    ticking = false;
  }
  function requestScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll);
  onScroll();

  if (topBtn) {
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* Start page motion after the intro, not behind its overlay. */
  function initPageAnimations() {
    /* ---------- Reveal on scroll ---------- */
    var reveals = $$(".reveal");
    if ("IntersectionObserver" in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            en.target.dispatchEvent(new CustomEvent("revealed", { bubbles: false }));
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
      reveals.forEach(function (el) { io.observe(el); });
      // Animated sections (growth bars, counters) observe the same way.
      $$("[data-animate]").forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("is-visible"); });
      $$("[data-animate]").forEach(function (el) { el.classList.add("is-visible"); });
    }

    /* ---------- Count-up numbers ---------- */
    function formatNumber(n, indian) {
      var rounded = Math.round(n);
      return indian ? rounded.toLocaleString("en-IN") : rounded.toLocaleString("en-US");
    }
    function countUp(el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      var indian = el.hasAttribute("data-indian");
      if (reduceMotion || !("IntersectionObserver" in window)) {
        el.textContent = formatNumber(target, indian);
        return;
      }
      var duration = 1600;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = formatNumber(target * eased, indian);
        if (t < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }
    var counters = $$("[data-count]");
    if ("IntersectionObserver" in window && counters.length && !reduceMotion) {
      counters.forEach(function (el) { el.textContent = "0"; });
      var cio = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            countUp(en.target);
            obs.unobserve(en.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  if (root.classList.contains("site-loading")) {
    doc.addEventListener("portfolio:ready", initPageAnimations, { once: true });
  } else {
    initPageAnimations();
  }

  /* ---------- Hero: subtle 3D tilt (pointer devices only) ---------- */
  var stage = $("[data-tilt]");
  if (stage && finePointer && !reduceMotion) {
    var inner = $(".tilt-inner", stage);
    var raf = null;
    var tx = 0, ty = 0;
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      tx = py * -7;
      ty = px * 9;
      if (!raf) raf = window.requestAnimationFrame(apply);
    });
    stage.addEventListener("pointerleave", function () {
      tx = 0; ty = 0;
      if (!raf) raf = window.requestAnimationFrame(apply);
    });
    function apply() {
      raf = null;
      inner.style.transform = "rotateX(" + tx.toFixed(2) + "deg) rotateY(" + ty.toFixed(2) + "deg)";
    }
  }

  /* ---------- Project explorer: vertical filter, search, sort ---------- */
  var explorer = $("[data-explorer]");
  if (explorer) {
    var grid = $("[data-explorer-grid]", explorer);
    var items = $$("[data-item]", explorer);
    var buttons = $$("[data-filter]", explorer);
    var search = $("[data-search]", explorer);
    var sortSel = $("[data-sort]", explorer);
    var out = $("[data-result-count]", explorer);
    var empty = $("[data-empty]", explorer);
    var active = "All";

    function applyExplorer() {
      var q = (search ? search.value : "").trim().toLowerCase();
      var sortKey = sortSel ? sortSel.value : "curated";
      var visible = [];
      items.forEach(function (el) {
        var okV = active === "All" || el.getAttribute("data-vertical") === active;
        var okQ = !q || (el.getAttribute("data-text") || "").indexOf(q) !== -1;
        var show = okV && okQ;
        el.hidden = !show;
        if (show) visible.push(el);
      });

      visible.sort(function (a, b) {
        if (sortKey === "value") return parseFloat(b.dataset.value) - parseFloat(a.dataset.value);
        if (sortKey === "area") return parseFloat(b.dataset.area) - parseFloat(a.dataset.area);
        if (sortKey === "vertical") return a.dataset.vertical.localeCompare(b.dataset.vertical) || a.dataset.name.localeCompare(b.dataset.name);
        return parseInt(a.dataset.order, 10) - parseInt(b.dataset.order, 10);
      });
      visible.forEach(function (el) { grid.appendChild(el); });

      if (out) {
        out.textContent = "Showing " + visible.length + " of " + items.length + " engagements" + (active !== "All" ? " · " + active : "");
      }
      if (empty) empty.classList.toggle("show", visible.length === 0);
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        active = btn.getAttribute("data-filter");
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        applyExplorer();
      });
    });
    if (search) search.addEventListener("input", applyExplorer);
    if (sortSel) sortSel.addEventListener("change", applyExplorer);
    applyExplorer();
  }

  /* ---------- Gallery filter ---------- */
  var gallery = $("[data-gallery]");
  if (gallery) {
    var gItems = $$("[data-gallery-item]", gallery);
    var gButtons = $$("[data-group]", gallery);
    var gCount = $("[data-gallery-count]", gallery);
    gButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var g = btn.getAttribute("data-group");
        gButtons.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        var n = 0;
        gItems.forEach(function (el) {
          var show = g === "All" || el.getAttribute("data-group") === g;
          el.classList.toggle("show", show);
          if (show) n++;
        });
        if (gCount) gCount.textContent = n + " photographs";
      });
    });
  }

  /* ---------- Lightbox (native <dialog>) ---------- */
  var dialog = $("#lightbox");
  if (dialog && typeof dialog.showModal === "function") {
    var lbImg = $("img", dialog);
    var lbCap = $("figcaption", dialog);
    var lastTrigger = null;

    doc.addEventListener("click", function (e) {
      var trg = e.target.closest("[data-lightbox]");
      if (!trg) return;
      e.preventDefault();
      lastTrigger = trg;
      lbImg.src = trg.getAttribute("data-src");
      lbImg.alt = trg.getAttribute("data-alt") || "";
      lbCap.textContent = trg.getAttribute("data-caption") || "";
      dialog.showModal();
    });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog || e.target.closest("[data-lb-close]")) dialog.close();
    });
    dialog.addEventListener("close", function () {
      lbImg.removeAttribute("src");
      if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    });
  }

  /* ---------- Copy to clipboard ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = doc.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      doc.body.appendChild(ta);
      ta.select();
      try {
        doc.execCommand("copy") ? resolve() : reject();
      } catch (err) {
        reject(err);
      } finally {
        doc.body.removeChild(ta);
      }
    });
  }
  $$("[data-copy]").forEach(function (btn) {
    var label = btn.querySelector("[data-copy-label]") || btn;
    var original = label.textContent;
    btn.addEventListener("click", function () {
      copyText(btn.getAttribute("data-copy")).then(function () {
        label.textContent = "Copied!";
        btn.classList.add("is-done");
        window.setTimeout(function () {
          label.textContent = original;
          btn.classList.remove("is-done");
        }, 2000);
      }, function () {
        label.textContent = "Copy failed";
        window.setTimeout(function () { label.textContent = original; }, 2000);
      });
    });
  });

  /* ---------- Smooth in-page anchors respecting reduced motion ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      var target = id && doc.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });
})();
