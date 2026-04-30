from sqlalchemy import event
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from .config import get_settings

settings = get_settings()

# Create async engine
_is_sqlite = settings.DATABASE_URL.startswith("sqlite")
_engine_kwargs = {"echo": False, "future": True}
if _is_sqlite:
    # busy_timeout (seconds) avoids spurious "database is locked" errors
    _engine_kwargs["connect_args"] = {"timeout": 30}

engine = create_async_engine(settings.DATABASE_URL, **_engine_kwargs)


if _is_sqlite:
    @event.listens_for(engine.sync_engine, "connect")
    def _set_sqlite_pragmas(dbapi_conn, _):
        """Apply performance-oriented PRAGMAs to every SQLite connection.

        WAL + synchronous=NORMAL gives a large write-throughput boost
        (especially on bind-mounted filesystems like Docker Desktop on
        Windows) while remaining crash-safe.
        """
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA journal_mode=WAL")
        cur.execute("PRAGMA synchronous=NORMAL")
        cur.execute("PRAGMA temp_store=MEMORY")
        cur.execute("PRAGMA cache_size=-64000")  # ~64 MB page cache
        cur.execute("PRAGMA foreign_keys=ON")
        cur.close()

# Create async session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """Dependency for getting database sessions."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
