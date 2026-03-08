# price-poller

to run postgres locally use this command

```bash
docker run -d \
  -p 5433:5432 \
  -e POSTGRES_PASSWORD=XYZ@123 \
  -e POSTGRES_USER=user \
  -e POSTGRES_DB=trades_db \
  --name trades-postgres \
  postgres
```
