# OGP 画像(app/public/ogp.png)の生成スクリプト。ロゴやブランド変更時に再実行する。
#   実行: py app/scripts/make-ogp.py(リポジトリルートから。要 Pillow)
# favicon.ico(256x256 PNG 内蔵)を中央に配置し、下端にサイトヘッダーと同じ
# Google 4色のアクセントバー(app.css の --gdg-*)を敷いた 1200x630 の PNG を出力する。
from pathlib import Path

from PIL import Image

APP_DIR = Path(__file__).resolve().parents[1]
SRC = APP_DIR / "public" / "favicon.ico"
DST = APP_DIR / "public" / "ogp.png"

W, H = 1200, 630  # OGP 推奨サイズ(og:image:width / height と一致させること)
BAR_H = 24
LOGO = 320
COLORS = ["#4285f4", "#ea4335", "#fbbc04", "#34a853"]  # blue / red / yellow / green

icon = Image.open(SRC)
icon.size = (256, 256)  # ICO は最大サイズを明示して読む
icon = icon.convert("RGBA").resize((LOGO, LOGO), Image.LANCZOS)

canvas = Image.new("RGB", (W, H), "#ffffff")
seg = W // 4
for i, color in enumerate(COLORS):
    canvas.paste(Image.new("RGB", (seg, BAR_H), color), (i * seg, H - BAR_H))
cx = (W - LOGO) // 2
cy = (H - BAR_H - LOGO) // 2
canvas.paste(icon, (cx, cy), icon)

canvas.save(DST, "PNG", optimize=True)
print(f"saved: {DST} {canvas.size}")
