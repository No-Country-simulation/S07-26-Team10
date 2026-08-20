# PhysaFlow Backend

Backend del proyecto **PhysaFlow – Stranded Capacity Report**, desarrollado con **FastAPI** siguiendo una **arquitectura modular por funcionalidades (Feature-Based Architecture)**.

El objetivo de este backend es proporcionar una **API REST** para administrar el contenido editorial del reporte, la taxonomía de **Stranded Capacity** y el panel de administración, sirviendo como base para la evolución futura del proyecto.

---

# Descripción del proyecto

PhysaFlow busca convertirse en una referencia sobre **Stranded Capacity** en centros de datos mediante la publicación de un reporte técnico de acceso público.

Este backend permite administrar de forma centralizada:

- Reportes
- Secciones
- Recursos
- Referencias bibliográficas
- Categorías
- Conceptos
- Usuarios administradores
- Autenticación

La API está diseñada para ser escalable, mantenible y fácilmente extensible mediante módulos independientes.

---

# Tecnologías

- Python 3.13+
- FastAPI
- PostgreSQL
- SQLAlchemy 2.0
- Alembic
- Pydantic v2
- JWT Authentication
- Passlib + bcrypt
- Uvicorn
- Swagger / OpenAPI

---

# Arquitectura

El proyecto utiliza una **Feature-Based Architecture**, donde cada funcionalidad posee sus propios componentes.

Cada módulo incluye:

```text
module/
├── model.py
├── schema.py
├── repository.py
├── service.py
└── router.py
```

Esta organización facilita:

- Separación de responsabilidades.
- Escalabilidad.
- Bajo acoplamiento.
- Trabajo colaborativo.
- Mantenimiento a largo plazo.

---

# Estructura del proyecto

```text
app/
├── api/
│   └── v1/
│       ├── endpoints/
│       └── router.py
│
├── core/
│   ├── config.py
│   ├── constants.py
│   ├── database.py
│   ├── dependencies.py
│   └── security.py
│
├── db/
│   ├── __init__.py
│   └── models.py
│
├── exceptions/
│
├── middleware/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── reports/
│   ├── sections/
│   ├── resources/
│   ├── references/
│   ├── categories/
│   └── concepts/
│
├── shared/
│   ├── schemas/
│   └── utils/
│
└── main.py

alembic/
tests/
requirements.txt
README.md
```

---

# Funcionalidades del MVP

## Portal público

- Visualización del reporte principal.
- Navegación entre las secciones del reporte.
- Visualización del índice del reporte.
- Consulta del contenido de las secciones.
- Exploración de la taxonomía del reporte organizada mediante categorías y conceptos.
- Visualización de recursos (imágenes, gráficos, diagramas y archivos).
- Descarga de recursos publicados.
- Consulta de referencias bibliográficas.
- Consulta del formato recomendado para citar el reporte.

## Panel de administración

- Autenticación del administrador mediante JWT.
- Gestión de usuarios administradores.
- Administración de reportes.
- Administración de secciones.
- Administración de recursos.
- Administración de categorías.
- Administración de conceptos.
- Administración de referencias bibliográficas.

---

# Modelo de datos

El modelo de datos está centrado en la entidad **Report**, que agrupa tanto el contenido editorial como la taxonomía del proyecto.

```text
Report
├── Sections
│   └── Resources
├── Categories
│   └── Concepts
└── References
```

La estructura editorial (**Sections**) y la estructura taxonómica (**Categories** y **Concepts**) se modelan de forma independiente, permitiendo desacoplar el contenido del reporte de la clasificación del conocimiento.

Los recursos asociados a una sección utilizan el tipo enumerado **ResourceType**:

- IMAGE
- GRAPH
- DIAGRAM
- FILE

---

# Base de datos

**Motor**

- PostgreSQL

**ORM**

- SQLAlchemy 2.0

**Migraciones**

- Alembic

---

# Instalación

## 1. Clonar el repositorio

```bash
git clone <repository-url>
cd server
```

## 2. Crear entorno virtual

### Linux / macOS

```bash
python -m venv .venv
source .venv/bin/activate
```

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

---

## 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

---

## 4. Configurar variables de entorno

Crear un archivo:

```text
.env
```

Ejemplo:

```env
APP_NAME=PhysaFlow API
APP_VERSION=1.0.0

DEBUG=True

DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE

SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

## 5. Ejecutar migraciones

```bash
alembic upgrade head
```

---

## 6. Iniciar el servidor

```bash
uvicorn app.main:app --reload
```

La API estará disponible en:

```text
http://127.0.0.1:8000
```

---

# Documentación

## Swagger UI

```text
/docs
```

## ReDoc

```text
/redoc
```

---

# Convenciones del proyecto

- Arquitectura modular por funcionalidades.
- Separación de responsabilidades mediante Router, Service y Repository.
- Modelos implementados con SQLAlchemy 2.0.
- Validaciones mediante Pydantic v2.
- Migraciones administradas con Alembic.
- Excepciones personalizadas.
- Tipado completo.
- Respuestas JSON consistentes.
- Organización del código basada en módulos independientes.

---

# Seguridad

- Autenticación mediante JWT.
- Hash de contraseñas con bcrypt.
- Acceso restringido a usuarios administradores autenticados.
- Variables de entorno mediante `.env`.

---

# Calidad de código

El proyecto utiliza herramientas para mantener un código consistente y de alta calidad.

- Black
- Ruff
- isort
- Pytest

---

# Estado del proyecto

El proyecto se encuentra en desarrollo como backend del MVP de **PhysaFlow – Stranded Capacity Report**.

Actualmente proporciona la infraestructura necesaria para administrar el contenido editorial del reporte, la taxonomía de **Stranded Capacity**, los recursos asociados y el panel de administración mediante una API REST desarrollada con FastAPI.