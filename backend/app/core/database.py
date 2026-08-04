# Alias app.db.session for backward compatibility across modules
from app.db.session import (
    pooled_engine as engine,
    direct_engine,
    AsyncPooledSessionLocal as AsyncSessionLocal,
    AsyncDirectSessionLocal,
    Base,
    get_pooled_db as get_db,
    get_direct_db
)
