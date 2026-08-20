from app.modules.reports.schema import (
    ReportRead,
    ReportWithVersionsRead,
)

from app.modules.report_versions.schema import (
    ReportVersionRead,
    ReportVersionDetailRead,
    ReportVersionFullRead,
)

from app.modules.sections.schema import (
    SectionRead,
    SectionWithResourcesRead,
)

from app.modules.categories.schema import (
    CategoryRead,
    CategoryWithConceptsRead,
)

from app.modules.references.schema import (
    ReferenceRead,
)

# Report → ReportVersion
ReportWithVersionsRead.model_rebuild(
    _types_namespace={
        "ReportVersionRead": ReportVersionRead,
    }
)


# ReportVersionDetail → Section / Category / Reference
ReportVersionDetailRead.model_rebuild(
    _types_namespace={
        "SectionRead": SectionRead,
        "CategoryRead": CategoryRead,
        "ReferenceRead": ReferenceRead,
    }
)


# ReportVersionFull → Report / Section / Category / Reference
ReportVersionFullRead.model_rebuild(
    _types_namespace={
        "ReportRead": ReportRead,
        "SectionWithResourcesRead": SectionWithResourcesRead,
        "CategoryWithConceptsRead": CategoryWithConceptsRead,
        "ReferenceRead": ReferenceRead,
    }
)
