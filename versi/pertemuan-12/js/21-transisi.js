/* Transisi antarhalaman acak: dipakai oleh handler hashchange di js/09-app.js.
   Daftar varian ada di css/14-transisi.css ("" = tirai naik, transisi lama). Varian yang sama tidak muncul dua kali berturut-turut. */
(() => {
  const V = ["", "v-down", "v-left", "v-right", "v-blinds", "v-shutter", "v-diag", "v-circle", "v-pop", "v-fade"];
  let last = null;
  window.pickTrans = () => {
    let v;
    do v = V[Math.floor(Math.random() * V.length)]; while (v === last && V.length > 1);
    return (last = v);
  };
})();
