# Configurar GitHub Actions con Trusted Publishing (OIDC) para npm

## Paso 1: Crear repositorio en GitHub

```bash
gh repo create mcp-confluence --public --source=. --remote=origin --push
```

O manualmente en https://github.com/new

## Paso 2: Configurar Trusted Publishing en npm

### 2.1 En npm (https://www.npmjs.com)

1. Ve a tu perfil → **Organizations** (o **Packages** si no tienes org)
2. Ve a **Publishing** en las configuraciones
3. Habilita **Trusted Publishing** y configura:
   - **Provider**: GitHub Actions
   - **Organization**: tu-usuario-github
   - **Repository**: mcp-confluence
   - **Workflow file**: `.github/workflows/publish.yml`

### 2.2 O si usas una organización en npm

1. Ve a https://www.npmjs.com/org/jsalamanc_01/manage
2. Busca "Publishing" o "Trusted Publishing"
3. Configura lo mismo pero apuntando a tu repo

## Paso 3: Publicar

1. Haz push del código a GitHub:
```bash
git push -u origin master
```

2. Crea un tag y haz push:
```bash
git tag v0.2.0
git push origin v0.2.0
```

3. Verifica el workflow en GitHub → **Actions**

## Ventajas de Trusted Publishing (OIDC)

✅ No necesitas tokens en GitHub Secrets
✅ Cada publicación está firmada y verificable
✅ Más seguro que tokens de larga vida
✅ Compatible con npm's new security model

## Solucionar problemas

Si GitHub Actions falla con "401 Unauthorized":

1. Verifica que Trusted Publishing esté habilitado en npm
2. Comprueba que la configuración coincide (org, repo, workflow)
3. El archivo del workflow debe estar en `.github/workflows/publish.yml`

## Referencias

- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers)
- [GitHub Actions + npm](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
