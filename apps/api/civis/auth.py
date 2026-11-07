from supertokens_python import InputAppInfo, SupertokensConfig, init
from supertokens_python.ingredients.emaildelivery.types import (
    EmailDeliveryConfig,
    SMTPSettings,
    SMTPSettingsFrom,
)
from supertokens_python.recipe import emailpassword, emailverification, session

from civis.config import Settings


def configure_auth(settings: Settings) -> None:
    smtp = SMTPSettings(
        host=settings.smtp_host,
        port=settings.smtp_port,
        from_=SMTPSettingsFrom("Civis", settings.smtp_from),
        secure=settings.environment == "production",
        username=settings.smtp_username,
        password=settings.smtp_password.get_secret_value() if settings.smtp_password else None,
    )
    init(
        app_info=InputAppInfo(
            app_name="Civis",
            api_domain=settings.api_domain,
            website_domain=settings.web_domain,
            api_base_path="/auth",
            website_base_path="/auth",
        ),
        supertokens_config=SupertokensConfig(
            connection_uri=settings.supertokens_uri,
            api_key=settings.supertokens_api_key.get_secret_value(),
        ),
        framework="fastapi",
        mode="asgi",
        telemetry=False,
        debug=False,
        recipe_list=[
            session.init(
                cookie_secure=settings.environment == "production", anti_csrf="VIA_CUSTOM_HEADER"
            ),
            emailpassword.init(
                email_delivery=EmailDeliveryConfig(service=emailpassword.SMTPService(smtp))
            ),
            # /me remains available before verification, with zero allowance.
            emailverification.init(
                mode="OPTIONAL",
                email_delivery=EmailDeliveryConfig(service=emailverification.SMTPService(smtp)),
            ),
        ],
    )
