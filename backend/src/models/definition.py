"""
Term definition models for tooltip and glossary APIs.
"""

from typing import Literal, Optional

from pydantic import Field, field_validator

from .base import BaseModel


class TermDefinition(BaseModel):
    """Educational definition for a Panchang term."""

    term_id: str = Field(..., description="Unique term identifier (snake_case)")
    name_en: Optional[str] = Field(default=None, description="English term name")
    name_ta: Optional[str] = Field(default=None, description="Tamil term name")
    short_definition_en: Optional[str] = Field(default=None, description="Short English definition")
    short_definition_ta: Optional[str] = Field(default=None, description="Short Tamil definition")
    detailed_explanation_en: Optional[str] = Field(
        default=None, description="Detailed English explanation"
    )
    detailed_explanation_ta: Optional[str] = Field(
        default=None, description="Detailed Tamil explanation"
    )
    significance_tradition: Optional[str] = Field(
        default=None, description="Tradition-specific significance"
    )
    calculation_method: Optional[str] = Field(default=None, description="How the term is calculated")
    related_terms: Optional[list[str]] = Field(default=None, description="Related term IDs")
    sources: Optional[list[str]] = Field(default=None, description="Reference sources")
    icon: Optional[str] = Field(default=None, description="Icon identifier")

    @field_validator("term_id")
    @classmethod
    def validate_term_id(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("term_id cannot be empty")
        return value.strip()


class DefinitionsListResponse(BaseModel):
    """Response for list definitions endpoint."""

    definitions: list[TermDefinition]
    count: int
    language: Literal["en", "ta", "both"] = "both"
