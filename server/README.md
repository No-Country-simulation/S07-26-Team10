# PhysaFlow Backend

Backend del proyecto **PhysaFlow – Stranded Capacity Report**, desarrollado con **FastAPI** siguiendo una arquitectura modular por funcionalidades (Feature-Based Architecture).

El objetivo de este backend es proporcionar una API REST para gestionar el contenido del reporte, el panel de administración y futuras funcionalidades del proyecto.

---

# Descripción del proyecto

PhysaFlow busca convertirse en la principal referencia mundial sobre **Stranded Capacity** en centros de datos.

Este backend permitirá administrar de forma centralizada:

- Reportes
- Secciones
- Recursos (imágenes, gráficos, archivos)
- Referencias bibliográficas
- Categorías
- Conceptos
- Usuarios
- Roles
- Autenticación

Además, servirá como base para futuras versiones del CMS de PhysaFlow.

---

# Tecnologías

- Python 3.13+
- FastAPI
- PostgreSQL
- SQLAlchemy 2.0
- Alembic
- Pydantic v2
- JWT Authentication
- Swagger / OpenAPI
- Uvicorn
- Docker

---

# Arquitectura

El proyecto utiliza una **arquitectura modular por funcionalidades (Feature-Based Architecture)**.

Cada módulo contiene toda la lógica relacionada con una funcionalidad específica.

Ejemplo:

```text
modules/
    reports/
        router.py
        service.py
        repository.py
        model.py
        schema.py
```

Esto facilita:

- Separación de responsabilidades.
- Escalabilidad.
- Mantenimiento.
- Trabajo colaborativo.

---

# Estructura del proyecto

```text
physaflow-backend/

├── app/
│
├── core/
│   ├── config.py
│   ├── database.py
│   ├── security.py
│   ├── dependencies.py
│   └── constants.py
│
├── api/
│   └── v1/
│       └── router.py
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
├── exceptions/
│
├── middleware/
│
├── shared/
│   ├── base.py
│   ├── responses.py
│   └── utils.py
│
├── tests/
│
├── alembic/
│
├── .env
├── .env.example
├── requirements.txt
├── alembic.ini
└── README.md
```

---

# Funcionalidades del MVP

## Público

- Visualización del reporte.
- Listado de secciones.
- Consulta de conceptos.
- Recursos descargables.
- Referencias bibliográficas.

## Administración

- Autenticación mediante JWT.
- Gestión de usuarios.
- Gestión de roles.
- CRUD de reportes.
- CRUD de secciones.
- CRUD de recursos.
- CRUD de categorías.
- CRUD de conceptos.
- CRUD de referencias.

---

# Base de datos

Motor:

- PostgreSQL

ORM:

- SQLAlchemy 2.0

Migraciones:

- Alembic

---

# Documentación

La API contará con documentación automática mediante Swagger.

Disponible en:

```
/docs
```

Y documentación ReDoc en:

```
/redoc
```

---

# Convenciones

- Arquitectura modular.
- Separación entre Router, Service y Repository.
- Validaciones mediante Pydantic.
- Modelos con SQLAlchemy.
- Migraciones mediante Alembic.
- Excepciones personalizadas.
- Respuestas JSON consistentes.
- Código documentado y tipado.

---

# Seguridad

- JWT Authentication.
- Hash de contraseñas con bcrypt.
- Control de roles.
- Variables de entorno mediante `.env`.

