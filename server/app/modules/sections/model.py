import uuid

from sqlalchemy import Enum
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Index  # ← IMPORTAR Index
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from app.shared.enums.publication_status import PublicationStatus
from app.modules.report_versions.model import ReportVersion
from app.modules.resources.model import Resource

from app.core.database import Base


class Section(Base):
    __tablename__ = "sections"

    # ÍNDICE COMPUESTO ÚNICO
    __table_args__ = (
        Index(
            "uq_section_report_version_slug", "report_version_id", "slug", unique=True
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    report_version_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("report_versions.id"),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(255),
        nullable=False,  # ← ELIMINAR unique=True e index=True
    )

    content: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    display_order: Mapped[int | None] = mapped_column(
        Integer,
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

    report_version: Mapped["ReportVersion"] = relationship(
        "ReportVersion",
        back_populates="sections",
    )

    resources: Mapped[list["Resource"]] = relationship(
        "Resource",
        back_populates="section",
        cascade="all, delete-orphan",
    )
