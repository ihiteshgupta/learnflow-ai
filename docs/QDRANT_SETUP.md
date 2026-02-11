# Qdrant Vector Database Setup Guide

Qdrant is used for vector storage and semantic search in Dronacharya's AI features, including:
- Quiz generation with RAG (Retrieval-Augmented Generation)
- Semantic content search
- Lesson recommendation engine

## Quick Start

### Option 1: Qdrant Cloud (Recommended for Production)

**Pros:**
- Fully managed, no infrastructure overhead
- Automatic scaling and backups
- Free tier available (1GB storage)
- Global CDN for low latency
- Built-in monitoring

**Setup Steps:**

1. **Sign Up**
   ```
   https://cloud.qdrant.io/
   ```

2. **Create Cluster**
   - Choose region closest to your users (e.g., us-east-1)
   - Select free tier or paid plan based on data size
   - Note the cluster URL (e.g., `https://xxx-yyy.qdrant.io:6333`)

3. **Generate API Key**
   - Go to cluster settings
   - Create a new API key
   - Copy and store securely

4. **Configure Environment**

   **Local Development:**
   ```bash
   # .env.local
   QDRANT_URL=https://xxx-yyy.qdrant.io:6333
   QDRANT_API_KEY=your-api-key-here
   ```

   **Kubernetes Production:**
   ```bash
   # Create secret
   kubectl create secret generic dronacharya-secrets \
     --from-literal=qdrant-url='https://xxx-yyy.qdrant.io:6333' \
     --from-literal=qdrant-api-key='your-api-key' \
     --namespace=dronacharya --dry-run=client -o yaml | kubectl apply -f -

   # Or use AWS Secrets Manager (recommended)
   # Add to AWS Secrets Manager:
   # - dronacharya/production/qdrant with properties:
   #   - url: https://xxx-yyy.qdrant.io:6333
   #   - api-key: your-api-key
   ```

---

### Option 2: Self-Hosted Qdrant

**Pros:**
- Full control over data
- No external dependencies
- Cost-effective for high volume

**Cons:**
- Requires infrastructure management
- Manual scaling and backups
- More operational overhead

#### Local Development (Docker)

Already configured in `docker-compose.yml`:

```yaml
qdrant:
  image: qdrant/qdrant:latest
  ports:
    - "6333:6333"
  volumes:
    - qdrant_data:/qdrant/storage
```

Start with:
```bash
docker-compose up -d qdrant
```

Access at: `http://localhost:6333`
Dashboard: `http://localhost:6333/dashboard`

#### Kubernetes Deployment

**Create Deployment:**

```yaml
# k8s/base/qdrant-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: qdrant
  namespace: dronacharya
spec:
  replicas: 1
  selector:
    matchLabels:
      app: qdrant
  template:
    metadata:
      labels:
        app: qdrant
    spec:
      containers:
        - name: qdrant
          image: qdrant/qdrant:v1.9.0
          ports:
            - containerPort: 6333
              name: http
            - containerPort: 6334
              name: grpc
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "2Gi"
              cpu: "1000m"
          volumeMounts:
            - name: qdrant-storage
              mountPath: /qdrant/storage
      volumes:
        - name: qdrant-storage
          persistentVolumeClaim:
            claimName: qdrant-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: qdrant
  namespace: dronacharya
spec:
  selector:
    app: qdrant
  ports:
    - name: http
      port: 6333
      targetPort: 6333
    - name: grpc
      port: 6334
      targetPort: 6334
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: qdrant-pvc
  namespace: dronacharya
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard
```

**Deploy:**
```bash
kubectl apply -f k8s/base/qdrant-deployment.yaml
```

**Update app configuration:**
```bash
# Set QDRANT_URL to internal service
kubectl create secret generic dronacharya-secrets \
  --from-literal=qdrant-url='http://qdrant:6333' \
  --namespace=dronacharya --dry-run=client -o yaml | kubectl apply -f -
```

---

## Verification

### Test Connection

**Using curl:**
```bash
# Local or self-hosted
curl http://localhost:6333/health

# Qdrant Cloud
curl -H "api-key: YOUR_API_KEY" https://xxx-yyy.qdrant.io:6333/health
```

Expected response:
```json
{
  "title": "qdrant - vector search engine",
  "version": "1.9.0"
}
```

**Using the app:**
```bash
# Check health endpoint
curl https://www.dronacharya.app/api/health

# Should show:
{
  "checks": {
    "app": "ok",
    "redis": "ok",
    "database": "ok"
  }
}
```

### Initialize Collections

Collections are created automatically by the application on first use. To manually verify:

```bash
# List collections
curl http://localhost:6333/collections

# Or with Qdrant Cloud
curl -H "api-key: YOUR_API_KEY" https://xxx-yyy.qdrant.io:6333/collections
```

---

## Data Migration

### Export from Local to Cloud

```bash
# 1. Export snapshot from local Qdrant
curl -X POST http://localhost:6333/collections/lesson_content/snapshots

# 2. Download snapshot
curl -O http://localhost:6333/collections/lesson_content/snapshots/snapshot-2024-01-01.snapshot

# 3. Upload to Qdrant Cloud
curl -X POST \
  -H "api-key: YOUR_API_KEY" \
  -F "snapshot=@snapshot-2024-01-01.snapshot" \
  https://xxx-yyy.qdrant.io:6333/collections/lesson_content/snapshots/upload
```

---

## Monitoring

### Qdrant Cloud Dashboard

- Access at: https://cloud.qdrant.io/dashboard
- Metrics: Request rate, latency, storage usage
- Logs: Query logs, error logs

### Self-Hosted Metrics

Qdrant exposes Prometheus metrics at `/metrics`:

```bash
# Add to Prometheus scrape config
scrape_configs:
  - job_name: 'qdrant'
    static_configs:
      - targets: ['qdrant:6333']
```

**Key Metrics:**
- `qdrant_app_requests_total` - Total requests
- `qdrant_app_request_duration_seconds` - Request latency
- `qdrant_collections_vector_count` - Number of vectors stored

---

## Cost Estimation

### Qdrant Cloud Pricing

| Tier | Storage | Requests/month | Cost |
|------|---------|----------------|------|
| Free | 1GB | Unlimited | $0 |
| Standard | 10GB | Unlimited | $25/month |
| Pro | 100GB | Unlimited | $200/month |

### Self-Hosted (K8s)

| Resource | Cost (AWS EKS) |
|----------|----------------|
| 1 pod (512Mi/250m CPU) | ~$15/month |
| 10GB PVC | ~$1/month |
| **Total** | **~$16/month** |

---

## Troubleshooting

### Connection Timeout

**Problem:** Application can't reach Qdrant
**Solution:**
```bash
# Check if Qdrant is running
kubectl get pods -n dronacharya | grep qdrant

# Check service
kubectl get svc -n dronacharya | grep qdrant

# Test from within cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://qdrant:6333/health
```

### Out of Memory

**Problem:** Qdrant pod OOMKilled
**Solution:** Increase memory limits in deployment:
```yaml
resources:
  limits:
    memory: "4Gi"  # Increase as needed
```

### Slow Queries

**Problem:** Vector search takes too long
**Solutions:**
1. Create HNSW index with appropriate parameters
2. Use filters to narrow search space
3. Increase CPU allocation
4. Scale horizontally (Qdrant Cloud handles this automatically)

---

## Security Best Practices

1. **API Key Protection**
   - Never commit API keys to version control
   - Use K8s secrets or AWS Secrets Manager
   - Rotate keys periodically

2. **Network Security**
   - Use TLS for Qdrant Cloud connections (automatic)
   - For self-hosted: Restrict access via NetworkPolicy
   - Don't expose Qdrant publicly

3. **Access Control**
   - Qdrant Cloud: Use read-only API keys for production
   - Self-hosted: Enable authentication if exposed

---

## References

- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Qdrant Cloud](https://cloud.qdrant.io/)
- [Qdrant GitHub](https://github.com/qdrant/qdrant)
- [Kubernetes Setup Guide](https://qdrant.tech/documentation/guides/installation/#kubernetes)
