# API-only reverse-proxy nginx for the split deployment (Vercel frontend + EC2
# backend). No build stage needed — there's no static site to compile, this
# container only proxies to `app` and terminates TLS.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
