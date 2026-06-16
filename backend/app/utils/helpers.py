from bson import ObjectId
from typing import Any, Optional
import re


def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable dict."""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == "_id":
            result["id"] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, list):
            result[key] = [serialize_doc(i) if isinstance(i, dict) else
                           str(i) if isinstance(i, ObjectId) else i for i in value]
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        else:
            result[key] = value
    return result


def to_object_id(id_str: str) -> Optional[ObjectId]:
    try:
        return ObjectId(id_str)
    except Exception:
        return None


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")
