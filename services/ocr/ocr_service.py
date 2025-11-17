"""
OCR service: preprocess image -> tesseract -> extract amounts + confidence.
Requirements:
  pip install opencv-python-headless pytesseract numpy Pillow
System: Tesseract (v5+) must be installed on host and in PATH.
"""

import cv2
import numpy as np
import pytesseract
import re
from PIL import Image
import io

# Config
CONFIDENCE_THRESHOLD = 0.80

# Preprocessing function
def preprocess_image_bytes(image_bytes: bytes) -> np.ndarray:
    # load image from bytes
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = np.array(image)
    # convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    # upscale if small
    h, w = gray.shape[:2]
    if max(h, w) < 800:
        scale = 2.0
        gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    # denoise
    gray = cv2.medianBlur(gray, 3)
    # adaptive threshold
    gray = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                 cv2.THRESH_BINARY, 15, 6)
    # deskew - compute angle and rotate
    coords = np.column_stack(np.where(gray > 0))
    if coords.shape[0] > 0:
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = 90 + angle
        if abs(angle) > 0.1:
            (h, w) = gray.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            gray = cv2.warpAffine(gray, M, (w, h),
                                  flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return gray

# Run tesseract and extract amounts + confidences
def ocr_extract_amounts(image_bytes: bytes):
    gray = preprocess_image_bytes(image_bytes)
    # get tesseract result with confidences
    custom_oem_psm_config = "--oem 1 --psm 4 -l eng+osd"
    result = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT, config=custom_oem_psm_config)
    texts = result.get('text', [])
    confs = result.get('conf', [])
    # join text tokens to lines
    lines = {}
    for i, txt in enumerate(texts):
        if txt.strip() == "":
            continue
        line_num = result['line_num'][i]
        if line_num not in lines:
            lines[line_num] = {'text': [], 'conf': []}
        lines[line_num]['text'].append(txt)
        # conf can be -1 for non-confidence tokens
        try:
            conf_val = float(confs[i])
            if conf_val < 0: conf_val = 0.0
        except:
            conf_val = 0.0
        lines[line_num]['conf'].append(conf_val / 100.0)
    # regex to capture NGN amounts and generic numbers
    amount_pattern = re.compile(r'(?:NGN|₦|N\s?|naira\s?)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)', re.I)
    extracted = []
    for ln, data in lines.items():
        text_line = " ".join(data['text'])
        mean_conf = sum(data['conf']) / max(len(data['conf']), 1)
        for m in amount_pattern.finditer(text_line):
            raw = m.group(1)
            # normalize
            num = float(raw.replace(",", ""))
            extracted.append({
                'line': ln,
                'text': text_line,
                'amount': num,
                'confidence': mean_conf
            })
    # decide auto-accept or manual
    auto = [e for e in extracted if e['confidence'] >= CONFIDENCE_THRESHOLD]
    manual = [e for e in extracted if e['confidence'] < CONFIDENCE_THRESHOLD]
    return {
        'all': extracted,
        'auto_import': auto,
        'needs_user_confirm': manual,
        'meta': {
            'ocr_count': len(extracted),
            'avg_confidence': (sum([e['confidence'] for e in extracted]) / max(len(extracted),1)) if extracted else 0.0
        }
    }

# Example usage
if __name__ == "__main__":
    with open("sample_receipt.jpg", "rb") as f:
        data = ocr_extract_amounts(f.read())
    print(data)
