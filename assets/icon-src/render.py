"""Render CryoHealth app icons from the brand mark (src: cryohealth/src/assets/cryohealth-logo-mark.svg).

Run from this directory: python3 render.py  -> writes into ../images/
"""
from PIL import Image, ImageDraw

SS = 4  # supersampling factor
TOP, BOTTOM = (0x1A, 0x82, 0xC4), (0x0A, 0x4D, 0x76)  # brand accent (#0f6ea8) ramp to accentInk
STROKE = 3.4
# Mark geometry in the 48x48 viewBox, centred on (24, 23.5)
TRIANGLE = [(24, 7), (43, 40), (5, 40), (24, 7)]
PULSE = [(2, 30), (10, 30), (13.5, 23.5), (18, 37), (22.5, 28), (25.1, 32), (46, 32)]
CENTRE = (24, 23.5)


def gradient(size):
    img = Image.new("RGBA", (size, size))
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        d.line([(0, y), (size, y)], fill=tuple(round(a + (b - a) * t) for a, b in zip(TOP, BOTTOM)) + (255,))
    return img


def mark(size, scale, colour=(255, 255, 255, 255)):
    """Transparent canvas with the mark scaled by `scale` px per viewBox unit, centred."""
    big = size * SS
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    s = scale * SS * size / 1024
    w = STROKE * s
    tx = lambda p: (big / 2 + (p[0] - CENTRE[0]) * s, big / 2 + (p[1] - CENTRE[1]) * s)
    for pts in (TRIANGLE, PULSE):
        pts = [tx(p) for p in pts]
        d.line(pts, fill=colour, width=round(w))
        for x, y in pts:  # round joins + caps
            d.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill=colour)
    return img.resize((size, size), Image.LANCZOS)


def save(img, name, size):
    img.save(f"../images/{name}", optimize=True)
    print(name, size)


# Full-bleed square (Play Store hi-res + Expo icon): mark ~62% wide
FULL_SCALE = 14.4
# Adaptive layers: farthest stroke edge ~27 units from centre must sit inside Android's
# 66dp-of-108dp safe circle (radius ~313px @1024) => scale 11
ADAPTIVE_SCALE = 11

for size, name in [(1024, "icon.png"), (512, "play-store-icon-512.png")]:
    bg = gradient(size)
    bg.alpha_composite(mark(size, FULL_SCALE))
    # Play Console wants 32-bit RGBA; the App Store rejects any alpha channel on icon.png
    save(bg if name.startswith("play-store") else bg.convert("RGB"), name, size)

save(gradient(512).convert("RGB"), "android-icon-background.png", 512)
save(mark(512, ADAPTIVE_SCALE), "android-icon-foreground.png", 512)
save(mark(432, ADAPTIVE_SCALE), "android-icon-monochrome.png", 432)
