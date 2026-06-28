# FLEX production deploy

## flexpro02.ru

The application container listens on host port `18778` and nginx must proxy
`flexpro02.ru` to `http://127.0.0.1:18778`.

Current required environment:

```bash
SITE_URL=https://flexpro02.ru
CANONICAL_REDIRECTS=1
SITE_MONITOR_ENABLED=1
SITE_MONITOR_URLS=https://flexpro02.ru/,https://flexpro02.ru/healthz
```

Install temporary HTTP-only nginx config before issuing a certificate:

```bash
sudo mkdir -p /var/www/certbot
sudo cp deploy/nginx/flexpro02.ru.http-only.conf /etc/nginx/sites-available/flexpro02.ru.conf
sudo ln -sf /etc/nginx/sites-available/flexpro02.ru.conf /etc/nginx/sites-enabled/flexpro02.ru.conf
sudo nginx -t
sudo systemctl reload nginx
```

Issue the certificate after DNS points to the server:

```bash
sudo certbot certonly --webroot -w /var/www/certbot -d flexpro02.ru -d www.flexpro02.ru
sudo cp deploy/nginx/flexpro02.ru.conf /etc/nginx/sites-available/flexpro02.ru.conf
sudo nginx -t
sudo systemctl reload nginx
```

Verify:

```bash
curl -I http://flexpro02.ru/
curl -I https://flexpro02.ru/
curl -I https://flexpro02.ru/healthz
docker compose ps
docker compose logs --tail=100 web
```
