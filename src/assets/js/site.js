/* Salåppeʼta — small progressive enhancements. Everything works without JS;
   these only add convenience. */
(function () {
  "use strict";
  var root = document.documentElement;
  var KEY = "salappeta:large";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  // ---- Larger text (persisted) -------------------------------------------
  function syncTextToggles() {
    var large = root.classList.contains("large");
    document.querySelectorAll("[data-text-toggle]").forEach(function (b) {
      b.textContent = large ? "A−  smaller text" : "A+  larger text";
      b.setAttribute("aria-pressed", large ? "true" : "false");
    });
  }
  function initTextSize() {
    syncTextToggles();
    document.querySelectorAll("[data-text-toggle]").forEach(function (b) {
      b.addEventListener("click", function () {
        var large = root.classList.toggle("large");
        try { localStorage.setItem(KEY, large ? "1" : "0"); } catch (e) {}
        syncTextToggles();
      });
    });
  }

  // ---- Check calculator ---------------------------------------------------
  function initCalculator() {
    var input = document.querySelector("[data-calc-input]");
    if (!input) return;
    var fmt = function (v) { return "$" + Math.round(v).toLocaleString("en-US"); };
    var out = {};
    document.querySelectorAll("[data-calc]").forEach(function (el) { out[el.dataset.calc] = el; });
    function update() {
      var b = Math.max(0, Number(input.value) || 0);
      out.g75.textContent = fmt(b * 0.75);
      out.s25.textContent = fmt(b * 0.25);
      out.y25.textContent = fmt(b * 0.25 * 12);
    }
    input.addEventListener("input", update);
    update();
  }

  // ---- Chip filters and tabs ----------------------------------------------
  // <div data-filter="topic"> buttons[data-value]; items [data-filter-item="topic"][data-value]
  function initFilters() {
    document.querySelectorAll("[data-filter]").forEach(function (group) {
      var name = group.dataset.filter;
      var buttons = group.querySelectorAll("button[data-value]");
      var items = document.querySelectorAll('[data-filter-item="' + name + '"]');
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var v = btn.dataset.value;
          buttons.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
          items.forEach(function (it) { it.hidden = !(v === "All" || it.dataset.value === v); });
        });
      });
    });
    // Feed tabs: <div data-tabs> buttons[data-tab]; panels [data-panel]
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      var buttons = group.querySelectorAll("button[data-tab]");
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          buttons.forEach(function (b) {
            var on = b === btn;
            b.setAttribute("aria-pressed", on ? "true" : "false");
            var panel = document.getElementById(b.getAttribute("aria-controls"));
            if (panel) panel.classList.toggle("is-active", on);
          });
        });
      });
    });
  }

  // ---- Glossary search ----------------------------------------------------
  function initGlossary() {
    var input = document.querySelector("[data-glossary-search]");
    if (!input) return;
    var groups = document.querySelectorAll("[data-gloss-group]");
    var letters = document.querySelectorAll("[data-gloss-letter]");
    var empty = document.querySelector("[data-gloss-empty]");
    function run() {
      var q = input.value.trim().toLowerCase();
      var any = false;
      groups.forEach(function (g) {
        var shown = 0;
        g.querySelectorAll("[data-gloss-term]").forEach(function (t) {
          var hit = !q || t.textContent.toLowerCase().indexOf(q) !== -1;
          t.hidden = !hit;
          if (hit) shown++;
        });
        g.hidden = shown === 0;
        if (shown) any = true;
      });
      letters.forEach(function (a) {
        var g = document.getElementById(a.getAttribute("href").slice(1));
        a.hidden = !g || g.hidden;
      });
      empty.hidden = any;
    }
    input.addEventListener("input", run);
    run();
  }

  // ---- "Time ago" -----------------------------------------------------------
  function ago(iso) {
    var days = Math.round((Date.now() - new Date(iso + "T12:00:00").getTime()) / 864e5);
    var plural = function (n, w) { return n + " " + w + (n > 1 ? "s" : "") + " ago"; };
    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 7) return days + " days ago";
    if (days < 30) return plural(Math.floor(days / 7), "week");
    if (days < 365) return plural(Math.floor(days / 30), "month");
    return plural(Math.floor(days / 365), "year");
  }
  function initTimeAgo() {
    document.querySelectorAll("[data-ago]").forEach(function (el) {
      el.textContent = (el.dataset.prefix || "") + ago(el.dataset.ago);
      el.hidden = false;
    });
  }

  // ---- Reading progress -------------------------------------------------------
  function initProgress() {
    var bar = document.querySelector("[data-progress]");
    if (!bar) return;
    var el = document.scrollingElement || root;
    var ticking = false;
    function update() {
      var max = el.scrollHeight - el.clientHeight;
      bar.style.width = (max > 0 ? (el.scrollTop / max) * 100 : 0) + "%";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // ---- Netlify forms: submit in place, fall back to /thanks/ ----------------
  function initForms() {
    document.querySelectorAll("form[data-ajax-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        if (!window.fetch || !window.URLSearchParams) return;
        e.preventDefault();
        var btn = form.querySelector('[type="submit"]');
        if (btn) btn.disabled = true;
        fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(new FormData(form)).toString()
        }).then(function (res) {
          if (!res.ok) throw new Error(res.status);
          var msg = document.createElement("p");
          msg.className = "form-status";
          msg.setAttribute("role", "status");
          msg.tabIndex = -1;
          msg.textContent = form.dataset.success;
          form.replaceWith(msg);
          msg.focus();
        }).catch(function () {
          form.removeAttribute("data-ajax-form");
          form.submit();
        });
      });
    });
  }

  ready(function () {
    initTextSize();
    initCalculator();
    initFilters();
    initGlossary();
    initTimeAgo();
    initProgress();
    initForms();
  });
})();
