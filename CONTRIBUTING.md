# Guía de Contribución — PinBoard

Gracias por contribuir a PinBoard. Lee esta guía completa antes de hacer cualquier cambio al repositorio.

---

## Tabla de Contenidos

- [Flujo de Trabajo](#flujo-de-trabajo)
- [Estructura de Ramas](#estructura-de-ramas)
- [Convención de Nombres](#convención-de-nombres)
- [Flujos Paso a Paso](#flujos-paso-a-paso)
- [Mensajes de Commit](#mensajes-de-commit)
- [Reglas del Equipo](#reglas-del-equipo)
- [Rebase vs Pull](#rebase-vs-pull)

---

## Flujo de Trabajo

Este repositorio sigue **Git Flow** como estrategia de ramificación.

> **Regla fundamental:** nadie hace push directo a `main` ni a `develop`. Todo cambio entra mediante un Pull Request revisado por al menos un colaborador.

---

## Estructura de Ramas

| Rama | Propósito | Sale de | Mergea en |
|------|-----------|---------|-----------|
| `main` | Producción. Siempre estable y desplegable. | — | — |
| `develop` | Integración. Aquí convergen los features completados. | `main` | — |
| `feature/*` | Desarrollo de una nueva funcionalidad. | `develop` | `develop` |
| `release/*` | Preparación y ajuste previo a producción. | `develop` | `main` y `develop` |
| `hotfix/*` | Corrección urgente de un bug en producción. | `main` | `main` y `develop` |

> `release/*` y `hotfix/*` mergean en **ambas** ramas (`main` y `develop`) para que `develop` no quede desactualizado respecto a lo que está en producción.

---

## Convención de Nombres

```
feature/NombreDelServicio_DescripcionCorta
release/vX.Y.Z
hotfix/DescripcionDelBug
```

**Ejemplos:**

```
feature/Auth_Service
feature/User_Service_JWT
feature/Gateway_RateLimit
release/v1.0.0
hotfix/Auth_TokenExpiration
```

---

## Flujos Paso a Paso

### 1. Trabajar en un Feature

```bash
# 1. Asegúrate de tener develop actualizado
git checkout develop
git pull origin develop

# 2. Crea la rama del feature
git checkout -b feature/Auth_Service

# 3. Trabaja y haz commits descriptivos
git add .
git commit -m "feat(auth): implement JWT login endpoint"

# 4. Mantén tu rama actualizada con develop (antes de pushear)
git fetch origin
git rebase origin/develop

# 5. Sube tu rama y abre un Pull Request hacia develop
git push origin feature/Auth_Service
```

> Una vez mergeado el PR, elimina la rama local y remota.

---

### 2. Preparar un Release

```bash
# 1. Crea la rama de release desde develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# 2. Solo ajustes finales — no se agregan features nuevos aquí
git commit -m "chore: bump version to v1.0.0"

# 3. Mergea en main con tag de versión
git checkout main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags

# 4. Mergea también en develop para no perder los ajustes
git checkout develop
git merge --no-ff release/v1.0.0
git push origin develop

# 5. Elimina la rama
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

---

### 3. Corregir un Bug Crítico en Producción (Hotfix)

```bash
# 1. Crea la rama desde main
git checkout main
git pull origin main
git checkout -b hotfix/Auth_TokenExpiration

# 2. Aplica la corrección
git commit -m "fix(auth): correct token expiration validation"

# 3. Mergea en main con tag
git checkout main
git merge --no-ff hotfix/Auth_TokenExpiration
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git push origin main --tags

# 4. Mergea también en develop
git checkout develop
git merge --no-ff hotfix/Auth_TokenExpiration
git push origin develop

# 5. Elimina la rama
git branch -d hotfix/Auth_TokenExpiration
git push origin --delete hotfix/Auth_TokenExpiration
```

---

## Mensajes de Commit

Seguimos la convención **Conventional Commits**:

```
feat(servicio): descripción corta       → nueva funcionalidad
fix(servicio): descripción corta        → corrección de bug
chore: descripción corta                → tareas de mantenimiento
docs: descripción corta                 → cambios en documentación
refactor(servicio): descripción corta   → refactorización sin cambio de comportamiento
```

**Ejemplos:**

```
feat(auth): implement JWT login endpoint
fix(user): correct password hashing logic
chore: update docker-compose dependencies
docs: add setup instructions to README
refactor(gateway): simplify routing middleware
```

---

## Reglas del Equipo

- **Nunca** hacer push directo a `main` o `develop`.
- **Siempre** abrir un Pull Request y esperar revisión de al menos un colaborador.
- Una rama de `feature/*` debe ser de **vida corta**. Si llevas más de una semana sin mergear, revisa cómo dividiste el trabajo.
- Al terminar un feature, **elimina la rama** tanto local como remota.
- Usar `--no-ff` en todos los merges de ramas principales para preservar el historial.

---

## Rebase vs Pull

Al mantener tu rama actualizada con `develop`, usa `rebase` en lugar de `pull`:

```bash
# Correcto — mantiene el historial limpio
git fetch origin
git rebase origin/develop

# Genera commits de merge innecesarios
git pull origin develop
```

**Regla de oro del rebase:**

> Nunca hagas rebase sobre commits que ya existen en el repositorio remoto y que otros colaboradores puedan tener en su local.

En la práctica:

| Situación | Acción |
|-----------|--------|
| Antes de hacer push | `rebase` libremente |
| Después de push, sin PR abierto | `rebase` con precaución |
| Con PR abierto y revisores | Nunca `rebase`, usa `merge` |