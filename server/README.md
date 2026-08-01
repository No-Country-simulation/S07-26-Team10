# PhysaFlow Backend

Backend del proyecto **PhysaFlow – Stranded Capacity Report**, desarrollado con **FastAPI** siguiendo una **arquitectura modular por funcionalidades (Feature-Based Architecture)**.

El objetivo de este backend es proporcionar una API REST para gestionar el contenido del reporte, el panel de administración y servir como base para futuras funcionalidades del proyecto.

---

# Descripción del proyecto

PhysaFlow busca convertirse en una referencia sobre **Stranded Capacity** en centros de datos.

Este backend permite administrar de forma centralizada:

- Reportes
- Secciones
- Recursos
- Referencias bibliográficas
- Categorías
- Conceptos
- Usuarios
- Roles
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
│   ├── roles/
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
- Navegación entre secciones e índice del reporte.
- Consulta del contenido de las secciones.
- Visualización de recursos (imágenes, gráficos y diagramas).
- Exploración de la taxonomía mediante categorías y conceptos.
- Descarga de recursos publicados.
- Consulta de referencias bibliográficas.
- Consulta del formato recomendado para citar el reporte.

## Panel de administración

- Autenticación mediante JWT.
- Gestión de usuarios y roles.
- Administración de reportes.
- Administración de secciones.
- Administración de recursos.
- Administración de categorías.
- Administración de conceptos.
- Administración de referencias bibliográficas.

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

Linux/macOS

```bash
python -m venv .venv
source .venv/bin/activate
```

Windows

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

```
http://127.0.0.1:8000
```

---

# Documentación

Swagger UI

```
/docs
```

ReDoc

```
/redoc
```

---

# Convenciones del proyecto

- Arquitectura modular por funcionalidades.
- Separación en Router, Service y Repository.
- Modelos con SQLAlchemy.
- Validaciones mediante Pydantic.
- Migraciones con Alembic.
- Excepciones personalizadas.
- Tipado completo.
- Respuestas JSON consistentes.

---

# Seguridad

- JWT Authentication.
- Hash de contraseñas con bcrypt.
- Control de acceso basado en roles.
- Variables de entorno mediante `.env`.

---

# Calidad de código

El proyecto utiliza herramientas para mantener un código consistente.

- Black
- Ruff
- isort
- Pytest

---

# Estado del proyecto

Actualmente se encuentra en desarrollo como backend del MVP de **PhysaFlow – Stranded Capacity Report**.