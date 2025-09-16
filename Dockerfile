# syntax=docker/dockerfile:1.7

### BUILD: compile Angular (prod)
FROM node:22-alpine AS build
WORKDIR /app

# Déps en mode propre et reproductible
COPY package*.json ./
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true
RUN npm ci

# Sources + build
COPY . .
ARG BUILD_CONFIGURATION=production
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build -- --configuration ${BUILD_CONFIGURATION}

### PROD: Apache httpd pour SPA/SSR
FROM httpd:2.4-alpine AS prod

# Activer mod_rewrite et config SPA
RUN sed -i 's/^#LoadModule rewrite_module/LoadModule rewrite_module/' /usr/local/apache2/conf/httpd.conf \
 && cat >> /usr/local/apache2/conf/httpd.conf <<'CONF'
# Répertoire web
<Directory "/usr/local/apache2/htdocs">
  AllowOverride All
  Require all granted
  Options -Indexes +FollowSymLinks
  DirectoryIndex index.html
</Directory>

# Fallback SPA : si fichier/dossier n'existe pas => index.html
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule . /index.html [L]
</IfModule>
CONF

# Enlever la page 'It works' par défaut d'Apache
RUN rm -f /usr/local/apache2/htdocs/index.html

# IMPORTANT : mets ici TA vraie sortie Angular
# - SPA : dist/template
# - SSR : dist/template/browser
ARG ANGULAR_DIST=template/browser
COPY --from=build /app/dist/${ANGULAR_DIST}/ /usr/local/apache2/htdocs/

EXPOSE 80
