import type { TaxonomyCategory } from "@/lib/taxonomy-types"

export const taxonomyData: TaxonomyCategory[] = [
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
    description:
      "Hardware present in the building but not reachable as a usable set.",
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
]