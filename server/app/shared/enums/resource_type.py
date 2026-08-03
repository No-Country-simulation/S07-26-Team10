import enum


class ResourceType(str, enum.Enum):
    IMAGE = "IMAGE"
    GRAPH = "GRAPH"
    DIAGRAM = "DIAGRAM"
    FILE = "FILE"