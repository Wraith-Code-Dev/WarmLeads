from abc import ABC, abstractmethod
import logging
from typing import List, Dict, Any, Optional

try:
    from curl_cffi.requests import AsyncSession as CurlAsyncSession
    CURL_CFFI_AVAILABLE = True
except ImportError:
    import httpx
    CURL_CFFI_AVAILABLE = False

logger = logging.getLogger(__name__)

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

class BaseJobScraper(ABC):
    """
    Abstract Base Class for Tier-1 Low-Fragility Scrapers.
    Leverages curl_cffi for browser TLS impersonation (JA3/JA4) with httpx fallback.
    """
    def __init__(self, platform_name: str, timeout: float = 15.0):
        self.platform_name = platform_name
        self.timeout = timeout

    @abstractmethod
    async def fetch_jobs(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """
        Fetch raw job postings from the target platform for specified search keywords.
        Returns a list of dictionaries adhering to raw data structure.
        """
        pass

    async def _safe_get(self, url: str, params: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Optional[Any]:
        """
        Helper method to perform resilient async GET request using TLS browser impersonation.
        """
        req_headers = {**DEFAULT_HEADERS, **(headers or {})}

        if CURL_CFFI_AVAILABLE:
            try:
                async with CurlAsyncSession(impersonate="chrome124", timeout=self.timeout) as session:
                    res = await session.get(url, params=params, headers=req_headers)
                    if res.status_code in [200, 201]:
                        return res
                    else:
                        logger.warning(f"[{self.platform_name}] HTTP GET status {res.status_code} for {url}")
                        return res
            except Exception as e:
                logger.error(f"[{self.platform_name}] curl_cffi GET failed for {url}: {e}")
                return None
        else:
            try:
                async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                    response = await client.get(url, params=params, headers=req_headers)
                    response.raise_for_status()
                    return response
            except Exception as e:
                logger.error(f"[{self.platform_name}] httpx GET failed for {url}: {e}")
                return None
