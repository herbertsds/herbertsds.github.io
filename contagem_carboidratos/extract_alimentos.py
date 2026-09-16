import json
import re
import pdfplumber

PDF_PATH = "contagem_carboidratos/manual-contagem-carboidratos-web-1.pdf"
OUT_PATH = "contagem_carboidratos/app/public/alimentos.json"

HEADER = ["Alimento", "Medida usual", "g ou ml", "CHO (g)", "Calorias\n(kcal)"]


def clean_text(s):
    if s is None:
        return ""
    return re.sub(r"\s+", " ", s.replace("\n", " ")).strip()


def parse_number(s):
    if s is None:
        return None
    s = clean_text(s)
    if s == "" or s == "-":
        return None
    s = s.replace(".", "").replace(",", ".")
    try:
        val = float(s)
    except ValueError:
        return None
    if val.is_integer():
        return int(val)
    return val


def main():
    rows = []
    problems = []

    with pdfplumber.open(PDF_PATH) as pdf:
        for page_idx, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            for table in tables:
                if not table:
                    continue
                for row in table:
                    if row == HEADER:
                        continue
                    if len(row) != 5:
                        problems.append((page_idx + 1, row))
                        continue
                    alimento_raw, medida_raw, qtd_raw, cho_raw, kcal_raw = row
                    alimento = clean_text(alimento_raw)
                    medida = clean_text(medida_raw)
                    if not alimento and not medida:
                        continue
                    qtd = parse_number(qtd_raw)
                    cho = parse_number(cho_raw)
                    kcal = parse_number(kcal_raw)
                    if not alimento or qtd is None or cho is None or kcal is None:
                        problems.append((page_idx + 1, row))
                        continue
                    rows.append(
                        {
                            "id": f"a{len(rows) + 1:04d}",
                            "alimento": alimento,
                            "medida": medida,
                            "quantidade_g_ml": qtd,
                            "carboidratos_g": cho,
                            "calorias_kcal": kcal,
                            "quantidade_indefinida": qtd == 0,
                        }
                    )

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)

    print(f"Total rows extracted: {len(rows)}")
    print(f"Problem rows: {len(problems)}")
    for p in problems[:30]:
        print(p)


if __name__ == "__main__":
    main()
