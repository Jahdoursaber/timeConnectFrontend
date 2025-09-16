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

# 1) Activer mod_rewrite et inclure notre conf SPA
RUN sed -i 's/^#LoadModule rewrite_module/LoadModule rewrite_module/' /usr/local/apache2/conf/httpd.conf \
 && printf '\nServerName localhost\nInclude conf/extra/spa.conf\n' >> /usr/local/apache2/conf/httpd.conf

# 2) Conf SPA sûre (pas de Listen ici, pas de .htaccess requis)
RUN mkdir -p /usr/local/apache2/conf/extra \
 && cat > /usr/local/apache2/conf/extra/spa.conf <<'CONF'
<Directory "/usr/local/apache2/htdocs">
  AllowOverride None
  Require all granted
  Options -Indexes +FollowSymLinks
  DirectoryIndex index.html
</Directory>

<IfModule mod_rewrite.c>
  RewriteEngine On
  # servir tel quel si fichier/dossier existe
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  # fallback SPA
  RewriteRule . /index.html [L]
</IfModule>
CONF

# 3) Copier le build Angular
#    ANGULAR_DIST = "template"  (ou "template/browser" selon ton output)
ARG ANGULAR_DIST=template
COPY --from=build /app/dist/${ANGULAR_DIST}/ /usr/local/apache2/htdocs/

EXPOSE 80
