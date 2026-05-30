from collections.abc import Iterator

import psycopg
from psycopg.rows import dict_row

from app.core.config import settings


def get_connection() -> Iterator[psycopg.Connection]:
    with psycopg.connect(settings.database_url, row_factory=dict_row) as conn:
        yield conn
