# syntax=docker/dockerfile:1.7

### BUILD: compile Angular (prod)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# Garde cette ligne si tu as des soucis de peer deps; sinon tu peux l'enlever
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true
RUN npm ci
COPY . .
ARG BUILD_CONFIGURATION=production
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build -- --configuration ${BUILD_CONFIGURATION}

### PROD: Apache httpd pour SPA
FROM httpd:2.4-alpine AS prod

# Activer mod_rewrite + config "safe" pour une SPA
RUN sed -i 's/^#LoadModule rewrite_module/LoadModule rewrite_module/' /usr/local/apache2/conf/httpd.conf \
 && cat >> /usr/local/apache2/conf/httpd.conf <<'CONF'
# Répertoire web
<Directory "/usr/local/apache2/htdocs">
  AllowOverride All
  Require all granted
  Options -Indexes +FollowSymLinks
  DirectoryIndex index.html
</Directory>

# Fallback SPA : ne pas réécrire si le fichier ou le dossier existe
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  # Sinon, renvoyer index.html
  RewriteRule . /index.html [L]
</IfModule>
CONF

# IMPORTANT : mets ici TA vraie sortie Angular
# - SPA: dist/template
# - SSR: dist/template/browser
ARG ANGULAR_DIST=template
COPY --from=build /app/dist/${ANGULAR_DIST}/ /usr/local/apache2/htdocs/

EXPOSE 80
