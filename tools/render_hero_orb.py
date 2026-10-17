"""Bake the hero orb's spin, float and breathing glow into one seamless loop video.

Phones play video on the hardware decoder, so it stays smooth while scrolling
(stacked CSS animations under a blurred sticky nav glitched in iPhone Safari).

Loop = 42 s: one full turn, 6 floats (7 s each), 7 glow breaths (6 s each).
Run from the repo root:  python tools/render_hero_orb.py   (needs Pillow, numpy, ffmpeg)
"""
import subprocess
import numpy as np
from PIL import Image

SRC, OUT, POSTER = "assets/hero-orb.webp", "assets/hero-orb.mp4", "assets/hero-orb-poster.webp"
SIZE, ORB, FPS, LOOP = 1060, 870, 30, 42  # canvas matches the old 560px glow box around the 460px orb
OUT_PX = 720                              # encoded size; ~74vw on a phone

orb = Image.open(SRC).convert("RGB")
yy, xx = np.mgrid[0:SIZE, 0:SIZE]
r = np.hypot(xx - SIZE / 2, yy - SIZE / 2) / (SIZE / 2)
glow_rgb = np.array([120, 150, 255], dtype=np.float32) / 255


def glow(scale, opacity):
    # same stops as the old CSS radial-gradient: 0.16 -> 0.04 at 45% -> 0 at 70%
    d = r / scale
    a = np.interp(d, [0, 0.45, 0.70], [0.16, 0.04, 0.0]) * opacity
    return a[..., None] * glow_rgb


def ease(t, period):  # 0 -> 1 -> 0, ease-in-out
    return (1 - np.cos(2 * np.pi * t / period)) / 2


def frame(t):
    k = ease(t, 6)
    base = glow(1 + 0.12 * k, 1 - 0.4 * k)
    spun = orb.rotate(-360 * t / LOOP, resample=Image.BICUBIC, fillcolor=(0, 0, 0))
    layer = np.zeros((SIZE, SIZE, 3), dtype=np.float32)
    dy = int(round(-12 * (ORB / 460) * ease(t, 7)))  # old CSS float was 12px on a 460px orb
    o = (SIZE - ORB) // 2
    layer[o + dy:o + dy + ORB, o:o + ORB] = np.asarray(spun, dtype=np.float32) / 255
    out = 1 - (1 - base) * (1 - layer)  # screen blend: black orb background lets the glow through
    return Image.fromarray((out * 255).round().astype(np.uint8))


ff = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{SIZE}x{SIZE}",
     "-r", str(FPS), "-i", "-", "-vf", f"scale={OUT_PX}:{OUT_PX}:flags=lanczos",
     "-c:v", "libx264", "-preset", "slow", "-crf", "30", "-pix_fmt", "yuv420p",
     "-movflags", "+faststart", "-an", OUT],
    stdin=subprocess.PIPE,
)
for i in range(FPS * LOOP):
    img = frame(i / FPS)
    if i == 0:
        img.resize((OUT_PX, OUT_PX), Image.LANCZOS).save(POSTER, quality=82)
    ff.stdin.write(img.tobytes())
ff.stdin.close()
assert ff.wait() == 0
print("wrote", OUT, POSTER)
