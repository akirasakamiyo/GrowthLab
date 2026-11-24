# Musik + efek suara original untuk promo GrowthLab 60 dtk (ambient elektronik, 96 bpm, Am-F-C-G).
# Loop mulus: dirender 64 dtk, ekor setelah 60 dtk dilipat ke awal, tanpa fade di ujung.
# python music60.py out.wav
import numpy as np, wave, sys
SR = 48000; D = 60.0; N = int(SR * 64); out = np.zeros((N, 2)); rng = np.random.default_rng(12)
def add(sig, start, pan=0.0, g=1.0):
    i = int(start * SR)
    if i < 0 or i >= N: return
    j = min(N, i + len(sig)); s = sig[:j - i] * g
    out[i:j, 0] += s * (1 - pan) * .6; out[i:j, 1] += s * (1 + pan) * .6
def env(n, a, r):
    e = np.ones(n); A = max(1, int(a * SR)); R = max(1, int(r * SR)); e[:A] = np.linspace(0, 1, A); e[-R:] *= np.linspace(1, 0, R); return e
nf = lambda m: 440 * 2 ** ((m - 69) / 12)
bpm = 96; beat = 60 / bpm; bar = beat * 4                     # 24 bar pas 60 dtk
PROG = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [48, 55, 60, 64, 67], [43, 50, 55, 59, 62]]
# intensitas per waktu: intro tipis, naik, groove, lalu kembali tipis di akhir (sama dengan awal)
def lvl(t):
    if t < 7: return 0.0
    if t < 11.7: return (t - 7) / 4.7 * .5
    if t < 52: return 1.0
    if t < 57: return 1.0 - (t - 52) / 5 * .8
    return max(0.0, .2 - (t - 57) / 3 * .2)
for b in range(25):
    c = PROG[b % 4]; st = b * bar; n = int(bar * 1.6 * SR); tt = np.arange(n) / SR
    pad = sum(np.sin(2 * np.pi * nf(m + 12) * 2 ** (d / 12) * tt + rng.random() * 6) for m in c[1:] for d in (-.07, .07))
    add(pad * env(n, 1.2, 1.4) * .026, st)
    sub = np.sin(2 * np.pi * nf(c[0] - 12) * tt) * env(n, .8, 1.2)
    add(sub * .05, st)
    for k in range(8):                                          # denyut lembut (selalu, supaya awal = akhir)
        t0 = st + k * beat / 2; n2 = int(.3 * SR); t2 = np.arange(n2) / SR
        add(np.sin(2 * np.pi * nf(c[0]) * t2) * np.exp(-t2 * 14) * .035, t0, pan=.3 * np.sin(k))
    for k in range(4):
        t0 = st + k * beat; L = lvl(t0)
        if L > .05:
            n2 = int(.4 * SR); t2 = np.arange(n2) / SR; f = 55 * np.exp(-t2 * 22) + 46
            add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t2 * 9) * .32 * L, t0)
        if L > .5 and k in (1, 3):
            n5 = int(.18 * SR); sn = np.convolve(rng.standard_normal(n5), np.ones(4) / 4, 'same') * np.exp(-np.arange(n5) / SR * 28)
            add(sn * .07 * L, t0, pan=-.1)
    for k in range(8):
        t0 = st + k * beat / 2; L = lvl(t0)
        if L > .3:
            n3 = int(.05 * SR); h = np.diff(rng.standard_normal(n3), prepend=0) * np.exp(-np.arange(n3) / SR * 120)
            add(h * (.028 if k % 2 else .016) * L, t0, pan=.3)
        if L > .15:
            arp = [c[1] + 12, c[3] + 12, c[2] + 24, c[4] + 12, c[3] + 24, c[4] + 12, c[2] + 24, c[3] + 12]
            m = arp[k]; n2 = int(.5 * SR); t2 = np.arange(n2) / SR; f = nf(m)
            add((np.sin(2 * np.pi * f * t2) + .3 * np.sin(4 * np.pi * f * t2)) * np.exp(-t2 * 7) * .05 * L, t0, pan=.45 * np.sin(k * 1.7))
def whoosh(c, g=.22, d=1.0):
    n = int(d * SR); w = np.convolve(rng.standard_normal(n), np.ones(40) / 40, 'same'); e = np.sin(np.linspace(0, np.pi, n)) ** 3
    add(w * e * g, c - d * .55, pan=rng.uniform(-.3, .3))
def tick(c, g=.16, f=1800):
    n = int(.06 * SR); tt = np.arange(n) / SR; add(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 90) * g, c)
def pop(c, g=.14, f0=520, f1=1150):
    n = int(.14 * SR); tt = np.arange(n) / SR; f = np.linspace(f0, f1, n); add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 26) * g, c)
def chime(c, notes=(76, 79, 84, 88), g=.1, dt=.07, dec=2.8):
    for k, m in enumerate(notes):
        n = int(2.0 * SR); tt = np.arange(n) / SR; f = nf(m); add((np.sin(2 * np.pi * f * tt) + .2 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt * dec) * g, c + k * dt, pan=.25 * (k - 1.5))
def riser(a, b, g=.12):
    n = int((b - a) * SR); tt = np.arange(n) / SR; nz = np.convolve(rng.standard_normal(n), np.ones(8) / 8, 'same')
    add(nz * (tt / tt[-1]) ** 2.2 * g, a)
def impact(c, g=.55):
    n = int(2.2 * SR); tt = np.arange(n) / SR
    add(np.sin(2 * np.pi * np.cumsum(70 * np.exp(-tt * 5) + 36) / SR) * np.exp(-tt * 2.6) * g, c)
    nz = np.convolve(rng.standard_normal(n), np.ones(20) / 20, 'same') * np.exp(-tt * 3.5); add(nz * .25, c)
# efek di titik animasi (detik)
for c in (.8, 1.2, 1.8, 2.2, 2.6): tick(c, .1, 1500 + 200 * rng.random())
chime(4.45, (72, 79, 84), .09)
for c in (4.2, 7.0, 15.2, 20.4, 24.4, 34.2, 38.4, 43.3, 47.8, 52.2, 54.9, 57.4): whoosh(c)
for i in range(5): pop(7.5 + i * .3, f0=480 + i * 70, f1=1050 + i * 90)
whoosh(9.6, .18, 1.6); riser(9.6, 11.7, .14); impact(11.7)
chime(12.0, (69, 76, 81, 84, 88), .08, .09, 1.8)
for c in (26.0, 28.6, 31.2): tick(c, .14, 2200); whoosh(c - .2, .12, .7)
chime(34.6, (79, 84, 88), .1); pop(38.5, .12, 700, 1500); pop(38.75, .1, 800, 1600)
for k in range(6): tick(45.4 + k * .3, .07, 2600)
for c in (52.2, 52.65, 53.1): tick(c, .12, 1900)
chime(55.0, (72, 76, 79, 84, 88), .1, .08, 2.0)
# lipat ekor ke awal supaya loop mulus, lalu normalisasi
T = int(SR * D); tail = out[T:]; out = out[:T].copy(); out[:len(tail)] += tail
out /= np.max(np.abs(out)) * 1.15
w = wave.open(sys.argv[1], "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close(); print("ok", sys.argv[1])
