import re
import unicodedata


def generate_slug(text: str) -> str:
    """
    Genera un slug URL-friendly a partir de un texto.

    - Normaliza caracteres Unicode (elimina acentos).
    - Convierte a minúsculas.
    - Reemplaza espacios y caracteres no alfanuméricos por guiones.
    - Elimina guiones duplicados y guiones al inicio/final.
    """

    normalized = unicodedata.normalize("NFKD", text)

    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")

    lowered = ascii_text.lower()

    slug = re.sub(r"[^a-z0-9]+", "-", lowered)

    slug = slug.strip("-")

    return slug
