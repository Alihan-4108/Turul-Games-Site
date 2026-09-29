/* Turul Games — small progressive enhancements. The page works without this file. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* ---------- theme toggle (initial theme is applied inline in <head>) ---------- */
  var themeBtn = document.getElementById("themeBtn");
  function currentIsDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return !window.matchMedia("(prefers-color-scheme: light)").matches;
  }
  themeBtn.addEventListener("click", function () {
    var next = currentIsDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("turul-theme", next); } catch (e) {}
  });

  /* ---------- nav: scrolled state + mobile menu ---------- */
  var nav = document.getElementById("nav");
  var menuBtn = document.getElementById("menuBtn");
  var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  document.getElementById("navMenu").addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
  });
  window.matchMedia("(min-width: 861px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });

  /* ---------- active section in nav ---------- */
  var links = {};
  document.querySelectorAll(".nav-links a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = links[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
          link.setAttribute("aria-current", "true");
        } else if (link.hasAttribute("aria-current")) {
          link.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          reveal.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { reveal.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- hero parallax (pointer, desktop only) ---------- */
  var visual = document.querySelector(".hero-visual");
  if (visual && finePointer.matches && !reduceMotion.matches) {
    var layers = visual.querySelectorAll("[data-depth]");
    var hero = document.querySelector(".hero");
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

    var tick = function () {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      layers.forEach(function (el) {
        var d = +el.getAttribute("data-depth");
        // `translate` composes with any CSS transform/animation already on the layer
        el.style.translate = (cx * d).toFixed(2) + "px " + (cy * d).toFixed(2) + "px";
      });
      raf = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(tick) : 0;
    };
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 0.6;
      if (!raf) raf = requestAnimationFrame(tick);
    });
    hero.addEventListener("pointerleave", function () {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  }

  /* ---------- game card spotlight ---------- */
  if (finePointer.matches) {
    document.querySelectorAll("[data-spotlight]").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- copy email ---------- */
  var status = document.getElementById("copyStatus");
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var label = btn.querySelector(".copy-label");
    if (!navigator.clipboard) { btn.hidden = true; return; }
    btn.addEventListener("click", function () {
      navigator.clipboard.writeText(btn.getAttribute("data-copy")).then(function () {
        btn.classList.add("copied");
        label.textContent = "Copied";
        status.textContent = "Email address copied to clipboard";
        setTimeout(function () {
          btn.classList.remove("copied");
          label.textContent = "Copy";
          status.textContent = "";
        }, 2000);
      }).catch(function () {});
    });
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
