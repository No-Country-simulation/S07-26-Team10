import uuid

from sqlalchemy import DateTime
from sqlalchemy import Enum
from sqlalchemy import ForeignKey
from sqlalchemy import Index
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.shared.enums.language_code import LanguageCode
from app.shared.enums.publication_status import PublicationStatus

# Importar los modelos que necesitas para las relaciones
from app.modules.sections.model import Section
from app.modules.references.model import Reference
from app.modules.categories.model import Category
from app.modules.reports.model import Report


class ReportVersion(Base):
    __tablename__ = "report_versions"

    __table_args__ = (
        Index(
            "uq_report_version_language",
            "report_id",
            "version",
            "language",
            unique=True,
        ),
        Index(
            "ix_report_language_status",
            "report_id",
            "language",
            "status",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reports.id"),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    version: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    language: Mapped[LanguageCode] = mapped_column(
        Enum(LanguageCode, name="language_code"),
        nullable=False,
    )

    summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    citation_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[PublicationStatus] = mapped_column(
        Enum(PublicationStatus, name="publication_status"),
        nullable=False,
        default=PublicationStatus.DRAFT,
        server_default=PublicationStatus.DRAFT.value,
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    report: Mapped["Report"] = relationship(
        "Report",
        back_populates="report_versions",
    )

    sections: Mapped[list["Section"]] = relationship(
        "Section",
        back_populates="report_version",
        cascade="all, delete-orphan",
    )

    references: Mapped[list["Reference"]] = relationship(
        "Reference",
        back_populates="report_version",
        cascade="all, delete-orphan",
    )

    categories: Mapped[list["Category"]] = relationship(
        "Category",
        back_populates="report_version",
        cascade="all, delete-orphan",
    )
