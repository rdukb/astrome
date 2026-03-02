"""
Definitions API routes.
"""

from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from src.config.logging import get_logger
from src.data.load_definitions import load_term_definitions
from src.db import get_db
from src.db.schema import TermDefinition as TermDefinitionDB
from src.models import DefinitionsListResponse, TermDefinition

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/definitions", tags=["definitions"])


def _apply_language_filter(item: TermDefinition, language: Literal["en", "ta", "both"]) -> dict[str, Any]:
    data = item.model_dump()
    if language == "en":
        data["name_ta"] = None
        data["short_definition_ta"] = None
        data["detailed_explanation_ta"] = None
    elif language == "ta":
        data["name_en"] = None
        data["short_definition_en"] = None
        data["detailed_explanation_en"] = None
    return data


@router.get("", response_model=DefinitionsListResponse)
@router.get("/", response_model=DefinitionsListResponse, include_in_schema=False)
async def get_all_definitions(
    response: Response,
    language: Literal["en", "ta", "both"] = Query(
        default="both", description="Filter by language"
    ),
    db: Session = Depends(get_db),
):
    """
    Get all term definitions.

    Uses 30-day cache headers because this dataset changes infrequently.
    """
    definitions = db.query(TermDefinitionDB).order_by(TermDefinitionDB.term_id).all()

    if not definitions:
        logger.info("No term definitions found in DB. Loading from JSON source.")
        load_term_definitions(db)
        definitions = db.query(TermDefinitionDB).order_by(TermDefinitionDB.term_id).all()

    items: list[dict[str, Any]] = []
    for row in definitions:
        model = TermDefinition.model_validate(row)
        items.append(_apply_language_filter(model, language))

    response.headers["Cache-Control"] = "public, max-age=2592000"
    return {"definitions": items, "count": len(items), "language": language}


@router.get("/{term_id}", response_model=TermDefinition)
async def get_definition(
    term_id: str,
    response: Response,
    db: Session = Depends(get_db),
):
    """Get detailed definition for a specific term."""
    definition = db.query(TermDefinitionDB).filter(TermDefinitionDB.term_id == term_id).one_or_none()
    if not definition:
        raise HTTPException(status_code=404, detail=f"Term definition not found: {term_id}")

    response.headers["Cache-Control"] = "public, max-age=2592000"
    return TermDefinition.model_validate(definition)
