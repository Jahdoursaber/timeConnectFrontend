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

# Normalise le chemin de sortie (SPA: dist/template | SSR: dist/template/browser)
RUN set -eux; \
    if [ -d "dist/${ANGULAR_DIST}/browser" ]; then \
      mv "dist/${ANGULAR_DIST}/browser" /dist_out; \
    else \
      mv "dist/${ANGULAR_DIST}" /dist_out; \
    fi; \
    test -f /dist_out/index.html || { echo "ERREUR: index.html manquant dans /dist_out"; ls -laR /dist_out || true; exit 1; }

######## PROD (Apache) ########
FROM httpd:2.4-alpine AS prod

# Active mod_rewrite + inclut notre conf
RUN sed -i 's/^#LoadModule rewrite_module/LoadModule rewrite_module/' /usr/local/apache2/conf/httpd.conf \
 && printf '\nServerName localhost\nInclude conf/extra/spa.conf\n' >> /usr/local/apache2/conf/httpd.conf

# Conf SPA sûre (pas de Listen ici)
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
  # ne pas réécrire les assets (sinon 404, pas index.html)
  RewriteCond %{REQUEST_URI} \.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff2?|woff|ttf|eot|map)$ [NC]
  RewriteRule ^ - [L]
  # fallback SPA
  RewriteRule . /index.html [L]
</IfModule>
CONF

# Nettoie le docroot pour supprimer "It works!"
RUN rm -rf /usr/local/apache2/htdocs/*

# Copie l’output Angular normalisé
COPY --from=build /dist_out/ /usr/local/apache2/htdocs/

EXPOSE 80
