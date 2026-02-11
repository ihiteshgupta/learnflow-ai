# Dronacharya Beta Launch Checklist

## Pre-Launch

### Infrastructure ✅
- [x] Terraform configuration created
- [x] GitHub Actions CI/CD pipeline configured
- [x] Deployment documentation written
- [ ] Azure resources provisioned
- [ ] Database migrations applied
- [ ] Beta content seeded

### Application ✅
- [x] Rebrand from Dronacharya to Dronacharya complete
- [x] UI updated with Dronacharya branding
- [x] Onboarding flow implemented
- [x] Hardcoded user IDs removed
- [x] Authentication flow verified
- [x] Settings page functional

### AI Agents ✅
- [x] Tutor agent working
- [x] Assessor agent working
- [x] Mentor agent working
- [x] Code Review agent enhanced
- [x] Project Guide agent enhanced
- [x] Quiz Generator agent created

### Quality ✅
- [x] Unit tests passing
- [x] Test setup configured (Vitest + jsdom)
- [x] Linting passing
- [ ] E2E tests (Playwright) - optional for beta

### Content ✅
- [x] Seed script created
- [x] 3 learning domains (Python, Data Science, AI/ML)
- [x] 5 learning tracks
- [x] 8 courses
- [x] 9 achievements

## Launch Day

### Azure Setup
1. [ ] Login to Azure Portal
2. [ ] Run Terraform to create infrastructure
   ```bash
   cd terraform/azure
   terraform init
   terraform apply
   ```
3. [ ] Note the App Service URL from outputs
4. [ ] Configure environment variables in App Service

### Database Setup
1. [ ] Connect to PostgreSQL
2. [ ] Run migrations: `pnpm db:push`
3. [ ] Seed content: `pnpm db:seed`
4. [ ] Verify tables created

### GitHub Secrets
1. [ ] Add `AZURE_CREDENTIALS` (service principal JSON)
2. [ ] Add `NEXT_PUBLIC_APP_URL`

### Deploy
1. [ ] Merge `dronacharya-beta-launch` branch
2. [ ] Verify GitHub Actions workflow runs
3. [ ] Check deployment logs
4. [ ] Verify app is accessible

### Smoke Test
1. [ ] Homepage loads
2. [ ] Login/signup works
3. [ ] Onboarding flow completes
4. [ ] Dashboard displays correctly
5. [ ] Course catalog loads
6. [ ] AI tutor responds
7. [ ] XP and achievements display
8. [ ] Settings page works

## Post-Launch

### Monitoring
- [ ] Set up Application Insights
- [ ] Configure error alerts
- [ ] Set up uptime monitoring (UptimeRobot or similar)

### Domain Setup
- [ ] Configure dronacharya.app domain with Azure DNS
- [ ] Point NS records to Azure DNS zone
- [ ] Add custom domain to AKS ingress
- [ ] Configure SSL certificate (cert-manager / Let's Encrypt)
- [ ] Set up DNS records (www.dronacharya.app, api.dronacharya.app)

### Feedback Collection
- [ ] Add feedback mechanism (form or chat)
- [ ] Set up analytics (privacy-respecting)
- [ ] Create beta tester feedback channel

### Documentation
- [ ] Update README with live URLs
- [ ] Document known issues/limitations
- [ ] Create FAQ for beta testers

## Beta Limitations

Current beta has these intentional limitations:
- Single demo user for testing (no multi-user)
- Limited course content (3 domains, 8 courses)
- No payment integration
- Basic achievements only
- No certificate generation

## Rollback Plan

If issues occur:

1. **Immediate**: Scale down App Service
   ```bash
   az webapp stop --name dronacharya-beta-app --resource-group dronacharya-beta-rg
   ```

2. **Revert Deployment**: Revert to previous version in Azure Portal
   - Go to Deployment Center > Logs
   - Find previous successful deployment
   - Redeploy

3. **Database Rollback**: Restore from backup
   ```bash
   az postgres flexible-server backup list \
     --resource-group dronacharya-beta-rg \
     --name dronacharya-beta-postgres
   ```

## Success Metrics

After 1 week of beta:
- [ ] App uptime > 99%
- [ ] Response time < 2s for page loads
- [ ] AI responses < 5s
- [ ] No critical errors in logs
- [ ] At least 3 beta testers onboarded

## Contacts

- **Primary**: Hitesh Gupta
- **Project**: Margadeshaka - Dronacharya
- **Repository**: dronacharya (dronacharya-beta-launch branch)
