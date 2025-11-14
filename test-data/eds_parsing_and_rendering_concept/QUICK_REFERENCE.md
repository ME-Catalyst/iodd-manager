# EDS Parser - Quick Reference Card

## 🚀 Getting Started in 30 Seconds

```bash
# Parse an EDS file and create visualization
python generate_viz.py your_file.eds

# Open index.html in your browser
# Done! 🎉
```

## 📖 Common Use Cases

### Parse a File
```python
from eds_parser import parse_eds_file

model, diagnostics = parse_eds_file('device.eds')
```

### Access Device Info
```python
device = model.device_identity
print(f"{device.vendor_name} {device.product_name}")
print(f"Code: 0x{device.product_code:04X}")
print(f"Rev: {device.major_revision}.{device.minor_revision}")
```

### List Parameters
```python
for param in model.parameters:
    print(f"{param.name}: {param.default_value}")
```

### List Connections
```python
for conn in model.connections:
    print(f"{conn.name}: O->T={conn.ot_size}, T->O={conn.to_size}")
```

### Export to JSON
```python
with open('output.json', 'w') as f:
    f.write(model.to_json(indent=2))
```

### Check for Errors
```python
from eds_parser import Severity

errors = [d for d in diagnostics if d.severity == Severity.ERROR]
if errors:
    for err in errors:
        print(f"Line {err.location.line}: {err.message}")
```

## 📊 Data Model Cheat Sheet

```
DeviceModel
  .source              # File metadata
    .file_path
    .file_hash
    .dialect_id
    .parsed_at
  
  .file_info           # EDS metadata
    .desc_text
    .revision
    .create_date
    .home_url
  
  .device_identity     # Device info
    .vendor_name
    .vendor_code
    .product_name
    .product_code
    .major_revision
    .minor_revision
  
  .device_classification
    .Class1            # Protocol type
    .Class2            # Device category
  
  .parameters[]        # List of parameters
    .param_id
    .name
    .data_type
    .default_value
    .min_value
    .max_value
  
  .connections[]       # I/O connections
    .connection_id
    .name
    .trigger_transport
    .connection_params
    .ot_rpi           # Originator to Target
    .ot_size
    .to_rpi           # Target to Originator
    .to_size
    .help_string
    .path
  
  .ports[]            # Network ports
    .port_id
    .protocol
    .name
    .path
  
  .capacity           # Resource limits
    .max_msg_connections
    .max_io_producers
    .max_io_consumers
    .tspecs[]
  
  .extensions{}       # Unknown sections
```

## 🎨 Visualization Tabs

| Tab | Content |
|-----|---------|
| **Overview** | Device identity, file info, classification |
| **Parameters** | All parameters in sortable table |
| **Connections** | Connection cards with I/O details |
| **Network** | Topology diagram and port config |
| **Capacity** | Resource limits and T-specs |

## ⚙️ Configuration Options

### Strict Mode
```python
# Strict validation (missing required sections = ERROR)
model, diags = parse_eds_file('device.eds', strict_mode=True)
```

### Lenient Mode (Default)
```python
# Lenient validation (missing sections = WARN)
model, diags = parse_eds_file('device.eds', strict_mode=False)
```

## 🔍 Diagnostic Codes

| Code Pattern | Meaning |
|--------------|---------|
| `EDS.SYNTAX.*` | Tokenization issues |
| `EDS.CIP.SECTION.*` | Missing/invalid sections |
| `EDS.CIP.PARAM.*` | Parameter parsing errors |
| `EDS.CIP.CONNECTION.*` | Connection parsing errors |

## 📁 File Structure

```
outputs/
├── index.html              # Visualization (open in browser)
├── eds_data.json           # Parsed data (for integration)
├── parsing_report.txt      # Detailed analysis
├── eds_parser.py           # Parser module
├── generate_viz.py         # CLI tool
├── example_usage.py        # Code examples
├── README.md               # Full documentation
└── PROJECT_SUMMARY.md      # Project overview
```

## 🐛 Troubleshooting

### No Output File
```bash
# Check for diagnostics
python generate_viz.py your_file.eds 2>&1 | grep ERROR
```

### Parsing Errors
```python
# Print all diagnostics
for diag in diagnostics:
    print(f"{diag.severity.value}: {diag.message}")
    if diag.location:
        print(f"  Line {diag.location.line}")
```

### Missing Data
```python
# Check extensions for unrecognized sections
if model.extensions:
    print("Unknown sections:", list(model.extensions.keys()))
```

## 💡 Pro Tips

1. **Always check diagnostics** - Even successful parses may have warnings
2. **Use raw_values** - Original parameter data preserved in `param.raw_values`
3. **Export JSON first** - Easier to debug than trying to parse directly
4. **Customize viz** - Edit colors in index.html (search for `#667eea` and `#764ba2`)
5. **Batch processing** - Loop through multiple EDS files and compare

## 🔗 Quick Links

- Full docs: `README.md`
- Examples: `example_usage.py`
- Parser source: `eds_parser.py`
- Visualization: `index.html`

---

**For more details, see README.md**
