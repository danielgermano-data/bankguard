import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    app_name: str = os.getenv("APP_NAME", "BankGuard")
    app_env: str = os.getenv("APP_ENV", "development")
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://bankguard_user:bankguard_password@localhost:5432/bankguard",
    ).replace("postgresql+psycopg://", "postgresql://")


settings = Settings()
