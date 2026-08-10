import uuid
from collections.abc import Generator

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.exceptions import UnauthorizedException
from app.modules.users.model import User
from app.modules.users.repository import UserRepository

# Repositorios
from app.modules.reports.repository import ReportRepository
from app.modules.report_versions.repository import ReportVersionRepository
from app.modules.categories.repository import CategoryRepository
from app.modules.sections.repository import SectionRepository
from app.modules.references.repository import ReferenceRepository
from app.modules.concepts.repository import ConceptRepository
from app.modules.resources.repository import ResourceRepository

# Servicios
from app.modules.reports.service import ReportService
from app.modules.report_versions.service import ReportVersionService
from app.modules.categories.service import CategoryService
from app.modules.sections.service import SectionService
from app.modules.references.service import ReferenceService
from app.modules.concepts.service import ConceptService
from app.modules.resources.service import ResourceService

security = HTTPBearer()


# =========================================================
# INFRAESTRUCTURA
# =========================================================


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================================
# REPOSITORIOS
# =========================================================


def get_user_repository(
    db: Session = Depends(get_db),
) -> UserRepository:
    return UserRepository(db)


def get_report_repository(
    db: Session = Depends(get_db),
) -> ReportRepository:
    return ReportRepository(db)


def get_report_version_repository(
    db: Session = Depends(get_db),
) -> ReportVersionRepository:
    return ReportVersionRepository(db)


def get_category_repository(
    db: Session = Depends(get_db),
) -> CategoryRepository:
    return CategoryRepository(db)


def get_section_repository(
    db: Session = Depends(get_db),
) -> SectionRepository:
    return SectionRepository(db)


def get_reference_repository(
    db: Session = Depends(get_db),
) -> ReferenceRepository:
    return ReferenceRepository(db)


def get_concept_repository(
    db: Session = Depends(get_db),
) -> ConceptRepository:
    return ConceptRepository(db)


def get_resource_repository(
    db: Session = Depends(get_db),
) -> ResourceRepository:
    return ResourceRepository(db)


# =========================================================
# SERVICIOS
# =========================================================


def get_report_service(
    db: Session = Depends(get_db),
) -> ReportService:
    repository = ReportRepository(db)
    return ReportService(repository)


def get_report_version_service(
    db: Session = Depends(get_db),
) -> ReportVersionService:
    version_repository = ReportVersionRepository(db)
    report_repository = ReportRepository(db)
    return ReportVersionService(version_repository, report_repository)


def get_category_service(
    db: Session = Depends(get_db),
) -> CategoryService:
    repository = CategoryRepository(db)
    report_version_repository = ReportVersionRepository(db)
    return CategoryService(repository, report_version_repository)


def get_section_service(
    db: Session = Depends(get_db),
) -> SectionService:
    repository = SectionRepository(db)
    report_version_repository = ReportVersionRepository(db)
    return SectionService(repository, report_version_repository)


def get_reference_service(
    db: Session = Depends(get_db),
) -> ReferenceService:
    repository = ReferenceRepository(db)
    report_version_repository = ReportVersionRepository(db)
    return ReferenceService(repository, report_version_repository)


def get_concept_service(
    db: Session = Depends(get_db),
) -> ConceptService:
    repository = ConceptRepository(db)
    category_repository = CategoryRepository(db)
    return ConceptService(repository, category_repository)


def get_resource_service(
    db: Session = Depends(get_db),
) -> ResourceService:
    repository = ResourceRepository(db)
    section_repository = SectionRepository(db)
    return ResourceService(repository, section_repository)


# =========================================================
# AUTENTICACIÓN
# =========================================================


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    repository: UserRepository = Depends(get_user_repository),
) -> User:
    """
    Obtiene el usuario autenticado a partir del JWT.
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    sub = payload.get("sub")

    if sub is None:
        raise UnauthorizedException(
            message="Token inválido o expirado.",
        )

    try:
        user_id = uuid.UUID(sub)
    except ValueError:
        raise UnauthorizedException(
            message="Token inválido o expirado.",
        )

    user = repository.get_by_id(user_id)

    if user is None:
        raise UnauthorizedException(
            message="Token inválido o expirado.",
        )

    if not user.is_active:
        raise UnauthorizedException(
            message="Usuario inactivo.",
        )

    return user
