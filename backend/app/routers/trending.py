import re
from collections import Counter

import aiomysql
from fastapi import APIRouter, Depends

from app.database import get_db

router = APIRouter(prefix="/trending", tags=["trending"])

HASHTAG_RE = re.compile(r"#([a-zA-Z0-9_]+)")


@router.get("")
async def trending_tags(limit: int = 5, conn=Depends(get_db)):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute("SELECT Content FROM Post")
        rows = await cur.fetchall()

    counter = Counter()
    for row in rows:
        for match in HASHTAG_RE.findall(row["Content"] or ""):
            counter[match.lower()] += 1

    return [{"tag": tag, "count": count} for tag, count in counter.most_common(limit)]
