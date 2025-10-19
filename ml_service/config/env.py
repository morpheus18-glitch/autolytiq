from __future__ import annotations

from typing import Literal, Optional

from pydantic import AnyUrl, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=None, extra='ignore')

    NODE_ENV: Literal['development', 'production', 'test'] = 'development'
    DEPLOY_MODE: Literal['replit', 'self_hosted'] = 'replit'
    PORT: int = 8000
    DATABASE_URL: AnyUrl
    REDIS_URL: AnyUrl
    JWT_SECRET: str
    SENDGRID_API_KEY: str
    SENDGRID_FROM_EMAIL: str
    SENDGRID_WEBHOOK_SIGNING_KEY: str
    SMTP_HOST: str = 'smtp.sendgrid.net'
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASS: Optional[str] = None
    TWILIO_ACCOUNT_SID: str
    TWILIO_AUTH_TOKEN: str
    TWILIO_MESSAGING_SERVICE_SID: str
    TWILIO_PHONE_NUMBER: Optional[str] = None
    PEXELS_API_KEY: str
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: Optional[str] = None
    S3_BUCKET: str
    S3_REGION: Optional[str] = None
    S3_ENDPOINT: Optional[AnyUrl] = None
    CLICKHOUSE_HOST: Optional[str] = None
    CLICKHOUSE_PORT: Optional[int] = None
    CLICKHOUSE_USER: Optional[str] = None
    CLICKHOUSE_PASSWORD: Optional[str] = None
    CLICKHOUSE_DB: Optional[str] = None
    ML_SERVICE_TOKEN: Optional[str] = None
    MODEL_PATH: str = '/models'
    LOG_LEVEL: str = 'INFO'
    DB_HOST: Optional[str] = None
    DB_PORT: Optional[str] = None
    DB_NAME: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None

    @model_validator(mode='after')
    def validate_feature_requirements(self):  # type: ignore[override]
        missing: list[str] = []

        if self.DEPLOY_MODE == 'self_hosted':
            for key in [
                'SENDGRID_API_KEY',
                'SENDGRID_FROM_EMAIL',
                'SENDGRID_WEBHOOK_SIGNING_KEY',
                'TWILIO_ACCOUNT_SID',
                'TWILIO_AUTH_TOKEN',
                'TWILIO_MESSAGING_SERVICE_SID',
                'PEXELS_API_KEY',
                'AWS_ACCESS_KEY_ID',
                'AWS_SECRET_ACCESS_KEY',
                'S3_BUCKET',
            ]:
                if not getattr(self, key):
                    missing.append(key)

        if self.CLICKHOUSE_HOST and (not self.CLICKHOUSE_PORT or not self.CLICKHOUSE_USER):
            missing.extend(
                [item for item in ['CLICKHOUSE_PORT', 'CLICKHOUSE_USER'] if not getattr(self, item)]
            )

        if missing:
            raise ValueError(
                f"Missing required environment variables for {self.DEPLOY_MODE} mode: {', '.join(sorted(set(missing)))}"
            )

        return self


ENV = Settings()

__all__ = ['ENV', 'Settings']
