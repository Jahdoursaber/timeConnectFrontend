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

# Activer mod_rewrite + réglages sûrs
RUN sed -i 's/^#LoadModule rewrite_module/LoadModule rewrite_module/' /usr/local/apache2/conf/httpd.conf \
 && printf '\nServerName localhost\nAddType application/javascript .js\n' >> /usr/local/apache2/conf/httpd.conf \
 && awk 'BEGIN{print "<Directory \"/usr/local/apache2/htdocs\">"} \
          {print} END{print "  AllowOverride All\n  Require all granted\n  Options -Indexes -MultiViews +FollowSymLinks\n  DirectoryIndex index.html\n</Directory>"}' \
        /usr/local/apache2/conf/httpd.conf > /tmp/httpd.conf && mv /tmp/httpd.conf /usr/local/apache2/conf/httpd.conf

# Copier le build Angular (adapte ANGULAR_DIST si besoin)
ARG ANGULAR_DIST=template
COPY --from=build /app/dist/${ANGULAR_DIST}/ /usr/local/apache2/htdocs/

# Écrire le .htaccess *après* la copie du build
RUN cat > /usr/local/apache2/htdocs/.htaccess <<'HTACCESS'
<IfModule mod_rewrite.c>
  RewriteEngine On
  # 1) si fichier/dossier existe -> le servir
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  # 2) ne PAS réécrire les assets (s'ils manquent => 404, pas index.html)
  RewriteCond %{REQUEST_URI} \.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff2?|woff|ttf|eot|map)$ [NC]
  RewriteRule ^ - [L]
  # 3) fallback SPA
  RewriteRule . /index.html [L]
</IfModule>
HTACCESS

EXPOSE 80
