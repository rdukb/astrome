"""
Loader for term definitions JSON into SQLite.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

from src.config.logging import get_logger
from src.db.schema import TermDefinition

logger = get_logger(__name__)

TERM_DEFINITIONS_PATH = Path(__file__).resolve().parent / "term_definitions.json"


def _normalize_definition(raw: dict[str, Any]) -> dict[str, Any]:
    """
    Normalize legacy JSON shape to current DB shape.

    Keeps source JSON untouched while mapping `significance_iyengar`
    to `significance_tradition`.
    """
    normalized = dict(raw)
    if "significance_tradition" not in normalized:
        normalized["significance_tradition"] = normalized.get("significance_iyengar")
    normalized.pop("significance_iyengar", None)
    return normalized


def ensure_term_definition_schema(db: Session) -> None:
    """
    Ensure DB uses `significance_tradition` column name.

    Older local DBs may still have `significance_iyengar`.
    """
    result = db.execute(text("PRAGMA table_info(term_definitions)"))
    columns = {row[1] for row in result.fetchall()}

    if "significance_tradition" not in columns and "significance_iyengar" in columns:
        db.execute(
            text(
                "ALTER TABLE term_definitions "
                "RENAME COLUMN significance_iyengar TO significance_tradition"
            )
        )
        db.commit()
        logger.info("Renamed term_definitions.significance_iyengar -> significance_tradition")
    elif "significance_tradition" not in columns and "significance_iyengar" not in columns:
        db.execute(text("ALTER TABLE term_definitions ADD COLUMN significance_tradition TEXT"))
        db.commit()
        logger.info("Added missing term_definitions.significance_tradition column")


def load_term_definitions(db: Session, file_path: Path | None = None) -> dict[str, int]:
    """
    Upsert term definitions from JSON file into SQLite.

    Returns:
        Dict with insert/update counts.
    """
    path = file_path or TERM_DEFINITIONS_PATH
    if not path.exists():
        raise FileNotFoundError(f"Term definitions file not found: {path}")

    ensure_term_definition_schema(db)

    with path.open("r", encoding="utf-8") as handle:
        definitions = json.load(handle)

    inserted = 0
    updated = 0

    for raw in definitions:
        item = _normalize_definition(raw)
        term_id = item["term_id"]

        existing = db.query(TermDefinition).filter(TermDefinition.term_id == term_id).one_or_none()

        values = {
            "term_id": term_id,
            "name_en": item.get("name_en", ""),
            "name_ta": item.get("name_ta", ""),
            "short_definition_en": item.get("short_definition_en", ""),
            "short_definition_ta": item.get("short_definition_ta", ""),
            "detailed_explanation_en": item.get("detailed_explanation_en", ""),
            "detailed_explanation_ta": item.get("detailed_explanation_ta", ""),
            "significance_tradition": item.get("significance_tradition"),
            "calculation_method": item.get("calculation_method"),
            "related_terms": item.get("related_terms"),
        }

        if existing:
            for key, value in values.items():
                setattr(existing, key, value)
            updated += 1
        else:
            db.add(TermDefinition(**values))
            inserted += 1

    db.commit()
    logger.info("Term definitions synchronized: inserted=%s updated=%s", inserted, updated)
    return {"inserted": inserted, "updated": updated, "total": len(definitions)}


if __name__ == "__main__":
    from src.db import SessionLocal

    session = SessionLocal()
    try:
        result = load_term_definitions(session)
        print(result)
    finally:
        session.close()
