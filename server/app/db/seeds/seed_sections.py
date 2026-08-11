from sqlalchemy.orm import Session

from app.modules.report_versions.model import ReportVersion
from app.modules.report_versions.repository import ReportVersionRepository
from app.modules.reports.repository import ReportRepository
from app.modules.sections.model import Section
from app.modules.sections.repository import SectionRepository
from app.shared.enums.language_code import LanguageCode
from app.shared.enums.publication_status import PublicationStatus


def seed_sections(db: Session) -> None:
    """
    Crea secciones para las versiones del Stranded Capacity Index.
    Cada sección tiene título, slug, contenido y display_order.
    """
    report_repository = ReportRepository(db)
    version_repository = ReportVersionRepository(db)
    section_repository = SectionRepository(db)

    # Obtener el reporte
    report = report_repository.get_by_slug("stranded-capacity-index-2026")
    if not report:
        print("⚠️ Reporte no encontrado. Ejecuta seed_reports primero.")
        return

    # Obtener las versiones del reporte
    versions = version_repository.get_by_report_id(report.id)

    # Filtrar versiones por idioma
    versions_es = [v for v in versions if v.language == LanguageCode.ES]
    versions_en = [v for v in versions if v.language == LanguageCode.EN]

    # Definir secciones (ES)
    sections_es = [
        {
            "title": "Resumen Ejecutivo",
            "slug": "resumen-ejecutivo",
            "content": """La oportunidad de PhysaFlow no está en competir, al menos al inicio, como otro DCIM, otro scheduler o otra capa de observabilidad aislada. La oportunidad está en ocupar una posición más alta en la pila: convertirse en la referencia que mide, nombra y explica la distancia entre la capacidad nominal de un data center y la capacidad que realmente se transforma en trabajo útil.

Esa distancia existe en el mercado actual porque el crecimiento de demanda de IA está tensando simultáneamente la energía, la refrigeración, la densidad de rack, la disponibilidad de hardware acelerado, la topología de red y la eficiencia del scheduling. Mientras tanto, la oferta de herramientas sigue fragmentada entre facility, IT y workload.

El problema es real y cuantificable, aunque 'stranded capacity' no tiene hoy una definición única y estandarizada en la industria. Distintos actores la describen como capacidad instalada que no puede soportar carga crítica, recursos que no se sabe con certeza si están disponibles, o desbalances entre espacio, energía y cooling. Esa falta de consenso no debilita la tesis de PhysaFlow; al contrario, la fortalece. Si no existe todavía un vocabulario común, un índice y una taxonomía pública pueden convertirse en un activo de autoridad, cita y posicionamiento.""",
            "display_order": 1,
        },
        {
            "title": "Definición del Problema",
            "slug": "definicion-problema",
            "content": """En la práctica, la mejor manera de entender stranded capacity en data centers es como una capacidad ya invertida, instalada, energizada o reservada que no puede traducirse plenamente en carga útil por descoordinación entre capas.

Sunbird la define como recursos que 'no se sabe que están disponibles para usar' y que aparecen cuando hay desequilibrios entre power, space, cooling y puertos. AKCP la describe como capacidad instalada de cooling, power y space que queda atrapada cuando esas tres dimensiones no se evalúan juntas. Data Center Knowledge la expresa como 'installed capacity that cannot be used to support critical load'.

Para PhysaFlow, la definición operativa es: Stranded capacity es la porción de capacidad nominal, instalada o reservada de un data center que no puede convertirse en trabajo útil debido a restricciones, fragmentación o descoordinación entre facility, IT y workload.""",
            "display_order": 2,
        },
        {
            "title": "Modelo Operativo del Data Center",
            "slug": "modelo-operativo",
            "content": """Un data center moderno orientado a IA puede describirse como una cadena de conversión de capacidad. La energía entra por la red y la interconexión eléctrica; luego pasa por infraestructura de respaldo y distribución —subestación, generadores, UPS, switchgear, busway y PDUs— antes de llegar al rack y a los servidores.

En paralelo, el sistema térmico —HVAC, CRAC/CRAH, chillers, rear-door heat exchangers o liquid cooling— debe extraer el calor a la misma velocidad con que la capa IT lo produce. Recién después intervienen servidores, GPUs, storage, networking y la capa de software que decide cómo y dónde ejecutar workloads.

Para PhysaFlow, la secuencia más útil no es la arquitectónica clásica, sino la secuencia de degradación de capacidad: Grid → backup → distribución eléctrica → cooling → densidad de rack → servidores/GPUs → topología de red → scheduler → workload ejecutándose eficientemente. Cada flecha es un punto potencial de pérdida.""",
            "display_order": 3,
        },
        {
            "title": "Taxonomía Propuesta",
            "slug": "taxonomia",
            "content": """La mejor taxonomía para PhysaFlow no debería organizarse alrededor de componentes ('UPS', 'GPU', 'scheduler') sino alrededor de modos de pérdida de capacidad. Ese cambio es importante porque permite comparar problemas heterogéneos con una misma lógica: qué capacidad se pierde, en qué capa, por qué causa, con qué métrica y con qué costo.

La taxonomía se organiza en tres capas: Facility (energía y cooling), IT (infraestructura de cómputo) y Workload (scheduling y ejecución). Cada categoría se etiqueta con una segunda dimensión: estructural, temporal, operativa, financiera, de software o de infraestructura. Eso ayuda a que el reporte no sea solo descriptivo, sino accionable.""",
            "display_order": 4,
        },
        {
            "title": "Facility",
            "slug": "facility",
            "content": """Stranded power y stranded cooling son las categorías más maduras y visibles hoy.

Stranded power: MW o kW contratados o UPS disponibles que no admiten nueva carga crítica por desbalance entre suministro, UPS, distribución o derating conservador.

Stranded cooling: capacidad térmica activa que no enfría IT útil por bypass air, sobreenfriamiento, falta de contención o mala distribución.

Uptime reporta que uno de cada cuatro data centers opera con menos de 40% de utilización de la capacidad UPS disponible. Upsite documentó en su muestra histórica de 45 sitios una capacidad de cooling activa promedio de 3,9 veces la carga IT, lo que sugiere un amplio margen de cooling 'presente' pero no transformado eficientemente en enfriamiento útil.""",
            "display_order": 5,
        },
        {
            "title": "IT",
            "slug": "it",
            "content": """La literatura sobre clusters de ML justifica sobradamente esta capa. El paper sobre FGD muestra que asignaciones parciales pueden dejar cientos de GPUs imposibles de asignar en clusters grandes; en su evaluación, FGD redujo GPUs no asignadas hasta 49%, habilitando el uso adicional de 290 GPUs.

El trabajo sobre AntMan, desplegado en Alibaba, reporta mejoras de 42% en utilización de memoria GPU, 34% en utilización de cómputo y hasta 17,1% más GPUs disponibles para trabajos mediante mejor sharing y scheduling.

Categorías principales: Installed but unavailable computes (servidores/GPUs instalados pero fuera de servicio), GPU fragmentation (GPUs libres que no sirven para nuevos jobs), Topology-bottlenecked compute (aceleradores no aptos por restricciones de red).""",
            "display_order": 6,
        },
        {
            "title": "Workload",
            "slug": "workload",
            "content": """Acá está la parte más diferenciadora para PhysaFlow. Kubernetes documenta que el scheduler evalúa locality, interferencia y restricciones de políticas; Volcano agrega explícitamente gang scheduling, fair-share, binpack, device share y topología-aware scheduling.

Categorías principales: Scheduler fragmentation (jobs en cola con capacidad libre agregada), Queue inefficiency (largas demoras de espera), Gang scheduling failure (trabajos distribuidos que no arrancan), Oversized reservations (recursos apartados y no usados en su totalidad).

Si PhysaFlow omitiera esta capa, correría el riesgo de repetir el sesgo clásico de facility/DCIM: medir solo si la infraestructura está 'lista', no si realmente se transforma en output.""",
            "display_order": 7,
        },
        {
            "title": "Impacto Económico",
            "slug": "impacto-economico",
            "content": """El impacto económico de la stranded capacity aparece por dos vías. La primera es directa: CAPEX inmovilizado en facility o IT que no se monetiza plenamente. La segunda es indirecta: OPEX y expansión prematura.

McKinsey proyecta US$ 6,7 billones de inversión global acumulada en data centers hacia 2030. IEA proyecta que el consumo eléctrico global de data centers pase de aproximadamente 415 TWh en 2024 a unos 945 TWh en 2030. CBRE describe un escenario de supply tight 'through 2030', con alquileres en aumento y disponibilidad muy comprimida en hubs clave.

En un ambiente tan restringido, la capacidad marginal recuperada dentro de un sitio existente vale más que en un mercado con energía, suelo y potencia abundantes. Cada punto de capacidad recuperada evita CAPEX adelantado.""",
            "display_order": 8,
        },
        {
            "title": "Metodología",
            "slug": "metodologia",
            "content": """Cuando no existan cifras directas de stranded capacity, PhysaFlow debería trabajar con proxies explícitos.

Tres proxies defendibles para el índice:

1. Facility Stranded Capacity Ratio: 1 - (critical IT load realmente desplegable / capacidad facility disponible)
2. IT Stranded Compute Ratio: 1 - (aceleradores healthy & schedulable / aceleradores instalados)
3. Workload Stranded Output Ratio: 1 - (GPU-hours que producen output útil / GPU-hours asignadas)

Estas no son métricas estándar de mercado; son una propuesta metodológica. Su valor está en que obligan a pasar del lenguaje de inventario al lenguaje de rendimiento.""",
            "display_order": 9,
        },
        {
            "title": "Referencias",
            "slug": "referencias",
            "content": """Las fuentes más importantes para esta investigación fueron:

- IEA sobre demanda eléctrica, restricciones de red y proyección de data centers
- Uptime Institute para densidad de racks, PUE y utilización de capacidad facility
- CBRE para vacancia, inventory y constraints de mercado
- McKinsey para escala de inversión
- Papers y proceedings de USENIX para fragmentación y scheduling de clusters
- Documentación oficial de Kubernetes, Slurm y Volcano para scheduling
- Documentación de Schneider Electric, Nlyte, Device42 y EkkoSense para landscape de soluciones

Limitación: no existe hoy un estándar universalmente aceptado de 'stranded capacity' aplicable simultáneamente a facility, IT y workloads. Por eso, parte del valor de esta entrega es sintetizar y proponer un marco común.""",
            "display_order": 10,
        },
    ]

    # Definir secciones (EN) - traducción del contenido anterior
    sections_en = [
        {
            "title": "Executive Summary",
            "slug": "executive-summary",
            "content": """PhysaFlow's opportunity is not to compete, at least initially, as another DCIM, another scheduler, or another isolated observability layer. The opportunity lies in occupying a higher position in the stack: becoming the reference that measures, names, and explains the distance between a data center's nominal capacity and the capacity that actually translates into useful work.

This distance exists because the growth in AI demand is simultaneously straining energy, cooling, rack density, accelerated hardware availability, network topology, and scheduling efficiency. Meanwhile, the tooling landscape remains fragmented across facility, IT, and workload layers.

The problem is real and quantifiable, although 'stranded capacity' lacks a single standardized definition in the industry. Different actors describe it as installed capacity that cannot support critical load, resources not known to be available, or imbalances between space, energy, and cooling. This lack of consensus does not weaken PhysaFlow's thesis; it strengthens it. If a common vocabulary does not yet exist, a public index and taxonomy can become assets of authority, citation, and positioning.""",
            "display_order": 1,
        },
        {
            "title": "Problem Definition",
            "slug": "problem-definition",
            "content": """In practice, the best way to understand stranded capacity in data centers is as already invested, installed, energized, or reserved capacity that cannot be fully translated into useful load due to miscoordination between layers.

Sunbird defines it as resources that are 'not known to be available for use' that arise when there are imbalances between power, space, cooling, and ports. AKCP describes it as installed cooling, power, and space capacity that becomes trapped when these three dimensions are not evaluated together. Data Center Knowledge expresses it as 'installed capacity that cannot be used to support critical load'.

For PhysaFlow, the operational definition is: Stranded capacity is the portion of nominal, installed, or reserved capacity of a data center that cannot be converted into useful work due to constraints, fragmentation, or miscoordination between facility, IT, and workload.""",
            "display_order": 2,
        },
        {
            "title": "Data Center Operating Model",
            "slug": "operating-model",
            "content": """A modern AI-oriented data center can be described as a capacity conversion chain. Power enters through the grid and electrical interconnection; then passes through backup infrastructure and distribution — substation, generators, UPS, switchgear, busway, and PDUs — before reaching the rack and servers.

In parallel, the thermal system — HVAC, CRAC/CRAH, chillers, rear-door heat exchangers, or liquid cooling — must extract heat at the same rate that the IT layer produces it. Only after that do servers, GPUs, storage, networking, and the software layer that decides how and where to run workloads come into play.

For PhysaFlow, the most useful sequence is not the classic architectural one, but the capacity degradation sequence: Grid → backup → electrical distribution → cooling → rack density → servers/GPUs → network topology → scheduler → workload running efficiently. Each arrow is a potential point of loss.""",
            "display_order": 3,
        },
        {
            "title": "Proposed Taxonomy",
            "slug": "taxonomy",
            "content": """The best taxonomy for PhysaFlow should not be organized around components ('UPS', 'GPU', 'scheduler') but around modes of capacity loss. This shift is important because it allows comparing heterogeneous problems with a common logic: what capacity is lost, in which layer, for what cause, with what metric, and at what cost.

The taxonomy is organized into three layers: Facility (energy and cooling), IT (compute infrastructure), and Workload (scheduling and execution). Each category is tagged with a secondary dimension: structural, temporal, operational, financial, software, or infrastructure. This helps ensure the report is not merely descriptive but actionable.""",
            "display_order": 4,
        },
        {
            "title": "Facility",
            "slug": "facility",
            "content": """Stranded power and stranded cooling are the most mature and visible categories today.

Stranded power: MW or kW contracted or UPS available that cannot support new critical load due to imbalance between supply, UPS, distribution, or conservative derating.

Stranded cooling: active thermal capacity that does not cool useful IT due to bypass air, overcooling, lack of containment, or poor distribution.

Uptime reports that one in four data centers operates with less than 40% utilization of available UPS capacity. Upsite documented in its historical sample of 45 sites an average active cooling capacity of 3.9 times IT load, suggesting a wide margin of cooling 'present' but not efficiently transformed into useful cooling.""",
            "display_order": 5,
        },
        {
            "title": "IT",
            "slug": "it",
            "content": """The literature on ML clusters fully justifies this layer. The FGD paper shows that partial allocations can leave hundreds of GPUs unassignable in large clusters; in their evaluation, FGD reduced unassigned GPUs by up to 49%, enabling the additional use of 290 GPUs.

The AntMan work, deployed at Alibaba, reports 42% improvement in GPU memory utilization, 34% improvement in compute utilization, and up to 17.1% more GPUs available for jobs through better sharing and scheduling.

Main categories: Installed but unavailable computes (servers/GPUs installed but out of service), GPU fragmentation (free GPUs that cannot serve new jobs), Topology-bottlenecked compute (accelerators unsuitable due to network restrictions).""",
            "display_order": 6,
        },
        {
            "title": "Workload",
            "slug": "workload",
            "content": """This is the most differentiating part for PhysaFlow. Kubernetes documents that the scheduler evaluates locality, interference, and policy constraints; Volcano explicitly adds gang scheduling, fair-share, binpack, device share, and topology-aware scheduling.

Main categories: Scheduler fragmentation (jobs in queue with aggregate free capacity), Queue inefficiency (long wait times with low effective utilization), Gang scheduling failure (distributed jobs that do not start), Oversized reservations (resources reserved but not fully used).

If PhysaFlow omitted this layer, it would risk repeating the classic facility/DCIM bias: measuring only whether the infrastructure is 'ready', not whether it actually transforms into output.""",
            "display_order": 7,
        },
        {
            "title": "Economic Impact",
            "slug": "economic-impact",
            "content": """The economic impact of stranded capacity appears through two channels. The first is direct: CAPEX locked in facility or IT that is not fully monetized. The second is indirect: OPEX and premature expansion.

McKinsey projects US$ 6.7 trillion in cumulative global data center investment by 2030. IEA projects global data center electricity consumption to rise from approximately 415 TWh in 2024 to about 945 TWh by 2030. CBRE describes a supply tight scenario 'through 2030', with rising rents and highly compressed availability in key hubs.

In such a constrained environment, marginal capacity recovered within an existing site is worth more than in a market with abundant energy, land, and power. Every recovered capacity point avoids advanced CAPEX.""",
            "display_order": 8,
        },
        {
            "title": "Methodology",
            "slug": "methodology",
            "content": """When direct stranded capacity figures are not available, PhysaFlow should work with explicit proxies.

Three defensible proxies for the index:

1. Facility Stranded Capacity Ratio: 1 - (critical IT load actually deployable / available facility capacity)
2. IT Stranded Compute Ratio: 1 - (healthy & schedulable accelerators / installed accelerators)
3. Workload Stranded Output Ratio: 1 - (GPU-hours producing useful output / allocated GPU-hours)

These are not standard market metrics; they are a methodological proposal. Their value lies in forcing a shift from inventory language to performance language.""",
            "display_order": 9,
        },
        {
            "title": "References",
            "slug": "references",
            "content": """The most important sources for this research were:

- IEA on electricity demand, grid constraints, and data center projections
- Uptime Institute for rack density, PUE, and facility capacity utilization
- CBRE for vacancy, inventory, and market constraints
- McKinsey for investment scale
- USENIX papers and proceedings on cluster fragmentation and scheduling
- Official Kubernetes, Slurm, and Volcano documentation for scheduling
- Schneider Electric, Nlyte, Device42, and EkkoSense documentation for solution landscape

Limitation: there is no universally accepted standard for 'stranded capacity' applicable simultaneously to facility, IT, and workloads. Therefore, part of the value of this delivery is to synthesize and propose a common framework.""",
            "display_order": 10,
        },
    ]

    # Crear secciones para cada versión
    # Versiones ES (v1 DRAFT, v2 PUBLISHED)
    for version in versions_es:
        # Determinar status de las secciones según la versión
        section_status = (
            PublicationStatus.PUBLISHED
            if version.status == PublicationStatus.PUBLISHED
            else PublicationStatus.DRAFT
        )

        for section_data in sections_es:
            # Verificar si la sección ya existe
            existing = section_repository.get_by_slug(version.id, section_data["slug"])
            if not existing:
                section = Section(
                    report_version_id=version.id,
                    title=section_data["title"],
                    slug=section_data["slug"],
                    content=section_data["content"],
                    display_order=section_data["display_order"],
                    status=section_status,
                )
                section_repository.create(section)
                print(
                    f"✔ Sección '{section_data['title']}' creada para versión {version.version} ({version.language.value}) - {section_status.value}"
                )

    # Versiones EN (v1 DRAFT, v2 PUBLISHED)
    for version in versions_en:
        section_status = (
            PublicationStatus.PUBLISHED
            if version.status == PublicationStatus.PUBLISHED
            else PublicationStatus.DRAFT
        )

        for section_data in sections_en:
            existing = section_repository.get_by_slug(version.id, section_data["slug"])
            if not existing:
                section = Section(
                    report_version_id=version.id,
                    title=section_data["title"],
                    slug=section_data["slug"],
                    content=section_data["content"],
                    display_order=section_data["display_order"],
                    status=section_status,
                )
                section_repository.create(section)
                print(
                    f"✔ Sección '{section_data['title']}' creada para versión {version.version} ({version.language.value}) - {section_status.value}"
                )
