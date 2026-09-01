FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY index.md /usr/share/nginx/html/index.md
COPY privacidad.html /usr/share/nginx/html/privacidad.html
COPY terminos.html /usr/share/nginx/html/terminos.html
COPY bot.html /usr/share/nginx/html/bot.html
COPY gracias.html /usr/share/nginx/html/gracias.html
COPY robots.txt /usr/share/nginx/html/robots.txt
COPY sitemap.xml /usr/share/nginx/html/sitemap.xml
COPY assets /usr/share/nginx/html/assets
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
