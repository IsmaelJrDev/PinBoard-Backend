# PinBoard

PinBoard es una aplicación web construida bajo Sistemas Distribuidos, basándonos en una arquitectura de microservicios, así como clúster de bases de datos.

---

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Cómo Contribuir](#cómo-contribuir)

---

## Descripción

PinBoard es un sistema distribuido construido con arquitectura de microservicios. Cada servicio es independiente, se comunica a través de una API Gateway, y se despliega mediante contenedores Docker. La persistencia de datos se maneja con un clúster de MongoDB con múltiples replica sets.

---

## Arquitectura General del sistema

![alt text](Arquitectura.svg)

---

## Arquitectura backend

![alt text](<Diagrama Backend.svg>)

---
## Tecnologías

| Tecnología | Uso |
|------------|-----|
| Node.js | Runtime para los microservicios |
| MongoDB y PostgreSQL | Base de datos con replica sets |
| Docker / Docker Compose | Contenedorización y orquestación local |
| Nginx | API Gateway |

---

## Estructura del Proyecto

```
pinboard/
├── microservicio_1/           
│   ├── models/                ← Esquemas de base de datos
│   ├── routes/                ← Definición de endpoints
│   ├── index.js               ← Entry point del servicio
│   ├── package.json           
│   ├── package-lock.json
│   └── Dockerfile             ← (Recomendado) Para el despliegue
│
├── microservicio_2/           
│   ├── middleware/            ← Lógica de validación/seguridad
│   ├── models/                
│   ├── routes/                
│   ├── index.js               
│   ├── package.json           
│   ├── package-lock.json
│   └── Dockerfile             ← (Recomendado) Para el despliegue
│
├── nginx/                     ← Tu Gateway / Reverse Proxy
│   └── default.conf           ← Configuración de rutas de Nginx
│
├── .gitignore                 ← Para ignorar node_modules y .env
├── README.md                  ← Documentación técnica
└── docker-compose.yml         ← Orquestador Local
```

---

## Cómo Contribuir

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para conocer el flujo de trabajo, convención de ramas y estándares de commits.