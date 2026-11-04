// ALINEA — menu, "vandaag" en jaartal. Geen cookies, geen externe scripts.
(function () {
  // Openingsuren (0 = zondag). Gelijk houden met de tabel in index.html.
  var HOURS = {
    0: [],
    1: [["08:00", "12:30"], ["13:00", "18:00"]],
    2: [["08:00", "12:30"], ["13:00", "18:00"]],
    3: [["08:00", "12:30"], ["13:00", "16:00"]],
    4: [["08:00", "12:30"], ["13:00", "18:00"]],
    5: [],
    6: [["14:00", "18:00"]],
  };
  var DAYS = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];

  function belgiumNow() {
    // Tijd in Oostende, ook als de bezoeker in een andere tijdzone zit.
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Brussels", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    return { day: day, time: get("hour") + ":" + get("minute") };
  }
  function fmt(slots) { return slots.map(function (s) { return s[0] + "–" + s[1]; }).join(" & "); }

  function renderToday() {
    var box = document.querySelector("[data-today]");
    var now = belgiumNow();
    var rows = document.querySelectorAll("[data-day]");
    rows.forEach(function (row) { row.classList.toggle("is-today", Number(row.getAttribute("data-day")) === now.day); });
    if (!box) return;

    var state = box.querySelector(".state"), title = box.querySelector("h2"), hours = box.querySelector(".hours");
    var today = HOURS[now.day];
    var current = today.filter(function (s) { return now.time >= s[0] && now.time < s[1]; })[0];
    var later = today.filter(function (s) { return now.time < s[0]; })[0];

    if (current) {
      state.textContent = "Nu open"; state.classList.add("open");
      title.textContent = "Open tot " + current[1];
      hours.textContent = "Vandaag: " + fmt(today);
    } else if (later) {
      state.textContent = "Vandaag open";
      title.textContent = "Open vanaf " + later[0];
      hours.textContent = "Vandaag: " + fmt(today);
    } else {
      state.textContent = "Nu gesloten";
      for (var i = 1; i <= 7; i++) {
        var d = (now.day + i) % 7;
        if (HOURS[d].length) {
          title.textContent = (i === 1 ? "Morgen" : "Op " + DAYS[d]) + " vanaf " + HOURS[d][0][0];
          hours.textContent = (i === 1 ? "Morgen" : DAYS[d].charAt(0).toUpperCase() + DAYS[d].slice(1)) + ": " + fmt(HOURS[d]);
          break;
        }
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var yr = document.getElementById("yr");
    if (yr) yr.textContent = new Date().getFullYear();

    var toggle = document.querySelector(".menu-toggle"), nav = document.getElementById("nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.textContent = open ? "Sluiten" : "Menu";
      });
      nav.addEventListener("click", function (e) {
        if (e.target.tagName === "A" && nav.classList.contains("open")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); toggle.textContent = "Menu"; }
      });
    }

    renderToday();
    setInterval(renderToday, 60000);
  });
})();
