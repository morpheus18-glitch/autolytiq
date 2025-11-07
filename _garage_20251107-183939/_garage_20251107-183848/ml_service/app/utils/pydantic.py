from __future__ import annotations

from pydantic import BaseModel, ConfigDict


def to_camel(string: str) -> str:
    parts = string.split("_")
    if not parts:
        return string
    return parts[0] + "".join(word.capitalize() or "_" for word in parts[1:])


class CamelModel(BaseModel):
    """Base model that serializes to camelCase for API parity with TypeScript."""

    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel, from_attributes=True)
