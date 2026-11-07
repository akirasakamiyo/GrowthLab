/* Uji pemahaman (2026-11-07): soal studi kasus, soal dua tingkat (jawaban + alasan), dan
   "jelaskan dengan kata-katamu" di setiap pelajaran. Di akhir muncul tingkat pemahaman
   (paham betul / hampir paham / perlu baca ulang) beserta bagian materi yang perlu dibaca lagi.
   Hasil tersimpan di localStorage "gl-uji". */
window.GLUJI = (() => {
  const KEY = "gl-uji", LT = "ABCD";
  const h = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (v == null) continue; if (k === "html") e.innerHTML = v; else if (k.startsWith("on")) e[k] = v; else e.setAttribute(k, v) } kids.flat().forEach(c => c != null && e.append(c)); return e };
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}") } catch (e) { return {} } };
  const save = d => { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch (e) {} };
  const mix = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  const TYPE = { kasus: "Studi kasus", dua: "Jawaban + alasan", jelas: "Jelaskan pakai kata-katamu" };

  function mount(box, i, j) {
    const key = i + "-" + j, D = (window.GLUJI_DATA || {})[key];
    if (!D) { box.remove(); return }
    box.textContent = ""; box.classList.add("lab", "uji"); box.dataset.title = "Uji pemahaman";
    const prev = load()[key];
    box.append(h("div", { class: "lab-h" },
      h("span", { class: "lab-tag" }, h("i", { "aria-hidden": "true" }), "Uji pemahaman"),
      h("h3", {}, "Seberapa paham kamu?"),
      h("p", { class: "lab-d" }, "Bukan soal hafalan. Coba terapkan materinya ke situasi nyata, lalu cek alasanmu. Kalau keliru, baca penjelasannya, bukan cuma kuncinya." + (prev ? ` Hasil terakhirmu: ${prev.label}.` : ""))));
    const body = h("div", { class: "uj-b" }); box.append(body);
    const sc = new Array(D.length).fill(null);
    const sum = h("div", { class: "uj-sum", "aria-live": "polite" });
    D.forEach((it, n) => body.append(item(it, n, v => { sc[n] = v; done() })));
    body.append(sum);

    function done() {
      if (sc.some(v => v == null)) return;
      const tot = sc.reduce((a, b) => a + b, 0) / sc.length, pct = Math.round(tot * 100);
      const lv = tot >= .85 ? ["Paham betul", "good", "Kamu bisa menerapkan materi ini ke situasi nyata. Lanjut ke pelajaran berikutnya!"] : tot >= .6 ? ["Hampir paham", "mid", "Dasarnya sudah kena, tapi ada bagian yang masih goyah. Baca ulang bagian di bawah, lalu coba lagi."] : ["Perlu baca ulang", "bad", "Belum apa-apa, ini justru gunanya uji pemahaman. Baca lagi bagian di bawah dengan pelan, lalu ulangi."];
      const weak = [...new Set(D.map((it, n) => sc[n] < 1 ? it.bag : null).filter(b => b != null))];
      sum.className = "uj-sum " + lv[1]; sum.textContent = "";
      sum.append(h("div", { class: "uj-lv" }, h("b", {}, lv[0]), h("span", {}, `${pct}%`)), h("p", {}, lv[2]));
      if (weak.length) {
        const art = box.closest("article") || document;
        sum.append(h("p", { class: "uj-rd" }, "Bagian yang disarankan untuk dibaca ulang:"), h("div", { class: "uj-links" }, weak.map(b => { const hh = art.querySelector(`#s-${b}`); return hh ? h("button", { type: "button", class: "chip", onclick: () => go(hh) }, hh.textContent.trim()) : null })));
      }
      sum.append(h("div", { class: "lab-row" }, h("button", { type: "button", class: "btn", onclick: () => { mount(box, i, j); box.scrollIntoView({ block: "start" }) } }, "Ulangi uji pemahaman")));
      const d = load(); d[key] = { pct, label: lv[0], t: Date.now() }; save(d);
      try { window.GLG && GLG.emit && GLG.emit("uji", { k: key, pct }) } catch (e) {}
    }
  }
  function go(el) { const y = Math.max(0, el.getBoundingClientRect().top + scrollY - 110); try { if (window.__lenis) { window.__lenis.scrollTo(y, { force: true }); return } } catch (e) {} scrollTo({ top: y, behavior: "smooth" }) }

  function item(it, n, cb) {
    const wrap = h("div", { class: "uj-i uj-" + it.t }, h("span", { class: "uj-k" }, `Soal ${n + 1} · ${TYPE[it.t]}`.replace(" · ", ", ")), h("p", { class: "uj-q" }, it.s));
    if (it.t === "kasus") {
      const fb = h("div", { class: "uj-fb", "aria-live": "polite" });
      const opts = mix(it.o.map((o, k) => ({ o, k })));
      const g = h("div", { class: "uj-opts" }, opts.map(({ o }, k) => h("button", { type: "button", class: "uj-opt", onclick: e => {
        const bs = [...g.children]; bs.forEach(b => b.disabled = true); const me = e.currentTarget; me.classList.add(o[1] ? "ok" : "no");
        fb.textContent = ""; const tx = o[2].replace(/^Tepat\.\s*/, ""); fb.append(h("p", { class: o[1] ? "good" : "bad" }, h("b", {}, o[1] ? "Tepat. " : "Belum tepat. "), tx));
        if (!o[1]) { const c = opts.findIndex(x => x.o[1]); bs[c].classList.add("ok", "key"); fb.append(h("p", { class: "good" }, h("b", {}, `Jawaban yang paling tepat: ${LT[c]}. `), opts[c].o[2].replace(/^Tepat\.\s*/, ""))) }
        cb(o[1] ? 1 : 0) } }, h("b", { "aria-hidden": "true" }, LT[k]), h("span", {}, o[0]))));
      wrap.append(g, fb);
    } else if (it.t === "dua") {
      const fb = h("div", { class: "uj-fb", "aria-live": "polite" }), step2 = h("div", { class: "uj-step2", hidden: "" });
      let a = null;
      const g1 = h("div", { class: "uj-opts two" }, it.o.map(o => h("button", { type: "button", class: "uj-opt", onclick: e => { [...g1.children].forEach(b => b.disabled = true); e.currentTarget.classList.add("pick"); a = o[1]; step2.hidden = false } }, h("span", {}, o[0]))));
      const rs = mix(it.r.slice());
      const g2 = h("div", { class: "uj-opts" }, rs.map((r, k) => h("button", { type: "button", class: "uj-opt", onclick: e => {
        const bs = [...g2.children]; bs.forEach(b => b.disabled = true); e.currentTarget.classList.add(r[1] ? "ok" : "no");
        [...g1.children].forEach((b, k2) => b.classList.add(it.o[k2][1] ? "ok" : (b.classList.contains("pick") ? "no" : "dim")));
        const v = (a ? .5 : 0) + (r[1] ? .5 : 0);
        const msg = a && r[1] ? ["good", "Paham. ", "Jawaban dan alasanmu sama-sama tepat."] : a && !r[1] ? ["mid", "Jawabanmu benar, tapi alasannya belum tepat. ", "Kemungkinan kamu masih menebak. Coba pahami alasannya, karena itu yang dipakai saat menghadapi situasi lain."] : !a && r[1] ? ["mid", "Alasanmu sudah benar, tapi kesimpulanmu keliru. ", "Kamu paham konsepnya, tinggal lebih teliti menerapkannya."] : ["bad", "Belum tepat. ", "Jawaban dan alasannya sama-sama keliru. Baca lagi bagian materinya."];
        fb.textContent = ""; fb.append(h("p", { class: msg[0] }, h("b", {}, msg[1]), msg[2]), h("p", { class: r[1] ? "good" : "bad" }, r[2].replace(/^Benar\.\s*/, "")));
        if (!r[1]) { const c = rs.findIndex(x => x[1]); bs[c].classList.add("ok", "key"); fb.append(h("p", { class: "good" }, h("b", {}, "Alasan yang tepat: "), rs[c][0])) }
        cb(v) } }, h("b", { "aria-hidden": "true" }, LT[k]), h("span", {}, r[0]))));
      step2.append(h("p", { class: "uj-q2" }, "Apa alasanmu?"), g2);
      wrap.append(g1, step2, fb);
    } else {
      const ta = h("textarea", { rows: "4", maxlength: "1200", placeholder: "Tulis jawabanmu di sini, minimal satu-dua kalimat…", "aria-label": "Jawabanmu" });
      const btn = h("button", { type: "button", class: "btn p", disabled: "" }, "Bandingkan dengan contoh jawaban");
      ta.oninput = () => { btn.disabled = ta.value.trim().length < 20 };
      const out = h("div", { class: "uj-model", hidden: "" });
      btn.onclick = () => {
        btn.hidden = true; ta.readOnly = true; out.hidden = false; out.textContent = "";
        const cks = it.p.map(t => h("label", { class: "uj-ck" }, h("input", { type: "checkbox" }), h("span", {}, t)));
        const fin = h("button", { type: "button", class: "btn p" }, "Selesai menilai");
        const res = h("p", { class: "uj-fbt", "aria-live": "polite" });
        fin.onclick = () => { const n2 = cks.filter(c => c.querySelector("input").checked).length; cks.forEach(c => c.querySelector("input").disabled = true); fin.hidden = true;
          res.className = "uj-fbt " + (n2 === 3 ? "good" : n2 === 2 ? "mid" : "bad");
          res.textContent = n2 === 3 ? "Lengkap. Penjelasanmu sudah memuat semua poin kunci." : n2 === 2 ? "Hampir lengkap. Satu poin kunci belum masuk; lihat lagi contoh jawabannya." : "Poin kuncinya belum banyak masuk. Bandingkan dengan contoh jawaban, lalu coba tulis ulang dengan kata-katamu."; cb(n2 / 3) };
        out.append(h("p", { class: "uj-ml" }, h("b", {}, "Contoh jawaban: "), it.m), h("p", { class: "uj-q2" }, "Centang poin yang sudah ada di jawabanmu (jujur, ya):"), h("div", { class: "uj-cks" }, cks), fin, res);
      };
      wrap.append(ta, h("div", { class: "lab-row" }, btn), out);
    }
    return wrap;
  }
  const count = (i, j) => ((window.GLUJI_DATA || {})[i + "-" + j] || []).length;
  return { mount, count, load };
})();
