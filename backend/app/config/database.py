from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config.settings import settings
import logging

logger = logging.getLogger(__name__)


class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


db_instance = Database()


async def connect_db():
    try:
        db_instance.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,
        )
        db_instance.db = db_instance.client[settings.DATABASE_NAME]
        # Verify connection
        await db_instance.client.admin.command("ping")
        logger.info("✅ Connected to MongoDB Atlas")

        # Create indexes
        await create_indexes()
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        raise


async def disconnect_db():
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed")


async def create_indexes():
    db = db_instance.db
    # Users
    await db.users.create_index("email", unique=True)
    await db.users.create_index("role")
    # Jobs
    await db.jobs.create_index([("title", "text"), ("description", "text"), ("skills", "text")])
    await db.jobs.create_index("company_id")
    await db.jobs.create_index("is_active")
    await db.jobs.create_index("created_at")
    # Applications
    await db.applications.create_index([("job_id", 1), ("candidate_id", 1)], unique=True)
    await db.applications.create_index("candidate_id")
    await db.applications.create_index("job_id")
    logger.info("✅ Database indexes created")


def get_db() -> AsyncIOMotorDatabase:
    return db_instance.db
