# Markdown Inventory and Destinations

This inventory documents current Markdown files, their purpose and audience, and recommended locations.

## Root

| Path | Purpose | Audience | Recommended Destination | Notes |
| --- | --- | --- | --- | --- |
| README.md | Project overview and quickstart guidance. | New contributors and stakeholders. | Keep in root. |  |
| LICENSE.md | Project licensing terms. | All users. | Keep in root. |  |
| PQA_IMPROVEMENT_LOG.md | Historical log of PQA improvements and progress. | Internal engineering history. | Move under docs/ (archive). | Outdated progress log. |
| MENU_GUI_IMPLEMENTATION_LOG.md | Work log for menu GUI implementation status. | Internal developers. | Move under docs/ (archive). | Outdated progress log. |
| OVERVIEW_PAGE_REVAMP.md | Notes on revamping overview page design. | Frontend developers/designers. | Move under docs/ (archive). | Progress log; likely outdated. |
| PQA_INTEGRATION_SUMMARY.md | Summary of PQA integration activities. | Internal engineering stakeholders. | Move under docs/. | Appears historical. |

## Deployment

| Path | Purpose | Audience | Recommended Destination | Notes |
| --- | --- | --- | --- | --- |
| deployment/nginx/README.md | Nginx deployment instructions/config context. | DevOps/operations. | Keep under docs/. |  |

## Tests and Utilities

| Path | Purpose | Audience | Recommended Destination | Notes |
| --- | --- | --- | --- | --- |
| tests/README.md | Guidance for running and structuring tests. | Developers. | Keep under docs/. |  |
| test-data/README.md | Explains structure of shared test data. | Developers/test authors. | Keep under docs/. |  |
| test-data/doc-exports/greenstack-docs-2025-11-17/README.md | Context for exported documentation data set. | Documentation maintainers. | Keep under docs/. |  |
| test-data/eds_parsing_and_rendering_concept/INDEX.md | Index for EDS parsing/rendering concept docs. | Developers/researchers. | Keep under docs/. |  |
| test-data/eds_parsing_and_rendering_concept/README.md | Overview of EDS parsing/rendering concept package. | Developers/researchers. | Keep under docs/. |  |
| test-data/eds_parsing_and_rendering_concept/PROJECT_SUMMARY.md | Summary of EDS parsing/rendering concept work. | Developers/researchers. | Keep under docs/. |  |
| test-data/eds_parsing_and_rendering_concept/QUICK_REFERENCE.md | Quick reference for EDS parsing/rendering concept assets. | Developers/researchers. | Keep under docs/. |  |

## Frontend

| Path | Purpose | Audience | Recommended Destination | Notes |
| --- | --- | --- | --- | --- |
| frontend/README.md | Frontend setup and development guidance. | Frontend developers. | Keep under docs/. | Consider converting into frontend/src/content/docs/ if user-facing. |

## Docs Root

| Path | Purpose | Audience | Recommended Destination | Notes |
| --- | --- | --- | --- | --- |
| docs/README.md | Overview of documentation organization. | Documentation maintainers. | Keep under docs/. |  |
| docs/PQA_SYSTEM_OVERVIEW.md | High-level PQA system description. | Engineers and stakeholders. | Keep under docs/. | Candidate to convert into frontend/src/content/docs/ for published docs. |
| docs/PQA_IMPROVEMENT_FINAL_REPORT.md | Final report on PQA improvements. | Internal leadership/stakeholders. | Keep under docs/. |  |
| docs/PQA_EDS_IODD_SEPARATION.md | Guidance on separating EDS and IODD in PQA. | PQA developers. | Keep under docs/. |  |
| docs/PQA_DEVELOPER_GUIDE.md | Developer guide for PQA systems. | PQA developers. | Convert into frontend/src/content/docs/ to expose to users. |  |
| docs/EDS_PARSER_IMPROVEMENT_PLAN.md | Plan for improving EDS parser. | Backend engineers. | Keep under docs/. |  |
| docs/pqa-improvement-plan.md | Plan for PQA improvements. | Engineering planners. | Keep under docs/. |  |
| docs/schema-fixes-2025-11-20.md | Notes on schema fixes from 2025-11-20. | Backend engineers. | Move under docs/ archive. | Timestamped progress log. |
| docs/events-errors-fix-2025-11-20.md | Event/error fixes recorded on 2025-11-20. | Backend engineers. | Move under docs/ archive. | Dated progress/test log. |

## Docs - In Progress

| Path | Purpose | Audience | Recommended Destination | Notes |
| --- | --- | --- | --- | --- |
| docs/in-progress/frontend_repair_status.md | Status notes for frontend repairs. | Frontend developers. | Move under docs/ archive. | Progress log; likely outdated. |
| docs/in-progress/session-log.md | Session log notes. | Internal contributors. | Move under docs/ archive. | Outdated progress log. |
| docs/in-progress/next-steps-for-11-20.md | Next steps planning for 2025-11-20 work. | Internal contributors. | Move under docs/ archive. | Timestamped progress log. |

## Docs - Audits

| Path | Purpose | Audience | Recommended Destination | Notes |
| --- | --- | --- | --- | --- |
| docs/audits/CODEBASE_AUDIT_MASTER_PLAN.md | Master plan for codebase audits. | Engineering leadership. | Keep under docs/. |  |
| docs/audits/CODE_QUALITY_ANALYSIS_DETAILED.md | Detailed code quality analysis. | Developers/QA. | Keep under docs/. |  |
| docs/audits/CODE_QUALITY_REPORT.md | Code quality summary report. | Stakeholders/QA. | Keep under docs/. |  |
| docs/audits/COMPREHENSIVE_ACTION_ITEMS.md | Consolidated action items from audits. | Engineering managers. | Keep under docs/. |  |
| docs/audits/DOCS_FIX_CHECKLIST.md | Checklist for documentation fixes. | Documentation maintainers. | Keep under docs/. |  |
| docs/audits/DOCS_REVIEW_EXECUTIVE_SUMMARY.md | Executive summary of docs review. | Leadership. | Keep under docs/. |  |
| docs/audits/PHASE_01_AUDIT_REPORT.md | Audit report phase 01. | Engineering leadership. | Keep under docs/. |  |
| docs/audits/PHASE_02_CLEANUP_GUIDE.md | Cleanup guidance from audit phase 02. | Developers. | Keep under docs/. |  |
| docs/audits/PHASE_02_DEAD_CODE_REMOVAL_SUMMARY.md | Summary of dead code removal work. | Developers. | Keep under docs/. |  |
| docs/audits/PHASE_02_FRONTEND_UNUSED_CODE_REPORT.md | Report on frontend unused code removal. | Frontend developers. | Keep under docs/. |  |
| docs/audits/PHASE_02_UNUSED_IMPORTS_REPORT.md | Report on unused import cleanup. | Developers. | Keep under docs/. |  |
| docs/audits/PHASE_03_DOCUMENTATION_AUDIT_REPORT.md | Documentation audit report (phase 03). | Documentation maintainers. | Keep under docs/. |  |
| docs/audits/PHASE_03_IN_PLATFORM_DOCS_REVIEW.md | In-platform docs review results. | Documentation maintainers. | Convert into frontend/src/content/docs/ if meant for end users. |  |
| docs/audits/PHASE_04_SECURITY_AUDIT_REPORT.md | Security audit report. | Security/engineering leadership. | Keep under docs/. |  |
| docs/audits/PHASE_05_BUG_DETECTION_REPORT.md | Bug detection audit report. | QA and developers. | Keep under docs/. |  |
| docs/audits/PHASE_06_DATABASE_REVIEW_REPORT.md | Database review audit report. | Backend/database engineers. | Keep under docs/. |  |
| docs/audits/PHASE_07_PERFORMANCE_REPORT.md | Performance audit report. | Performance engineers. | Keep under docs/. |  |
| docs/audits/PHASE_08_TEST_COVERAGE_REPORT.md | Test coverage audit report. | QA leadership. | Keep under docs/. |  |
| docs/audits/PHASE_09_TYPE_SAFETY_REPORT.md | Type safety audit report. | Developers/QA. | Keep under docs/. |  |
| docs/audits/PHASE_10_LOGGING_MONITORING_REPORT.md | Logging and monitoring audit report. | DevOps and backend engineers. | Keep under docs/. |  |
| docs/audits/PHASE_11_CONFIGURATION_REVIEW_REPORT.md | Configuration review audit report. | DevOps/infra teams. | Keep under docs/. |  |
| docs/audits/PHASE_12_DEPENDENCY_MANAGEMENT_REPORT.md | Dependency management audit report. | Developers/DevOps. | Keep under docs/. |  |
| docs/audits/PHASE_13_CI_CD_PIPELINE_REPORT.md | CI/CD pipeline audit report. | DevOps/QA. | Keep under docs/. |  |
| docs/audits/PHASE_14_CODE_REFACTORING_REPORT.md | Code refactoring audit report. | Developers. | Keep under docs/. |  |
| docs/audits/PHASE_15_FRONTEND_ACCESSIBILITY_REPORT.md | Frontend accessibility audit report. | Frontend and accessibility teams. | Keep under docs/. |  |
| docs/audits/PHASE_16_IOT_INTEGRATION_TESTING_REPORT.md | IoT integration testing report. | IoT engineers/testers. | Keep under docs/. |  |
| docs/audits/PHASE_17_PRODUCTION_READINESS_REPORT.md | Production readiness audit report. | SRE/engineering leadership. | Keep under docs/. |  |
| docs/audits/PHASE_18_FINAL_REVIEW_REPORT.md | Final review audit report. | Leadership. | Keep under docs/. |  |

## Docs - Reports and Plans

| Path | Purpose | Audience | Recommended Destination | Notes |
| --- | --- | --- | --- | --- |
| docs/reports/CHANGELOG.md | Changelog summarizing updates. | Broad stakeholders. | Keep under docs/. | Candidate to convert into frontend/src/content/docs/ for public release. |
| docs/reports/WEEK_8_FINAL_SUMMARY.md | Week 8 summary report. | Project stakeholders. | Move under docs/ archive. | Time-bounded progress summary. |
| docs/reports/refactoring/PLAN.md | Refactoring plan document. | Developers. | Keep under docs/. |  |
| docs/reports/refactoring/SUMMARY.md | Summary of refactoring outcomes. | Developers/leadership. | Keep under docs/. |  |
| docs/reports/extraction/SUMMARY.md | Summary of extraction work. | Developers/stakeholders. | Keep under docs/. |  |
| docs/reports/extraction/STATUS_REPORT.md | Status report on extraction. | Project managers/stakeholders. | Move under docs/ archive if stale. | Time-bounded progress log. |
| docs/reports/extraction/COMPLETION_GUIDE.md | Guide to completing extraction tasks. | Developers. | Keep under docs/. |  |
| docs/reports/extraction/FINAL_SUMMARY.md | Final summary of extraction activities. | Stakeholders. | Keep under docs/. |  |
| docs/reports/analysis/CAPTRON_IODD_COMPREHENSIVE_ANALYSIS.md | Comprehensive analysis of CAPTRON IODD. | Engineers/data analysts. | Keep under docs/. |  |
| docs/reports/PQA_IMPLEMENTATION_COMPLETE.md | Report marking PQA implementation completion. | Stakeholders. | Move under docs/ archive if finalized. | Historical milestone report. |
| docs/EDS_PARSER_IMPROVEMENT_PLAN.md | Plan to improve EDS parser. | Backend engineers. | Keep under docs/. |  |
| docs/pqa-device56-investigation.md | Investigation notes for PQA device 56. | PQA developers. | Move under docs/ archive. | Targeted investigation log. |

## Docs - Archive

| Path | Purpose | Audience | Recommended Destination | Notes |
| --- | --- | --- | --- | --- |
| docs/archive/README.md | Overview of archived docs. | Documentation maintainers. | Keep under docs/. |  |
| docs/archive/CHANGELOG_v1.md | Historical changelog version 1. | Maintainers. | Keep under docs/. | Archived. |
| docs/archive/THEMING_OVERHAUL_PLAN.md | Plan for theming overhaul (legacy). | Frontend/theme developers. | Keep under docs/. | Archived. |
| docs/archive/DOCUMENTATION_OVERHAUL_PLAN.md | Plan for documentation overhaul (legacy). | Documentation team. | Keep under docs/. | Archived. |
| docs/archive/DISASTER_RECOVERY_LEGACY.md | Legacy disaster recovery notes. | Operations. | Keep under docs/. | Archived. |
| docs/archive/ARCHITECTURE_v1.md | Legacy architecture description. | Engineers. | Keep under docs/. | Archived. |
| docs/archive/COLOR_MIGRATION_SUMMARY.md | Summary of color migration. | Frontend/designers. | Keep under docs/. | Archived. |
| docs/archive/AUDIT_BUG_REPORT.md | Historical audit bug report. | QA/engineers. | Keep under docs/. | Archived. |
| docs/archive/color-audit-report.md | Color audit report. | Designers/frontend developers. | Keep under docs/. | Archived. |
| docs/archive/THEME_SYSTEM.md | Legacy theme system documentation. | Frontend developers. | Keep under docs/. | Archived. |
| docs/archive/THEME_QUICKSTART.md | Quickstart for legacy theme system. | Frontend developers. | Keep under docs/. | Archived. |
| docs/archive/QUICK_START_P1_ENHANCEMENTS.md | Quick start enhancements for phase 1. | Developers. | Keep under docs/. | Archived. |
| docs/archive/CLEANUP_SUMMARY.md | Summary of cleanup efforts. | Maintainers. | Keep under docs/. | Archived. |
| docs/archive/CODEBASE_AUDIT_CHECKLIST.md | Checklist for codebase audit. | QA/engineers. | Keep under docs/. | Archived. |
| docs/archive/DOCS_SYSTEM_SPRINT1_SUMMARY.md | Summary of documentation system sprint 1. | Documentation team. | Keep under docs/. | Archived. |
| docs/archive/IOT_PLATFORM_DEPLOYMENT.md | Legacy IoT platform deployment notes. | Operations/IoT engineers. | Keep under docs/. | Archived. |

## Docs - References

| Path | Purpose | Audience | Recommended Destination | Notes |
| --- | --- | --- | --- | --- |
| docs/references/ARCHITECTURE.md | Current architecture overview. | Engineers. | Convert into frontend/src/content/docs/ for user-facing docs. |  |
| docs/references/PQA_ARCHITECTURE.md | PQA-specific architecture reference. | PQA engineers. | Keep under docs/. |  |
| docs/references/DATABASE_SCHEMA.md | Database schema reference. | Backend engineers/DBAs. | Keep under docs/. |  |
| docs/references/COMPONENTS_INVENTORY.md | Inventory of system components. | Engineers. | Keep under docs/. |  |
| docs/references/api/API_REFERENCE.md | API reference. | Developers/integrators. | Convert into frontend/src/content/docs/ for published API docs. |  |
| docs/references/api/API_DOCUMENTATION.md | Additional API documentation. | Developers/integrators. | Convert into frontend/src/content/docs/ for published API docs. |  |

## Docs - Guides

| Path | Purpose | Audience | Recommended Destination | Notes |
| --- | --- | --- | --- | --- |
| docs/guides/CONTRIBUTING.md | Contribution guidelines. | Contributors. | Keep under docs/. | Consider mirroring in frontend/src/content/docs/ if public. |
| docs/guides/DEVELOPER_GUIDE.md | General developer guide. | Developers. | Convert into frontend/src/content/docs/ for user-facing docs. |  |
| docs/guides/ACCESSIBILITY.md | Accessibility guidance. | Frontend developers/accessibility specialists. | Convert into frontend/src/content/docs/. |  |
| docs/guides/TROUBLESHOOTING.md | Troubleshooting guide. | Operators/developers. | Convert into frontend/src/content/docs/. |  |
| docs/guides/operations/DEPLOYMENT_RUNBOOK.md | Deployment runbook. | DevOps/operations. | Keep under docs/. |  |
| docs/guides/operations/DISASTER_RECOVERY.md | Disaster recovery guide. | Operations/SRE. | Keep under docs/. |  |
| docs/guides/operations/MONITORING_SETUP_GUIDE.md | Monitoring setup guide. | Operations/SRE. | Keep under docs/. |  |
| docs/guides/operations/SCALING_GUIDE.md | Scaling guide. | Operations/SRE. | Keep under docs/. |  |


## Migrations

| Path | Purpose | Audience | Recommended Destination | Notes |
| --- | --- | --- | --- | --- |
| alembic/README.md | Guidance for Alembic migration environment. | Backend developers/DBAs. | Keep under docs/. |  |
