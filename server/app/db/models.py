# app/db/models.py
from app.shared.enums.language_code import LanguageCode
from app.shared.enums.publication_status import PublicationStatus
from app.shared.enums.resource_type import ResourceType

# app/db/models.py
from app.modules.users.model import User  # ← Sin dependencias

from app.modules.reports.model import Report  # ← Sin dependencias

from app.modules.report_versions.model import ReportVersion  # ← Depende de Report

from app.modules.categories.model import Category  # ← Depende de ReportVersion
from app.modules.sections.model import Section  # ← Depende de ReportVersion
from app.modules.references.model import Reference  # ← Depende de ReportVersion

from app.modules.concepts.model import Concept  # ← Depende de Category
from app.modules.resources.model import Resource  # ← Depende de Section
