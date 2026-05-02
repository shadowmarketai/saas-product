"""AI generation endpoints."""
import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth.dependencies import get_current_user
from app.config import settings
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])


class CaptionRequest(BaseModel):
    business_name: str
    post_type: str  # "festival", "offer", "product", "event"
    details: str = ""
    tone: str = "professional"  # "professional", "fun", "urgent"
    platforms: list[str] = ["instagram", "facebook", "whatsapp"]


class CaptionResponse(BaseModel):
    captions: dict[str, str]  # platform → caption
    hashtags: list[str]
    emojis: list[str]


def _mock_response(req: CaptionRequest) -> CaptionResponse:
    business_name = req.business_name
    post_type = req.post_type
    details = req.details
    captions: dict[str, str] = {}
    for platform in req.platforms:
        if platform == "instagram":
            captions[platform] = (
                f"✨ {business_name} brings you amazing {post_type} deals! "
                f"{details} Don't miss out! 🔥"
            )
        elif platform == "facebook":
            captions[platform] = (
                f"🎉 Special {post_type} announcement from {business_name}! "
                f"{details} Visit us today!"
            )
        elif platform == "whatsapp":
            captions[platform] = (
                f"*{business_name}* - {post_type.title()} Special!\n\n"
                f"{details}\n\nContact us now! 📱"
            )
        else:
            captions[platform] = (
                f"{business_name} - {post_type.title()} Special! {details}"
            )
    return CaptionResponse(
        captions=captions,
        hashtags=[
            f"#{business_name.replace(' ', '')}",
            f"#{post_type}",
            "#sale",
            "#special",
            "#offer",
        ],
        emojis=["🎉", "✨", "🔥", "💯", "🎁"],
    )


async def _openai_response(req: CaptionRequest) -> CaptionResponse:
    import json

    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    platforms_str = ", ".join(req.platforms)
    prompt = (
        f"Generate social media captions for the following business post.\n\n"
        f"Business: {req.business_name}\n"
        f"Post type: {req.post_type}\n"
        f"Details: {req.details}\n"
        f"Tone: {req.tone}\n"
        f"Platforms: {platforms_str}\n\n"
        f"Return a JSON object with these keys:\n"
        f'- "captions": an object mapping each platform name to its caption string\n'
        f'- "hashtags": a list of 5 relevant hashtag strings (including the # symbol)\n'
        f'- "emojis": a list of 5 relevant emoji characters\n\n'
        f"Return only valid JSON, no markdown fences."
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=600,
        )
        raw = response.choices[0].message.content or ""
        data = json.loads(raw)
        return CaptionResponse(
            captions=data.get("captions", {}),
            hashtags=data.get("hashtags", []),
            emojis=data.get("emojis", []),
        )
    except Exception as exc:
        logger.warning("OpenAI call failed, falling back to mock: %s", exc)
        return _mock_response(req)


@router.post("/generate-caption", response_model=CaptionResponse)
async def generate_caption(
    req: CaptionRequest,
    current_user: User = Depends(get_current_user),
) -> CaptionResponse:
    """Generate platform-specific social media captions for a business post."""
    if not settings.OPENAI_API_KEY:
        logger.info("OPENAI_API_KEY not set, returning mock captions")
        return _mock_response(req)
    return await _openai_response(req)
