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

/* ===================================================================
   IELTS LISTENING AUDIO ENGINE
   Reads the transcript aloud with distinct voices per speaker using
   the browser's built-in speech synthesis. If a real recording (mp3)
   exists at the audio element's src, the native player is kept and
   this engine steps aside - so human-recorded audio can be added
   later with zero code changes.
   =================================================================== */
(function () {
  "use strict";

  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return;

  var players = [];      /* all mounted players (so only one plays at a time) */
  var VOICES = null;     /* cached ranked voice list */

  /* ---------- voice selection ---------- */
  var PREFERRED = [
    "Google UK English Female", "Google UK English Male", "Google US English",
    "Daniel", "Samantha", "Karen", "Arthur", "Martha", "Serena",
    "Moira", "Tessa", "Alex", "Aaron", "Nicky", "Fiona", "Kate", "Oliver"
  ];

  function rankVoices() {
    var all = window.speechSynthesis.getVoices() || [];
    var en = all.filter(function (v) { return /^en[-_]/i.test(v.lang) || v.lang === "en"; });
    if (!en.length) en = all;
    en.sort(function (a, b) {
      var ia = PREFERRED.indexOf(a.name), ib = PREFERRED.indexOf(b.name);
      if (ia === -1) ia = 999; if (ib === -1) ib = 999;
      if (ia !== ib) return ia - ib;
      /* prefer British, then local voices */
      var ga = /GB/i.test(a.lang) ? 0 : 1, gb = /GB/i.test(b.lang) ? 0 : 1;
      if (ga !== gb) return ga - gb;
      return (b.localService ? 1 : 0) - (a.localService ? 1 : 0);
    });
    /* dedupe by name */
    var seen = {}, out = [];
    en.forEach(function (v) { if (!seen[v.name]) { seen[v.name] = 1; out.push(v); } });
    return out;
  }

  function getVoices() {
    if (VOICES && VOICES.length) return VOICES;
    VOICES = rankVoices();
    return VOICES;
  }
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.addEventListener("voiceschanged", function () { VOICES = rankVoices(); });
  }

  /* Voice/pitch assignment: narrator gets voice 0; each speaker label gets
     the next distinct voice; when voices run out, reuse with varied pitch. */
  function speakerStyle(index) {
    var vs = getVoices();
    if (!vs.length) return { voice: null, pitch: 1, rate: 0.95 };
    var vi = index % vs.length;
    var round = Math.floor(index / vs.length);
    var pitches = [1, 0.88, 1.12, 0.8, 1.2];
    return { voice: vs[vi], pitch: pitches[round % pitches.length], rate: 0.95 };
  }

  /* ---------- transcript parsing ---------- */
  function findListeningHost() {
    return document.getElementById("listening") || document.getElementById("listening-sample");
  }

  function findListeningTranscript(host) {
    if (!host) return null;
    var det = host.querySelectorAll("details");
    for (var i = 0; i < det.length; i++) {
      if (det[i].querySelector(".tx-section")) return det[i];
    }
    for (var j = 0; j < det.length; j++) {
      var sum = det[j].querySelector("summary");
      if (sum && /transcript/i.test(sum.textContent)) return det[j];
    }
    return null;
  }

  /* Split a dialogue paragraph into speaker turns.
     Labels look like "RECEPTIONIST:", "GUIDE:", "R:", "C:" (uppercase + colon). */
  var LABEL_RE = /(^|\s)([A-Z][A-Z .']{0,24}?):\s+/g;

  function parseTurns(text, labelMap) {
    var turns = [], m, last = null, lastIdx = 0;
    LABEL_RE.lastIndex = 0;
    while ((m = LABEL_RE.exec(text)) !== null) {
      if (last !== null) {
        var seg = text.slice(lastIdx, m.index + m[1].length).trim();
        if (seg) turns.push({ speaker: last, text: seg });
      }
      var label = m[2].trim();
      /* map single-letter abbreviations back to the full name (R -> RECEPTIONIST) */
      if (label.length <= 2) {
        var full = labelMap["_" + label.charAt(0)];
        if (full) label = full;
      } else {
        labelMap["_" + label.charAt(0)] = label;
      }
      last = label;
      lastIdx = LABEL_RE.lastIndex;
    }
    if (last !== null) {
      var tail = text.slice(lastIdx).trim();
      if (tail) turns.push({ speaker: last, text: tail });
    } else if (text.trim()) {
      turns.push({ speaker: "NARRATOR", text: text.trim() });
    }
    return turns;
  }

  function parseSections(det) {
    var body = det.querySelector(".body") || det;
    var sections = [], current = null;
    var kids = body.children;
    var SEC_RE = /^SECTION\s+\d+[.:]?\s*/i;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      if (el.tagName === "SUMMARY") continue;
      if (el.classList && el.classList.contains("tx-section")) {
        current = { title: el.textContent.trim(), items: [] };
        sections.push(current);
        continue;
      }
      var txt = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (!txt) continue;
      /* hub-style inline marker: <p><b>SECTION 1.</b> DIALOGUE... */
      var secMatch = txt.match(SEC_RE);
      if (secMatch) {
        current = { title: secMatch[0].replace(/[.:]\s*$/, "").trim(), items: [] };
        sections.push(current);
        txt = txt.replace(SEC_RE, "").trim();
        if (!txt) continue;
      }
      if (!current) continue;
      if (el.classList && el.classList.contains("tx-narrator")) {
        current.items.push({ speaker: "NARRATOR", text: txt });
      } else {
        var labelMap = current._map || (current._map = {});
        parseTurns(txt, labelMap).forEach(function (t) { current.items.push(t); });
      }
    }
    return sections;
  }

  /* ---------- utterance queue ---------- */
  function splitSentences(text) {
    var parts = text.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [text];
    /* hard-split any single sentence that is still too long, at commas/semicolons */
    var pieces = [];
    parts.forEach(function (p) {
      p = p.trim();
      if (!p) return;
      if (p.length <= 200) { pieces.push(p); return; }
      var sub = p.replace(/([,;])\s+/g, "$1\u0000").split("\u0000"), buf2 = "";
      sub.forEach(function (s) {
        if ((buf2 + " " + s).length <= 180) buf2 = buf2 ? buf2 + " " + s : s;
        else { if (buf2) pieces.push(buf2); buf2 = s; }
      });
      if (buf2) pieces.push(buf2);
    });
    /* merge tiny fragments so pacing stays natural, cap length for Chrome */
    var out = [], buf = "";
    pieces.forEach(function (p) {
      if ((buf + " " + p).length <= 170) buf = buf ? buf + " " + p : p;
      else { if (buf) out.push(buf); buf = p; }
    });
    if (buf) out.push(buf);
    return out;
  }

  function buildQueue(items) {
    var q = [], speakerIndex = {}, nextIdx = 1; /* 0 reserved for narrator */
    items.forEach(function (it) {
      var idx;
      if (it.speaker === "NARRATOR") idx = 0;
      else {
        if (!(it.speaker in speakerIndex)) speakerIndex[it.speaker] = nextIdx++;
        idx = speakerIndex[it.speaker];
      }
      var chunks = splitSentences(it.text);
      chunks.forEach(function (c, ci) {
        var lastChunk = ci === chunks.length - 1;
        var gap = lastChunk ? (it.speaker === "NARRATOR" ? 1800 : 550) : 220;
        q.push({ text: c, styleIndex: idx, gapAfter: gap });
      });
    });
    return q;
  }

  /* ---------- player ---------- */
  function stopAll(except) {
    players.forEach(function (p) { if (p !== except) p.stop(true); });
    window.speechSynthesis.cancel();
  }

  function createPlayer(box, section, label) {
    var queue = buildQueue(section.items);
    var idx = 0, playing = false, timer = null;

    var ui = document.createElement("div");
    ui.className = "tts-player";
    ui.innerHTML =
      '<div class="tts-row">' +
        '<button type="button" class="tts-btn tts-play">&#9654; Play</button>' +
        '<button type="button" class="tts-btn tts-restart" title="Restart">&#8634;</button>' +
        '<div class="tts-meta"><div class="tts-status">Ready \u00b7 ' + label + "</div>" +
        '<div class="tts-barwrap"><div class="tts-bar"></div></div></div>' +
      "</div>" +
      '<p class="tts-note">Computer-generated practice voices &middot; different speakers have different voices. ' +
      "In the real exam you will hear recorded human voices. Audio in the exam plays <b>once only</b> &mdash; " +
      "for best practice, avoid replaying.</p>";

    var playBtn = ui.querySelector(".tts-play");
    var restartBtn = ui.querySelector(".tts-restart");
    var status = ui.querySelector(".tts-status");
    var bar = ui.querySelector(".tts-bar");

    function setStatus(t) { status.textContent = t; }
    function setBar() { bar.style.width = (queue.length ? Math.round(idx / queue.length * 100) : 0) + "%"; }

    function speakNext() {
      if (!playing) return;
      if (idx >= queue.length) {
        playing = false;
        playBtn.innerHTML = "&#9654; Play again";
        setStatus("Finished \u00b7 " + label);
        setBar();
        return;
      }
      var item = queue[idx];
      var st = speakerStyle(item.styleIndex);
      var u = new SpeechSynthesisUtterance(item.text);
      if (st.voice) u.voice = st.voice;
      u.pitch = st.pitch; u.rate = st.rate; u.lang = (st.voice && st.voice.lang) || "en-GB";
      u.onend = function () {
        idx++;
        setBar();
        setStatus("Playing " + Math.min(idx + 1, queue.length) + " / " + queue.length + " \u00b7 " + label);
        if (playing) timer = setTimeout(speakNext, item.gapAfter);
      };
      u.onerror = function () {
        idx++;
        if (playing) timer = setTimeout(speakNext, 150);
      };
      window.speechSynthesis.speak(u);
    }

    var self = {
      stop: function (silent) {
        playing = false;
        clearTimeout(timer);
        if (!silent) window.speechSynthesis.cancel();
        playBtn.innerHTML = "&#9654; " + (idx > 0 && idx < queue.length ? "Resume" : "Play");
      },
      start: function () {
        stopAll(self);
        /* nudge voice list on first user gesture (required on some browsers) */
        getVoices();
        playing = true;
        playBtn.innerHTML = "&#10074;&#10074; Pause";
        setStatus("Playing " + (idx + 1) + " / " + queue.length + " \u00b7 " + label);
        speakNext();
      }
    };

    playBtn.addEventListener("click", function () {
      if (playing) { self.stop(); setStatus("Paused \u00b7 " + label); }
      else self.start();
    });
    restartBtn.addEventListener("click", function () {
      self.stop();
      idx = 0; setBar();
      self.start();
    });

    players.push(self);
    box.appendChild(ui);
  }

  /* ---------- styles ---------- */
  function injectStyles() {
    var css =
      ".tts-player{margin-top:.6rem}" +
      ".tts-row{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}" +
      ".tts-btn{border:0;border-radius:999px;padding:.55rem 1.1rem;font-weight:700;cursor:pointer;" +
        "background:#15604A;color:#fff;font-family:inherit;font-size:.9rem;transition:background .2s}" +
      ".tts-btn:hover{background:#0B3026}" +
      ".tts-restart{padding:.55rem .8rem;background:#CBA15B;color:#0B3026}" +
      ".tts-restart:hover{background:#b78d47}" +
      ".tts-meta{flex:1;min-width:160px}" +
      ".tts-status{font-size:.82rem;font-weight:600;color:#0B3026;margin-bottom:.25rem}" +
      ".tts-barwrap{height:6px;background:rgba(11,48,38,.12);border-radius:3px;overflow:hidden}" +
      ".tts-bar{height:100%;width:0;background:linear-gradient(90deg,#CBA15B,#15604A);border-radius:3px;transition:width .3s}" +
      ".tts-note{font-size:.75rem;color:#6B645A;margin:.5rem 0 0;line-height:1.5}";
    var s = document.createElement("style");
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---------- mounting ---------- */
  function mount() {
    if (mount._done) return;
    mount._done = true;
    var host = findListeningHost();
    var det = findListeningTranscript(host);
    if (!det) return;
    var sections = parseSections(det);
    if (!sections.length) return;

    var boxes = host.querySelectorAll(".audiobox");
    if (!boxes.length) return;

    injectStyles();

    Array.prototype.forEach.call(boxes, function (box, i) {
      var section = sections[i];
      if (!section) return;
      var audio = box.querySelector("audio");
      var src = audio && (audio.currentSrc || (audio.querySelector("source") && audio.querySelector("source").src));
      var label = "Section " + (i + 1);

      function useTTS() {
        if (audio) audio.style.display = "none";
        createPlayer(box, section, label);
      }

      if (!src) { useTTS(); return; }
      /* keep the native player only if a real recording actually exists */
      fetch(src, { method: "HEAD" }).then(function (r) {
        if (!r.ok) useTTS();
      }).catch(useTTS);
    });

    window.addEventListener("beforeunload", function () { window.speechSynthesis.cancel(); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { stopAll(null); players.forEach(function (p) { p.stop(true); }); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
