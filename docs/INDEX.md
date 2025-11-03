# AutolytiQ Documentation Index

**Complete documentation map for the AutolytiQ platform**

---

## 🚀 Start Here

New to the project? Read these in order:

1. **[README.md](../README.md)** - Project overview & quick start
2. **[SESSION_STATE.md](../SESSION_STATE.md)** - Current project state & where we left off
3. **[CLAUDE.md](architecture/CLAUDE.md)** - Claude Code guidance for this repository
4. **[AGENTS.md](architecture/AGENTS.md)** - Engineering standards (MANDATORY)

---

## 📁 Documentation Categories

### 🏗️ Architecture
Understanding the system design and structure.

- **[AGENTS.md](architecture/AGENTS.md)** ⭐ MANDATORY - Engineering standards, workflow, coding conventions
- **[CLAUDE.md](architecture/CLAUDE.md)** ⭐ - Repository guidance for Claude Code
- **[MULTITENANCY_AI_ARCHITECTURE.md](architecture/MULTITENANCY_AI_ARCHITECTURE.md)** - Multi-tenant design with AI integration
- **[CRM-TIMELINE-ARCHITECTURE.md](architecture/CRM-TIMELINE-ARCHITECTURE.md)** - CRM timeline implementation details

**External Architecture Docs:**
- `services/rust/README.md` - Rust microservices overview
- `services/rust/ARCHITECTURE.md` - Detailed Rust design patterns

---

### 🚢 Deployment
Guides for deploying and configuring the platform.

- **[DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md)** ⭐ - Complete deployment guide
- **[DEPLOYMENT.md](deployment/DEPLOYMENT.md)** - Quick deployment reference
- **[DEPLOYMENT_READINESS.md](deployment/DEPLOYMENT_READINESS.md)** - Pre-deployment checklist
- **[DEPLOYMENT_SOLUTION.md](deployment/DEPLOYMENT_SOLUTION.md)** - Deployment architecture decisions
- **[DEPLOYMENT-COMPLETE-SUMMARY.md](deployment/DEPLOYMENT-COMPLETE-SUMMARY.md)** - Deployment completion report
- **[DEPLOYMENT-VERIFICATION-CHECKLIST.md](deployment/DEPLOYMENT-VERIFICATION-CHECKLIST.md)** - Post-deployment verification
- **[DNS-CONFIGURATION.md](deployment/DNS-CONFIGURATION.md)** - DNS setup guide

**Related:**
- `scripts/README.md` - Deployment scripts documentation
- `infrastructure/k8s/` - Kubernetes manifests

---

### ✨ Features
Documentation for specific features and capabilities.

#### CRM & Lead Management
- **[CRM-CAPABILITIES-ANALYSIS.md](features/CRM-CAPABILITIES-ANALYSIS.md)** - Complete CRM feature analysis
- **[CRM-ADAPTIVE-LEAD-SCORING.md](features/CRM-ADAPTIVE-LEAD-SCORING.md)** - ML-powered lead scoring
- **[REVOLUTIONARY-CRM-IMPLEMENTATION-PLAN.md](features/REVOLUTIONARY-CRM-IMPLEMENTATION-PLAN.md)** - Advanced CRM features roadmap
- **[ENTERPRISE_CRM_EXTENSION.md](features/ENTERPRISE_CRM_EXTENSION.md)** - Enterprise CRM extensions

#### ML & Data Science
- **[ML-DESKING-VERIFICATION-RESULTS.md](features/ML-DESKING-VERIFICATION-RESULTS.md)** - ML model verification results

#### Design System & UI
- **[DESIGN_SYSTEM_IMPLEMENTATION.md](features/DESIGN_SYSTEM_IMPLEMENTATION.md)** - Design system overview
- **[UI-DESIGN-SYSTEM-COMPLETE.md](features/UI-DESIGN-SYSTEM-COMPLETE.md)** - Complete UI design system
- **[FRONTEND-COMPONENTS-PLAN.md](features/FRONTEND-COMPONENTS-PLAN.md)** - Frontend component architecture

#### Security & Permissions
- **[CUSTOM-PERMISSIONS-IMPLEMENTATION.md](features/CUSTOM-PERMISSIONS-IMPLEMENTATION.md)** - Custom permissions system

---

### 🔧 Fixes & Issues
Bug fixes, issue resolutions, and improvement summaries.

- **[FIXES_APPLIED.md](fixes/FIXES_APPLIED.md)** ⭐ LATEST - Bcrypt & K8s memory fixes (2025-11-03)
- **[AUTOLYTIQ_401_ERROR_ANALYSIS.md](fixes/AUTOLYTIQ_401_ERROR_ANALYSIS.md)** - 401 authentication error analysis
- **[CODE-IMPROVEMENTS-SUMMARY.md](fixes/CODE-IMPROVEMENTS-SUMMARY.md)** - Code improvement summary

---

### 📖 Guides
Step-by-step guides and tutorials.

- **[TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md)** - Common issues and solutions
- **[SCHEMA_MIGRATION_GUIDE.md](guides/SCHEMA_MIGRATION_GUIDE.md)** - Database schema migration guide
- **[provider_setup_walkthrough.md](guides/provider_setup_walkthrough.md)** - Cloud provider setup walkthrough

---

### ⚙️ Operations
Operational procedures, security, and maintenance.

- **[ops.md](operations/ops.md)** - Operational procedures
- **[secrets.md](operations/secrets.md)** - Secrets management guide
- **[SECURITY-SUMMARY.md](operations/SECURITY-SUMMARY.md)** - Security implementation summary
- **[sprint5-6-audit.md](operations/sprint5-6-audit.md)** - Sprint audit report

---

## 🔍 Quick Reference

### Common Tasks

| Task | Documentation |
|------|---------------|
| Setting up development environment | [README.md](../README.md), [CLAUDE.md](architecture/CLAUDE.md) |
| Understanding codebase structure | [CLAUDE.md](architecture/CLAUDE.md), [AGENTS.md](architecture/AGENTS.md) |
| Deploying to production | [DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md) |
| Troubleshooting issues | [TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md), [SESSION_STATE.md](../SESSION_STATE.md) |
| Database migrations | [SCHEMA_MIGRATION_GUIDE.md](guides/SCHEMA_MIGRATION_GUIDE.md) |
| Understanding Rust services | `services/rust/README.md` |
| Security best practices | [SECURITY-SUMMARY.md](operations/SECURITY-SUMMARY.md), [AGENTS.md](architecture/AGENTS.md) |
| Latest fixes | [FIXES_APPLIED.md](fixes/FIXES_APPLIED.md) |

---

## 📊 Documentation by Role

### For Developers
1. [CLAUDE.md](architecture/CLAUDE.md) - Development workflow
2. [AGENTS.md](architecture/AGENTS.md) - Coding standards
3. [TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md) - Common issues
4. [SESSION_STATE.md](../SESSION_STATE.md) - Current state

### For DevOps
1. [DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md)
2. [ops.md](operations/ops.md)
3. [secrets.md](operations/secrets.md)
4. [DNS-CONFIGURATION.md](deployment/DNS-CONFIGURATION.md)

### For Product/Features
1. [CRM-CAPABILITIES-ANALYSIS.md](features/CRM-CAPABILITIES-ANALYSIS.md)
2. [REVOLUTIONARY-CRM-IMPLEMENTATION-PLAN.md](features/REVOLUTIONARY-CRM-IMPLEMENTATION-PLAN.md)
3. [DESIGN_SYSTEM_IMPLEMENTATION.md](features/DESIGN_SYSTEM_IMPLEMENTATION.md)

### For Security
1. [SECURITY-SUMMARY.md](operations/SECURITY-SUMMARY.md)
2. [CUSTOM-PERMISSIONS-IMPLEMENTATION.md](features/CUSTOM-PERMISSIONS-IMPLEMENTATION.md)
3. [AGENTS.md](architecture/AGENTS.md) §Security

---

## 🔄 Keeping Up to Date

### Session Management
- **[SESSION_STATE.md](../SESSION_STATE.md)** is updated at the start/end of each work session
- Always check this file to see what was last worked on
- Update it when you complete major tasks or find new issues

### Recent Changes
Check these files for latest updates:
1. [SESSION_STATE.md](../SESSION_STATE.md) - Current state
2. [FIXES_APPLIED.md](fixes/FIXES_APPLIED.md) - Latest bug fixes
3. `git log` - Recent commits

---

## 📝 Documentation Standards

When creating or updating documentation:

- ✅ Use clear, descriptive headings
- ✅ Include code examples where relevant
- ✅ Add cross-references to related docs
- ✅ Update INDEX.md when adding new docs
- ✅ Update SESSION_STATE.md with major changes
- ✅ Use emoji sparingly for visual scanning
- ✅ Keep technical accuracy over marketing language

---

## 🆘 Need Help?

1. Check [TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md)
2. Review [SESSION_STATE.md](../SESSION_STATE.md) for known issues
3. Search this INDEX.md for relevant topics
4. Check `git log` for recent changes
5. Read [AGENTS.md](architecture/AGENTS.md) for standards

---

**Last Updated:** 2025-11-03
**Total Documents:** 30+ organized files
**Status:** ✅ Fully organized and indexed
