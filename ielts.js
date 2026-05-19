(function () {
  "use strict";

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function norm(s) {
    return String(s == null ? "" : s)
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[".,;:!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  function compact(s) { return norm(s).replace(/\s+/g, ""); }

  function accepted(ans) {
    var list = Array.isArray(ans) ? ans.slice() : [ans];
    var out = [];
    list.forEach(function (a) {
      var n = norm(a);
      out.push(n);
      if (n === "true") out.push("t");
      if (n === "false") out.push("f");
      if (n === "yes") out.push("y");
      if (n === "no") out.push("n");
      if (n === "not given") out.push("notgiven", "ng", "n/g");
    });
    return out;
  }

  function isCorrect(user, ans) {
    var u = norm(user);
    if (!u) return false;
    var uc = compact(user);
    return accepted(ans).some(function (a) {
      return a === u || a.replace(/\s+/g, "") === uc;
    });
  }

  function band(score, total) {
    if (total !== 40) {
      var pct = score / total;
      if (pct >= 0.9) return "9"; if (pct >= 0.85) return "8";
      if (pct >= 0.75) return "7.5"; if (pct >= 0.65) return "7";
      if (pct >= 0.5) return "6"; if (pct >= 0.35) return "5";
      return "below 5";
    }
    var t = [[39, "9"], [37, "8.5"], [35, "8"], [32, "7.5"], [30, "7"],
             [26, "6.5"], [23, "6"], [18, "5.5"], [16, "5"], [13, "4.5"], [0, "below 4.5"]];
    for (var i = 0; i < t.length; i++) if (score >= t[i][0]) return t[i][1];
    return "below 4.5";
  }

  function correctText(ans) {
    return (Array.isArray(ans) ? ans.join(" / ") : String(ans));
  }

  function grade(skill, resultEl) {
    var KEY = window.IELTS_KEY && window.IELTS_KEY[skill];
    if (!KEY) return;
    var qs = Object.keys(KEY), score = 0, wrong = [];
    qs.forEach(function (q) {
      var ans = KEY[q];
      var mcq = document.querySelector('.mcq[data-skill="' + skill + '"][data-q="' + q + '"]');
      var ok, host;
      if (mcq) {
        host = mcq;
        var picked = mcq.querySelector('input[type="radio"]:checked');
        ok = picked ? isCorrect(picked.value, ans) : false;
        mcq.querySelectorAll(".opts label").forEach(function (l) {
          l.classList.remove("ans-ok", "ans-bad");
          var r = l.querySelector('input[type="radio"]');
          if (r && norm(r.value) === norm(correctText(ans).split(" / ")[0])) l.classList.add("ans-ok");
          if (r && r.checked && !ok) l.classList.add("ans-bad");
        });
      } else {
        var inp = document.querySelector('input[data-skill="' + skill + '"][data-q="' + q + '"]');
        if (!inp) return;
        host = inp;
        ok = isCorrect(inp.value, ans);
        inp.classList.remove("ans-ok", "ans-bad");
        inp.classList.add(ok ? "ans-ok" : "ans-bad");
        if (!ok) inp.title = "Answer: " + correctText(ans);
      }
      if (ok) score++; else wrong.push(q);
    });
    var total = qs.length;
    resultEl.innerHTML =
      '<div class="et-score">' + score + " / " + total +
      '</div><div class="et-band">Approx. band <b>' + band(score, total) + "</b></div>" +
      '<p class="note">Correct answers are highlighted in green; your incorrect ones in red ' +
      "(hover or tap a red box to see the right answer). Open the answer key below for full explanations. " +
      "This is an estimate &mdash; Writing and Speaking must be assessed against the model answers.</p>";
    resultEl.classList.add("show");
    resultEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function makeTimer(box, mins, label) {
    var total = mins * 60, left = total, id = null, running = false;
    var wrap = document.createElement("div");
    wrap.className = "et-timer";
    var clock = document.createElement("span");
    clock.className = "et-clock";
    var lab = document.createElement("span");
    lab.className = "et-label";
    lab.textContent = label + " · " + mins + " min";
    function render() {
      clock.textContent = Math.floor(left / 60) + ":" + pad(left % 60);
    }
    function tick() {
      if (left <= 0) {
        clearInterval(id); running = false; wrap.classList.add("et-done");
        clock.textContent = "Time's up";
        return;
      }
      left--; render();
    }
    function btn(txt, fn) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "et-btn"; b.textContent = txt;
      b.addEventListener("click", fn);
      return b;
    }
    var start = btn("Start", function () {
      if (running || left <= 0) return;
      running = true; wrap.classList.remove("et-done");
      wrap.classList.add("et-run"); id = setInterval(tick, 1000);
    });
    var pause = btn("Pause", function () {
      running = false; wrap.classList.remove("et-run"); clearInterval(id);
    });
    var reset = btn("Reset", function () {
      running = false; clearInterval(id); left = total;
      wrap.classList.remove("et-run", "et-done"); render();
    });
    render();
    wrap.appendChild(clock); wrap.appendChild(start);
    wrap.appendChild(pause); wrap.appendChild(reset); wrap.appendChild(lab);
    box.appendChild(wrap);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".examtools").forEach(function (box) {
      var skill = box.getAttribute("data-skill");
      var mins = parseInt(box.getAttribute("data-min"), 10) || 30;
      var label = box.getAttribute("data-label") || "Section";
      makeTimer(box, mins, label);

      if (window.IELTS_KEY && window.IELTS_KEY[skill]) {
        var check = document.createElement("button");
        check.type = "button";
        check.className = "et-check";
        check.textContent = "Check my answers";
        var result = document.createElement("div");
        result.className = "et-result";
        check.addEventListener("click", function () { grade(skill, result); });
        box.appendChild(check);
        box.appendChild(result);
      } else {
        var note = document.createElement("p");
        note.className = "note";
        note.innerHTML = "This skill is marked by a teacher &mdash; compare your work with the Band 9 model answers.";
        box.appendChild(note);
      }
    });
  });
})();
