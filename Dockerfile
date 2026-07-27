FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY privacidad.html /usr/share/nginx/html/privacidad.html
COPY assets /usr/share/nginx/html/assets
EXPOSE 80
