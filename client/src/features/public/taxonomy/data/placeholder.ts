import type { PublicTaxonomyCategory } from "@/features/public/taxonomy/types";

const en: PublicTaxonomyCategory[] = [
  {
    id: "facility",
    layerCode: "FAC",
    name: "Facility",
    description: "Electrical, thermal and spatial limits of the building itself.",
    concepts: [
      {
        id: "stranded-power",
        itemCode: "FAC-01",
        layerCode: "FAC",
        slug: "stranded-power",
        name: "Stranded power",
        label: "est",
        shortDescription:
          "Contracted or UPS capacity that cannot admit new critical load.",
        whatItIsNot:
          "Not unused power. It is committed, paid for, and structurally unable to serve another rack.",
        whatYouWouldObserve:
          "Contracted kW persistently above measured critical load, with no admission path.",
        whereTheNameComesFrom:
          "Data-centre capacity planning. Long-standing operator term for sold-out power that cannot be resold.",
      },
      {
        id: "stranded-cooling",
        itemCode: "FAC-02",
        layerCode: "FAC",
        slug: "stranded-cooling",
        name: "Stranded cooling",
        label: "est",
        shortDescription:
          "Active thermal capacity not removing heat from useful IT load.",
        whatItIsNot:
          "Not overcooling. The plant runs while the load it serves is idle or absent.",
        whatYouWouldObserve:
          "Cooling plant duty sustained while IT load in the served zone falls.",
        whereTheNameComesFrom:
          "Facility engineering. Used alongside stranded power in mechanical design literature.",
      },
      {
        id: "stranded-space",
        itemCode: "FAC-03",
        layerCode: "FAC",
        slug: "stranded-space",
        name: "Stranded space",
        label: "est",
        shortDescription:
          "Whitespace with floor area available and no power or cooling to serve it.",
        whatItIsNot:
          "Not vacancy. The shell is finished; the infrastructure to energize it is not.",
        whatYouWouldObserve:
          "Commissioned floor area with no upstream capacity assigned.",
        whereTheNameComesFrom:
          "Commercial real estate and colocation. Standard leasing term.",
      },
      {
        id: "distribution-limited-capacity",
        itemCode: "FAC-04",
        layerCode: "FAC",
        slug: "distribution-limited-capacity",
        name: "Distribution-limited capacity",
        label: "prop",
        shortDescription:
          "Power available at the room level but not deliverable at the rack.",
        whatItIsNot:
          "Distinct from stranded power. Capacity exists upstream; busway, branch circuit or PDU is the constraint.",
        whatYouWouldObserve:
          "Room-level headroom coexisting with rack-level breaker saturation.",
        whereTheNameComesFrom:
          "Proposed here. The constraint is discussed in practice; no agreed name was identified.",
      },
      {
        id: "redundancy-reserved-capacity",
        itemCode: "FAC-05",
        layerCode: "FAC",
        slug: "redundancy-reserved-capacity",
        name: "Redundancy-reserved capacity",
        label: "est",
        shortDescription:
          "Capacity held to satisfy a resiliency tier and never used in normal operation.",
        whatItIsNot:
          "Not waste. This is capacity working exactly as designed — and never producing output.",
        whatYouWouldObserve:
          "The delta between installed and single-path usable capacity.",
        whereTheNameComesFrom:
          "Resiliency tier standards. Follows directly from N+1 and 2N design conventions.",
      },
      {
        id: "grid-deferred-capacity",
        itemCode: "FAC-06",
        layerCode: "FAC",
        slug: "grid-deferred-capacity",
        name: "Grid-deferred capacity",
        label: "prop",
        shortDescription:
          "Equipment installed but not energized, pending interconnection or transmission.",
        whatItIsNot:
          "Not a construction delay. The facility is built; the grid connection is the binding constraint.",
        whatYouWouldObserve:
          "Commissioned equipment with an interconnection date in the future.",
        whereTheNameComesFrom:
          "Proposed here. Interconnection queues are widely reported; this specific framing is ours.",
      },
      {
        id: "derated-capacity",
        itemCode: "FAC-07",
        layerCode: "FAC",
        slug: "derated-capacity",
        name: "Derated capacity",
        label: "est",
        shortDescription:
          "Nameplate ratings reduced in practice by ambient conditions, altitude or safety margin.",
        whatItIsNot:
          "Not a failure. The gap between the rating on the plate and the rating in the room.",
        whatYouWouldObserve:
          "Sustained operating ceiling below manufacturer nameplate.",
        whereTheNameComesFrom:
          "Electrical and mechanical engineering. Derating is a standard specification practice.",
      },
    ],
  },
  {
    id: "it",
    layerCode: "IT",
    name: "IT",
    description: "Hardware present in the building but not reachable as a usable set.",
    concepts: [
      {
        id: "uncommissioned-hardware",
        itemCode: "IT-01",
        layerCode: "IT",
        slug: "uncommissioned-hardware",
        name: "Uncommissioned hardware",
        label: "prop",
        shortDescription:
          "Accelerators racked and powered but not yet accepted into the production pool.",
        whatItIsNot:
          "Not inventory in transit. The hardware is in place and drawing power.",
        whatYouWouldObserve:
          "Powered nodes absent from the scheduler inventory.",
        whereTheNameComesFrom:
          "Proposed here. Named as a distinct state so it is not counted as available.",
      },
      {
        id: "failed-or-quarantined-nodes",
        itemCode: "IT-02",
        layerCode: "IT",
        slug: "failed-or-quarantined-nodes",
        name: "Failed or quarantined nodes",
        label: "est",
        shortDescription:
          "Hardware present in the fleet but excluded by health checks.",
        whatItIsNot:
          "Not decommissioned hardware. These nodes remain racked, powered and counted in the fleet.",
        whatYouWouldObserve:
          "Nodes in a drain, quarantine or failed state across consecutive intervals.",
        whereTheNameComesFrom:
          "Cluster operations. Drain and quarantine states are standard scheduler vocabulary.",
      },
      {
        id: "gpu-fragmentation",
        itemCode: "IT-03",
        layerCode: "IT",
        slug: "gpu-fragmentation",
        name: "GPU fragmentation",
        label: "est",
        shortDescription:
          "Accelerators free individually but not assemblable into a contiguous set.",
        whatItIsNot:
          "Not low utilization. Aggregate free capacity can be high while no single job can be placed.",
        whatYouWouldObserve:
          "Free accelerator count above job size, with placement still failing.",
        whereTheNameComesFrom:
          "Scheduling and HPC research. Fragmentation is an established term in resource allocation.",
      },
      {
        id: "memory-bound-idle-compute",
        itemCode: "IT-04",
        layerCode: "IT",
        slug: "memory-bound-idle-compute",
        name: "Memory-bound idle compute",
        label: "est",
        shortDescription:
          "Accelerators whose memory is exhausted before their compute is.",
        whatItIsNot:
          "Not a scheduling problem. The device is busy by any occupancy metric and its arithmetic units are idle.",
        whatYouWouldObserve:
          "High memory occupancy with sustained low compute utilization.",
        whereTheNameComesFrom:
          "Accelerator performance analysis. The roofline distinction between memory and compute bound.",
      },
      {
        id: "topology-bottlenecked-compute",
        itemCode: "IT-05",
        layerCode: "IT",
        slug: "topology-bottlenecked-compute",
        name: "Topology-bottlenecked compute",
        label: "est",
        shortDescription:
          "Accelerators present but outside the interconnect domain a run requires.",
        whatItIsNot:
          "Not fragmentation. The nodes are contiguous in the scheduler and not contiguous in the fabric.",
        whatYouWouldObserve:
          "Eligible node count falling as the required interconnect domain widens.",
        whereTheNameComesFrom:
          "Distributed training and HPC networking. Topology-aware placement is well described.",
      },
      {
        id: "generation-mismatched-capacity",
        itemCode: "IT-06",
        layerCode: "IT",
        slug: "generation-mismatched-capacity",
        name: "Generation-mismatched capacity",
        label: "prop",
        shortDescription:
          "Older accelerators excluded because the workload assumes a uniform fleet.",
        whatItIsNot:
          "Not obsolescence. The hardware works and would contribute if the run tolerated heterogeneity.",
        whatYouWouldObserve:
          "Prior-generation nodes idle while current-generation nodes queue.",
        whereTheNameComesFrom:
          "Proposed here. Heterogeneity is discussed; this exclusion has no settled name.",
      },
    ],
  },
  {
    id: "workload",
    layerCode: "WKL",
    name: "Workload and operations",
    description:
      "Admission, placement and reservation behaviour once hardware is reachable.",
    concepts: [
      {
        id: "reserved-but-unused-capacity",
        itemCode: "WKL-01",
        layerCode: "WKL",
        slug: "reserved-but-unused-capacity",
        name: "Reserved-but-unused capacity",
        label: "prop",
        shortDescription:
          "Capacity held by a reservation or commitment that is not consuming it.",
        whatItIsNot:
          "Not idle capacity. This capacity is unavailable to anyone else by policy, not by physics.",
        whatYouWouldObserve:
          "Reservation window active with no corresponding running job.",
        whereTheNameComesFrom:
          "Proposed here. The behaviour is familiar to operators; the name is ours.",
      },
      {
        id: "queue-inefficiency",
        itemCode: "WKL-02",
        layerCode: "WKL",
        slug: "queue-inefficiency",
        name: "Queue inefficiency",
        label: "est",
        shortDescription:
          "Idle capacity coexisting with a non-empty queue.",
        whatItIsNot:
          "Not underdemand. Demand is present and measurable; the two simply do not meet.",
        whatYouWouldObserve:
          "Simultaneous non-zero queue depth and non-zero free capacity.",
        whereTheNameComesFrom:
          "Scheduling theory. A classic diagnostic in batch and HPC systems.",
      },
      {
        id: "failed-run-capacity",
        itemCode: "WKL-03",
        layerCode: "WKL",
        slug: "failed-run-capacity",
        name: "Failed-run capacity",
        label: "est",
        shortDescription:
          "Accelerator-hours consumed by runs that terminate without producing output.",
        whatItIsNot:
          "Not utilization. The device was busy. Nothing was produced.",
        whatYouWouldObserve:
          "Accelerator-hours attributed to jobs ending in a failure state.",
        whereTheNameComesFrom:
          "Large-scale training operations. Failure and restart overhead is openly discussed.",
      },
      {
        id: "idle-allocation",
        itemCode: "WKL-04",
        layerCode: "WKL",
        slug: "idle-allocation",
        name: "Idle allocation",
        label: "est",
        shortDescription:
          "Capacity assigned to a job that is not computing — waiting on data, checkpointing or stalled.",
        whatItIsNot:
          "Not free capacity. The allocation is held and cannot be reassigned.",
        whatYouWouldObserve:
          "Allocated devices with sustained near-zero compute utilization.",
        whereTheNameComesFrom:
          "Cluster operations. The gap between allocation and utilization is a standard concern.",
      },
      {
        id: "over-provisioned-allocation",
        itemCode: "WKL-05",
        layerCode: "WKL",
        slug: "over-provisioned-allocation",
        name: "Over-provisioned allocation",
        label: "est",
        shortDescription:
          "Capacity requested above what the job actually uses.",
        whatItIsNot:
          "Not a scheduling failure. The scheduler honoured the request; the request was wrong.",
        whatYouWouldObserve:
          "Requested resources persistently above observed peak usage.",
        whereTheNameComesFrom:
          "Capacity management. Request-versus-usage drift is widely documented in cluster practice.",
      },
    ],
  },
];

const es: PublicTaxonomyCategory[] = [
  {
    id: "facility",
    layerCode: "FAC",
    name: "Facility",
    description: "Límites eléctricos, térmicos y espaciales del edificio en sí.",
    concepts: [
      {
        id: "stranded-power",
        itemCode: "FAC-01",
        layerCode: "FAC",
        slug: "stranded-power",
        name: "Stranded power",
        label: "est",
        shortDescription:
          "Capacidad contratada o UPS que no puede admitir nueva carga crítica.",
        whatItIsNot:
          "No es energía sin usar. Está comprometida, pagada y estructuralmente incapaz de servir a otro rack.",
        whatYouWouldObserve:
          "kW contratados persistentemente por encima de la carga crítica medida, sin vía de admisión.",
        whereTheNameComesFrom:
          "Planificación de capacidad de centros de datos. Término de operadores de larga data para energía vendida que no puede revenderse.",
      },
      {
        id: "stranded-cooling",
        itemCode: "FAC-02",
        layerCode: "FAC",
        slug: "stranded-cooling",
        name: "Stranded cooling",
        label: "est",
        shortDescription:
          "Capacidad térmica activa que no está quitando calor a la carga útil de TI.",
        whatItIsNot:
          "No es sobreenfriamiento. La planta opera mientras la carga a la que sirve está inactiva o ausente.",
        whatYouWouldObserve:
          "Duty de la planta de refrigeración sostenido mientras cae la carga de TI en la zona servida.",
        whereTheNameComesFrom:
          "Ingeniería de instalaciones. Se usa junto a stranded power en la literatura de diseño mecánico.",
      },
      {
        id: "stranded-space",
        itemCode: "FAC-03",
        layerCode: "FAC",
        slug: "stranded-space",
        name: "Stranded space",
        label: "est",
        shortDescription:
          "Superficie blanca con piso disponible y sin energía o refrigeración para servirla.",
        whatItIsNot:
          "No es vacancia. La carcasa está terminada; la infraestructura para energizarla no.",
        whatYouWouldObserve:
          "Superficie de piso comisionada sin capacidad aguas arriba asignada.",
        whereTheNameComesFrom:
          "Bienes raíces comerciales y colocation. Término de arrendamiento estándar.",
      },
      {
        id: "distribution-limited-capacity",
        itemCode: "FAC-04",
        layerCode: "FAC",
        slug: "distribution-limited-capacity",
        name: "Distribution-limited capacity",
        label: "prop",
        shortDescription:
          "Energía disponible a nivel de sala pero no entregable a nivel de rack.",
        whatItIsNot:
          "Distinto de stranded power. La capacidad existe aguas arriba; la restricción es el busway, el circuito ramal o el PDU.",
        whatYouWouldObserve:
          "Margen a nivel de sala coexistiendo con saturación de breakers a nivel de rack.",
        whereTheNameComesFrom:
          "Propuesto aquí. La restricción se discute en la práctica; no se identificó un nombre consensuado.",
      },
      {
        id: "redundancy-reserved-capacity",
        itemCode: "FAC-05",
        layerCode: "FAC",
        slug: "redundancy-reserved-capacity",
        name: "Redundancy-reserved capacity",
        label: "est",
        shortDescription:
          "Capacidad retenida para cumplir un nivel de resiliencia y nunca usada en operación normal.",
        whatItIsNot:
          "No es desperdicio. Es capacidad trabajando exactamente como fue diseñada — y nunca produciendo salida.",
        whatYouWouldObserve:
          "El delta entre capacidad instalada y capacidad utilizable de un solo camino.",
        whereTheNameComesFrom:
          "Estándares de niveles de resiliencia. Deriva directamente de las convenciones de diseño N+1 y 2N.",
      },
      {
        id: "grid-deferred-capacity",
        itemCode: "FAC-06",
        layerCode: "FAC",
        slug: "grid-deferred-capacity",
        name: "Grid-deferred capacity",
        label: "prop",
        shortDescription:
          "Equipamiento instalado pero no energizado, pendiente de interconexión o transmisión.",
        whatItIsNot:
          "No es un retraso de construcción. La instalación está construida; la conexión a la red es la restricción vinculante.",
        whatYouWouldObserve:
          "Equipamiento comisionado con fecha de interconexión en el futuro.",
        whereTheNameComesFrom:
          "Propuesto aquí. Las colas de interconexión se reportan ampliamente; este encuadre específico es nuestro.",
      },
      {
        id: "derated-capacity",
        itemCode: "FAC-07",
        layerCode: "FAC",
        slug: "derated-capacity",
        name: "Derated capacity",
        label: "est",
        shortDescription:
          "Ratings de placa reducidos en la práctica por condiciones ambientales, altitud o margen de seguridad.",
        whatItIsNot:
          "No es una falla. Es la brecha entre el rating de la placa y el rating en la sala.",
        whatYouWouldObserve:
          "Techo operativo sostenido por debajo del nameplate del fabricante.",
        whereTheNameComesFrom:
          "Ingeniería eléctrica y mecánica. El derating es una práctica de especificación estándar.",
      },
    ],
  },
  {
    id: "it",
    layerCode: "IT",
    name: "IT",
    description:
      "Hardware presente en el edificio pero no alcanzable como un conjunto utilizable.",
    concepts: [
      {
        id: "uncommissioned-hardware",
        itemCode: "IT-01",
        layerCode: "IT",
        slug: "uncommissioned-hardware",
        name: "Uncommissioned hardware",
        label: "prop",
        shortDescription:
          "Aceleradores montados y energizados pero aún no aceptados en el pool de producción.",
        whatItIsNot:
          "No es inventario en tránsito. El hardware está en su lugar y consumiendo energía.",
        whatYouWouldObserve:
          "Nodos energizados ausentes del inventario del scheduler.",
        whereTheNameComesFrom:
          "Propuesto aquí. Nombrado como un estado distinto para que no se cuente como disponible.",
      },
      {
        id: "failed-or-quarantined-nodes",
        itemCode: "IT-02",
        layerCode: "IT",
        slug: "failed-or-quarantined-nodes",
        name: "Failed or quarantined nodes",
        label: "est",
        shortDescription:
          "Hardware presente en la flota pero excluido por los health checks.",
        whatItIsNot:
          "No es hardware decomisionado. Estos nodos siguen montados, energizados y contados en la flota.",
        whatYouWouldObserve:
          "Nodos en estado de drenaje, cuarentena o falla en intervalos consecutivos.",
        whereTheNameComesFrom:
          "Operaciones de cluster. Los estados de drenaje y cuarentena son vocabulario estándar del scheduler.",
      },
      {
        id: "gpu-fragmentation",
        itemCode: "IT-03",
        layerCode: "IT",
        slug: "gpu-fragmentation",
        name: "GPU fragmentation",
        label: "est",
        shortDescription:
          "Aceleradores libres individualmente pero no ensamblables en un conjunto contiguo.",
        whatItIsNot:
          "No es baja utilización. La capacidad libre agregada puede ser alta mientras ningún job individual puede ubicarse.",
        whatYouWouldObserve:
          "Cantidad de aceleradores libres por encima del tamaño del job, con placement todavía fallando.",
        whereTheNameComesFrom:
          "Investigación de scheduling y HPC. La fragmentación es un término establecido en la asignación de recursos.",
      },
      {
        id: "memory-bound-idle-compute",
        itemCode: "IT-04",
        layerCode: "IT",
        slug: "memory-bound-idle-compute",
        name: "Memory-bound idle compute",
        label: "est",
        shortDescription:
          "Aceleradores cuya memoria se agota antes que su cómputo.",
        whatItIsNot:
          "No es un problema de scheduling. El dispositivo está ocupado por cualquier métrica de ocupación y sus unidades aritméticas están inactivas.",
        whatYouWouldObserve:
          "Alta ocupación de memoria con utilización de cómputo sostenidamente baja.",
        whereTheNameComesFrom:
          "Análisis de performance de aceleradores. La distinción roofline entre memoria y cómputo.",
      },
      {
        id: "topology-bottlenecked-compute",
        itemCode: "IT-05",
        layerCode: "IT",
        slug: "topology-bottlenecked-compute",
        name: "Topology-bottlenecked compute",
        label: "est",
        shortDescription:
          "Aceleradores presentes pero fuera del dominio de interconexión que un run requiere.",
        whatItIsNot:
          "No es fragmentación. Los nodos son contiguos en el scheduler y no contiguos en el fabric.",
        whatYouWouldObserve:
          "El conteo de nodos elegibles cae a medida que se amplía el dominio de interconexión requerido.",
        whereTheNameComesFrom:
          "Entrenamiento distribuido y redes de HPC. El placement consciente de topología está bien descrito.",
      },
      {
        id: "generation-mismatched-capacity",
        itemCode: "IT-06",
        layerCode: "IT",
        slug: "generation-mismatched-capacity",
        name: "Generation-mismatched capacity",
        label: "prop",
        shortDescription:
          "Aceleradores más antiguos excluidos porque la carga asume una flota uniforme.",
        whatItIsNot:
          "No es obsolescencia. El hardware funciona y contribuiría si el run tolerara heterogeneidad.",
        whatYouWouldObserve:
          "Nodos de generación previa inactivos mientras los de generación actual están en cola.",
        whereTheNameComesFrom:
          "Propuesto aquí. La heterogeneidad se discute; esta exclusión no tiene nombre establecido.",
      },
    ],
  },
  {
    id: "workload",
    layerCode: "WKL",
    name: "Workload y operaciones",
    description:
      "Comportamiento de admisión, placement y reserva una vez que el hardware es alcanzable.",
    concepts: [
      {
        id: "reserved-but-unused-capacity",
        itemCode: "WKL-01",
        layerCode: "WKL",
        slug: "reserved-but-unused-capacity",
        name: "Reserved-but-unused capacity",
        label: "prop",
        shortDescription:
          "Capacidad retenida por una reserva o compromiso que no la está consumiendo.",
        whatItIsNot:
          "No es capacidad inactiva. Esta capacidad no está disponible para nadie más por política, no por física.",
        whatYouWouldObserve:
          "Ventana de reserva activa sin un job corriendo correspondiente.",
        whereTheNameComesFrom:
          "Propuesto aquí. El comportamiento es familiar para los operadores; el nombre es nuestro.",
      },
      {
        id: "queue-inefficiency",
        itemCode: "WKL-02",
        layerCode: "WKL",
        slug: "queue-inefficiency",
        name: "Queue inefficiency",
        label: "est",
        shortDescription:
          "Capacidad inactiva coexistiendo con una cola no vacía.",
        whatItIsNot:
          "No es falta de demanda. La demanda está presente y es medible; simplemente no se encuentran.",
        whatYouWouldObserve:
          "Profundidad de cola no nula y capacidad libre no nula de forma simultánea.",
        whereTheNameComesFrom:
          "Teoría de scheduling. Un diagnóstico clásico en sistemas batch y HPC.",
      },
      {
        id: "failed-run-capacity",
        itemCode: "WKL-03",
        layerCode: "WKL",
        slug: "failed-run-capacity",
        name: "Failed-run capacity",
        label: "est",
        shortDescription:
          "Horas de acelerador consumidas por runs que terminan sin producir salida.",
        whatItIsNot:
          "No es utilización. El dispositivo estuvo ocupado. Nada se produjo.",
        whatYouWouldObserve:
          "Horas de acelerador atribuidas a jobs que terminan en estado de falla.",
        whereTheNameComesFrom:
          "Operaciones de entrenamiento a gran escala. El overhead de fallas y reinicios se discute abiertamente.",
      },
      {
        id: "idle-allocation",
        itemCode: "WKL-04",
        layerCode: "WKL",
        slug: "idle-allocation",
        name: "Idle allocation",
        label: "est",
        shortDescription:
          "Capacidad asignada a un job que no está computando — esperando datos, haciendo checkpoint o detenido.",
        whatItIsNot:
          "No es capacidad libre. La asignación está retenida y no puede reasignarse.",
        whatYouWouldObserve:
          "Dispositivos asignados con utilización de cómputo sostenidamente cercana a cero.",
        whereTheNameComesFrom:
          "Operaciones de cluster. La brecha entre asignación y utilización es una preocupación estándar.",
      },
      {
        id: "over-provisioned-allocation",
        itemCode: "WKL-05",
        layerCode: "WKL",
        slug: "over-provisioned-allocation",
        name: "Over-provisioned allocation",
        label: "est",
        shortDescription:
          "Capacidad solicitada por encima de lo que el job realmente usa.",
        whatItIsNot:
          "No es una falla del scheduler. El scheduler honró la solicitud; la solicitud estaba mal.",
        whatYouWouldObserve:
          "Recursos solicitados persistentemente por encima del uso pico observado.",
        whereTheNameComesFrom:
          "Gestión de capacidad. La deriva entre solicitud y uso está ampliamente documentada en la práctica de clusters.",
      },
    ],
  },
];

export const placeholderTaxonomy: Record<"es" | "en", PublicTaxonomyCategory[]> = {
  es,
  en,
};