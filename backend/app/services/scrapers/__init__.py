from app.services.scrapers.freelancer import FreelancerScraper
from app.services.scrapers.reddit import RedditScraper
from app.services.scrapers.upwork import UpworkScraper
from app.services.scrapers.peopleperhour import PeoplePerHourScraper
from app.services.scrapers.guru import GuruScraper
from app.services.scrapers.freelancermap import FreelancermapScraper
from app.services.scrapers.behance import BehanceScraper
from app.services.scrapers.jobspy_driver import JobSpyScraper
from app.services.scrapers.crawl4ai_driver import Crawl4AIDriver

__all__ = [
    "FreelancerScraper",
    "RedditScraper",
    "UpworkScraper",
    "PeoplePerHourScraper",
    "GuruScraper",
    "FreelancermapScraper",
    "BehanceScraper",
    "JobSpyScraper",
    "Crawl4AIDriver",
]
