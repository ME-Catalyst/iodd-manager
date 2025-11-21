# PQA (Parser Quality Assurance) System Overview

## Introduction

The PQA system is a comprehensive framework for validating the accuracy of IODD (IO-Link Device Description) and EDS (Electronic Data Sheet) file parsing. It provides "forensic-grade" data fidelity verification by comparing original uploaded files against reconstructed files built from parsed database data.

## Architecture Overview

```mermaid
flowchart TB
    subgraph Input["File Upload"]
        IODD[IODD XML File]
        EDS[EDS INI File]
    end

    subgraph Parsing["Parsing Layer"]
        IP[IODDParser]
        EP[EDSParser]
    end

    subgraph Storage["Database Storage"]
        direction TB
        DT[(Device Tables)]
        PT[(Parameter Tables)]
        PDT[(Process Data Tables)]
        TT[(Text Tables)]
        MT[(Menu Tables)]
        CT[(Custom Datatype Tables)]
    end

    subgraph Archive["PQA Archive"]
        PFA[(pqa_file_archive)]
    end

    subgraph Reconstruction["Reconstruction Layer"]
        IR[IODDReconstructor]
        ER[EDSReconstructor]
    end

    subgraph Analysis["Diff Analysis"]
        IDA[IODD DiffAnalyzer]
        EDA[EDS DiffAnalyzer]
    end

    subgraph Scoring["Quality Scoring"]
        QM[QualityMetrics]
        EQM[EDSQualityMetrics]
    end

    subgraph Output["Results"]
        PQM[(pqa_quality_metrics)]
        PDD[(pqa_diff_details)]
        TK[(tickets)]
    end

    IODD --> IP
    EDS --> EP

    IP --> DT & PT & PDT & TT & MT & CT
    EP --> DT & PT

    IODD --> PFA
    EDS --> PFA

    DT & PT & PDT & TT & MT & CT --> IR
    DT & PT --> ER

    PFA --> IDA & EDA
    IR --> IDA
    ER --> EDA

    IDA --> QM
    EDA --> EQM

    QM --> PQM & PDD
    EQM --> PQM & PDD

    PQM -->|"score < threshold"| TK
```

## Core Workflow

```mermaid
sequenceDiagram
    participant U as User/System
    participant O as PQAOrchestrator
    participant A as Archive
    participant R as Reconstructor
    participant D as DiffAnalyzer
    participant DB as Database

    U->>O: analyze_device(device_id)

    rect rgb(230, 245, 255)
        Note over O,A: Phase 1: Archive
        O->>A: archive_file(original_content)
        A->>DB: INSERT pqa_file_archive
    end

    rect rgb(255, 245, 230)
        Note over O,R: Phase 2: Reconstruct
        O->>R: reconstruct_iodd(device_id)
        R->>DB: SELECT from 23+ tables
        R-->>O: reconstructed_xml
    end

    rect rgb(230, 255, 230)
        Note over O,D: Phase 3: Compare
        O->>D: compare(original, reconstructed)
        D-->>O: diff_items[]
    end

    rect rgb(255, 230, 245)
        Note over O,DB: Phase 4: Score & Save
        O->>O: calculate_metrics(diff_items)
        O->>DB: INSERT pqa_quality_metrics
        O->>DB: INSERT pqa_diff_details
    end

    rect rgb(245, 230, 255)
        Note over O,DB: Phase 5: Ticket (if needed)
        alt score < threshold
            O->>DB: INSERT ticket
        end
    end

    O-->>U: QualityMetrics
```

## Scoring Methodology

### Weight Distribution

```mermaid
pie title PQA Score Weights
    "Structural (40%)" : 40
    "Attribute (35%)" : 35
    "Value (25%)" : 25
```

### Score Calculations

| Score Type | Formula | Description |
|------------|---------|-------------|
| **Structural** | `100 * (1 - (missing + extra) / total_elements)` | Measures element tree accuracy |
| **Attribute** | `100 * (1 - (missing + incorrect) / total_attrs)` | Measures attribute accuracy |
| **Value** | `100 * (1 - value_changes / total_elements)` | Measures text content accuracy |
| **Overall** | `0.40*structural + 0.35*attribute + 0.25*value` | Weighted composite score |

### Severity Levels

```mermaid
graph LR
    subgraph Severity["Issue Severity Scale"]
        C[CRITICAL]:::critical --> H[HIGH]:::high --> M[MEDIUM]:::medium --> L[LOW]:::low --> I[INFO]:::info
    end

    classDef critical fill:#ff4444,color:white
    classDef high fill:#ff8800,color:white
    classDef medium fill:#ffcc00,color:black
    classDef low fill:#44aa44,color:white
    classDef info fill:#4488ff,color:white
```

| Severity | Impact | Examples |
|----------|--------|----------|
| CRITICAL | Data loss - required elements missing | Missing DeviceIdentity, ProcessData |
| HIGH | Functional impact - incorrect values | Missing id/type attributes |
| MEDIUM | Non-critical differences | Text content mismatches |
| LOW | Minor differences | Extra elements, ordering issues |
| INFO | Informational only | Whitespace normalization |

## Key Components

### File Structure

```
src/
├── parsing/
│   └── __init__.py          # IODDParser - extracts data from XML
├── storage/
│   ├── parameter.py         # ParameterSaver - stores Variable data
│   ├── std_variable_ref.py  # StdVariableRefSaver - stores StdVariableRef
│   ├── menu.py              # MenuSaver - stores UI menus/buttons
│   └── ...                  # Other domain-specific savers
├── utils/
│   ├── pqa_orchestrator.py  # Main workflow coordinator
│   ├── pqa_diff_analyzer.py # IODD XML comparison
│   ├── pqa_scheduler.py     # Automated analysis scheduling
│   ├── forensic_reconstruction_v2.py  # IODD reconstruction
│   ├── eds_diff_analyzer.py # EDS INI comparison
│   └── eds_reconstruction.py # EDS reconstruction
├── routes/
│   └── pqa_routes.py        # REST API endpoints
└── models/
    └── __init__.py          # Data models (Parameter, RecordItem, etc.)
```

### Database Tables

```mermaid
erDiagram
    devices ||--o{ parameters : has
    devices ||--o{ process_data : has
    devices ||--o{ custom_datatypes : has
    devices ||--o{ std_variable_refs : has
    devices ||--o{ pqa_file_archive : archived_as
    devices ||--o{ pqa_quality_metrics : analyzed_as

    pqa_quality_metrics ||--o{ pqa_diff_details : contains
    pqa_quality_metrics ||--o| tickets : generates

    parameters ||--o{ parameter_record_items : has
    parameters ||--o{ parameter_single_values : has

    std_variable_refs ||--o{ std_variable_ref_single_values : has
    std_variable_refs ||--o{ std_record_item_refs : has

    pqa_file_archive {
        int id PK
        int device_id FK
        string file_type
        blob file_content
        string file_hash
        string parser_version
        datetime archived_at
    }

    pqa_quality_metrics {
        int id PK
        int device_id FK
        float overall_score
        float structural_score
        float attribute_score
        float value_score
        int original_element_count
        int reconstructed_element_count
        datetime analyzed_at
    }

    pqa_diff_details {
        int id PK
        int metric_id FK
        string diff_type
        string severity
        string xpath
        string expected_value
        string actual_value
        string phase
    }
```

## API Endpoints

### Analysis Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pqa/analyze` | POST | Analyze specific device |
| `/api/pqa/analyze-all` | POST | Batch analyze all devices |
| `/api/pqa/analyzed-devices` | GET | List analyzed devices |

### Metrics Retrieval

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pqa/metrics/{device_id}` | GET | Latest metrics for device |
| `/api/pqa/metrics/{device_id}/history` | GET | Historical metrics |
| `/api/pqa/diff/{metric_id}` | GET | Diff details for analysis |

### Reconstruction

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pqa/reconstruct/{device_id}` | GET | Get reconstructed file |
| `/api/pqa/archive/{device_id}` | GET | Get archived original |

### Dashboard

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pqa/dashboard/summary` | GET | System-wide statistics |
| `/api/pqa/dashboard/trends` | GET | Quality trends over time |
| `/api/pqa/dashboard/failures` | GET | Failed analyses list |

## Automation

The PQA system includes automated scheduling:

```mermaid
flowchart LR
    subgraph Triggers["Analysis Triggers"]
        S[Server Startup]
        D[Daily 2 AM]
        M[Manual API Call]
        I[File Import]
    end

    subgraph Scheduler["PQA Scheduler"]
        ST[Startup Thread]
        DT[Daily Thread]
    end

    subgraph Analysis["Analysis Queue"]
        Q[(Unanalyzed Devices)]
    end

    S --> ST --> Q
    D --> DT --> Q
    M --> Q
    I -->|"auto_analysis_on_import"| Q

    Q --> O[PQAOrchestrator]
```

## Quality Thresholds

Default thresholds (configurable via API):

| Threshold | Default | Description |
|-----------|---------|-------------|
| `min_overall_score` | 95.0% | Minimum acceptable overall score |
| `min_structural_score` | 98.0% | Minimum structural accuracy |
| `max_data_loss_percentage` | 1.0% | Maximum allowable data loss |
| `auto_ticket_on_fail` | true | Auto-generate tickets on failure |
| `auto_analysis_on_import` | true | Run PQA on file upload |

## Phase-Specific Analysis (IODD)

The system tracks scores for specific IODD phases:

| Phase | Focus Areas |
|-------|-------------|
| Phase 1 | UI Rendering metadata (gradient, offset, displayFormat) |
| Phase 2 | Device Variants and Process Data Conditions |
| Phase 3 | Menu Buttons and Role Menu Sets |
| Phase 4 | Wiring Configuration and Test Configuration |
| Phase 5 | Custom Datatypes (RecordT, ArrayT, SingleValue) |

## Next Steps

See the following documentation for more details:
- [Developer Troubleshooting Guide](./PQA_DEVELOPER_GUIDE.md) - Debugging and enhancement guide
- [API Reference](./references/PQA_ARCHITECTURE.md) - Detailed API documentation
