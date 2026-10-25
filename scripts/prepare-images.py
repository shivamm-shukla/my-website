"""Make small web assets from the owner's originals without changing the originals."""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parent.parent / "public" / "images"
output = root / "optimized"
output.mkdir(exist_ok=True)

assets = [
    ("home.png", "hero-light.webp", (1120, 1120), (0.5, 0.5)),
    ("home-dark.png", "hero-dark.webp", (1120, 1120), (0.5, 0.5)),
    ("blog.png", "blog-blue.webp", (960, 540), (0.5, 0.5)),
    ("brg-cli.png", "blog-lilac.webp", (960, 540), (0.5, 0.5)),
    ("about-journey.png", "blog-peach.webp", (960, 540), (0.35, 0.5)),
]

for source, name, size, centering in assets:
    image = Image.open(root / source).convert("RGB")
    width, height = image.size
    # The supplied images have a small generated sparkle in the lower-right margin.
    image = image.crop((round(width * .05), round(height * .05), round(width * .95), round(height * .92)))
    image = ImageOps.fit(image, size, Image.Resampling.LANCZOS, centering=centering)
    image.save(output / name, "WEBP", quality=88, method=6)
    print(f"{name}: {size[0]} × {size[1]}, {(output / name).stat().st_size // 1024} KiB")

icon_source = Image.open(root / "not-found.png").convert("RGB")
width, height = icon_source.size
icon_source = icon_source.crop((round(width * .08), round(height * .06), round(width * .90), round(height * .90)))
icon = ImageOps.fit(icon_source, (256, 256), Image.Resampling.LANCZOS, centering=(.5, .45))
icon.save(root.parent.parent / "app" / "icon.png", "PNG", optimize=True)
print("app/icon.png: 256 × 256")
