from PIL import Image
from pathlib import Path

src = Path(
    r"C:\Users\priya\.cursor\projects\c-Users-priya-OneDrive-Desktop-EB-Claims\assets"
)
dst = Path(r"C:\Users\priya\OneDrive\Desktop\EB+Claims\public\assets")
(dst / "icons").mkdir(parents=True, exist_ok=True)

mapping = {
    "c__Users_priya_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Book-31673052-697d-4dae-b941-76dde609ea8a.png": "icons/books.png",
    "c__Users_priya_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Hand_Money-0cd65e45-83d9-4ed1-9bb8-85b1036f4282.png": "icons/driver.png",
    "c__Users_priya_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Card-f825c84b-f568-49ba-8601-b4413a2397e6.png": "icons/card.png",
    "c__Users_priya_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Fuel-0518e136-12b2-49d6-8093-d3ecb0262500.png": "icons/fuel.png",
    "c__Users_priya_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Icon-1-842704c5-5912-4ada-b87d-399444d96744.png": "icons/gift.png",
    "c__Users_priya_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Phone-7dfea0fb-244f-422a-9d63-391474d7b12f.png": "icons/mobile.png",
    "c__Users_priya_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Icon-4041dd3b-353c-4801-9b6f-542e15130a8c.png": "icons/meal.png",
    "c__Users_priya_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_plus-8db6b5f7-94c2-4d9f-a507-92dada2b9103.png": "icons/plus.png",
    "c__Users_priya_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Hamburger_Menu-233e732a-24d1-441e-af11-107189c63024.png": "icons/menu.png",
    "c__Users_priya_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_logo-c1893ddc-c105-4e6a-8f7c-835e7ba00b6b.png": "brand-logo.png",
    "c__Users_priya_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_pinelabs-c4d4c323-d8e2-41ec-b126-785e18c58a5f.png": "pine-labs-logo.png",
    "c__Users_priya_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_send-3cbbbf0c-f922-4c73-9a0a-fbabe4c7913a.png": "icons/send.png",
    "c__Users_priya_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Square_Academic_Cap-4c2feefc-c206-4663-9e6c-4316d2cfe9b4.png": "icons/professional.png",
}


def knock_out_black(im: Image.Image, threshold: int = 28) -> Image.Image:
    im = im.convert("RGBA")
    pixels = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r <= threshold and g <= threshold and b <= threshold:
                pixels[x, y] = (r, g, b, 0)
            else:
                lum = (r + g + b) / 3
                if lum < threshold * 2.2:
                    soft = max(
                        0, min(255, int((lum - threshold) / (threshold * 1.2) * 255))
                    )
                    pixels[x, y] = (r, g, b, soft)
    return im


for name, out_rel in mapping.items():
    path = src / name
    out = dst / out_rel
    im = Image.open(path)
    cleaned = knock_out_black(im)
    if out_rel.startswith("icons/"):
        cleaned = cleaned.resize((96, 96), Image.Resampling.LANCZOS)
    elif out_rel == "brand-logo.png":
        cleaned = cleaned.resize((256, 256), Image.Resampling.LANCZOS)
    elif out_rel == "pine-labs-logo.png":
        w, h = cleaned.size
        scale = max(2, int(240 / max(w, 1)))
        cleaned = cleaned.resize((w * scale, h * scale), Image.Resampling.LANCZOS)
    cleaned.save(out, "PNG")
    print(f"wrote {out_rel} ({cleaned.size})")
