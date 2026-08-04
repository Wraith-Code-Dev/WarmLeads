import httpx
import logging
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class FirecrawlService:
    def __init__(self):
        self.api_key = settings.FIRECRAWL_API_KEY
        self.base_url = "https://api.firecrawl.dev/v1"

    async def scrape_url(self, url: str) -> Dict[str, Any]:
        """
        Scrapes a prospect website or company URL using Firecrawl REST API.
        Falls back cleanly if key is missing or request fails.
        """
        if not url:
            return {"markdown": "", "metadata": {}, "success": False, "reason": "No URL provided"}

        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url

        if not self.api_key:
            logger.warning("Firecrawl API key not set. Using simulated web context extractor.")
            return {
                "markdown": f"Simulated website summary for {url}: Leading B2B solution provider focused on growth, innovation, and client success.",
                "metadata": {"title": "Company Overview", "source": url},
                "success": True
            }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "url": url,
            "formats": ["markdown"],
            "onlyMainContent": True
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(f"{self.base_url}/scrape", json=payload, headers=headers)
                if response.status_code == 200:
                    res_data = response.json()
                    data = res_data.get("data", {})
                    return {
                        "markdown": data.get("markdown", ""),
                        "metadata": data.get("metadata", {}),
                        "success": True
                    }
                else:
                    logger.error(f"Firecrawl scrape failed with status {response.status_code}: {response.text}")
                    return {"markdown": "", "metadata": {}, "success": False, "reason": response.text}
        except Exception as e:
            logger.error(f"Exception during Firecrawl scrape for {url}: {e}")
            return {"markdown": "", "metadata": {}, "success": False, "reason": str(e)}

firecrawl_service = FirecrawlService()
