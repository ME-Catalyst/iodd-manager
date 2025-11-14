#!/usr/bin/env python3
"""
Example usage of the EDS Parser
"""

from eds_parser import parse_eds_file, Severity
import json

# Example 1: Basic parsing
print("=" * 80)
print("EXAMPLE 1: Basic EDS File Parsing")
print("=" * 80)

model, diagnostics = parse_eds_file('TM221_Generic.eds', strict_mode=False)

print(f"\n✅ Successfully parsed: {model.device_identity.product_name}")
print(f"   Vendor: {model.device_identity.vendor_name}")
print(f"   Product Code: 0x{model.device_identity.product_code:04X}")
print(f"   Revision: {model.device_identity.major_revision}.{model.device_identity.minor_revision}")
print(f"\n📊 Statistics:")
print(f"   Parameters: {len(model.parameters)}")
print(f"   Connections: {len(model.connections)}")
print(f"   Ports: {len(model.ports)}")

# Example 2: Accessing parameters
print("\n" + "=" * 80)
print("EXAMPLE 2: Iterating Through Parameters")
print("=" * 80)

for param in model.parameters:
    print(f"\n📌 {param.param_id}: {param.name}")
    print(f"   Data Type: {param.data_type or 'N/A'}")
    print(f"   Default: {param.default_value or 'N/A'}")
    print(f"   Range: [{param.min_value or 'N/A'}, {param.max_value or 'N/A'}]")

# Example 3: Accessing connections
print("\n" + "=" * 80)
print("EXAMPLE 3: Examining Connections")
print("=" * 80)

for conn in model.connections:
    print(f"\n🔌 {conn.connection_id}: {conn.name}")
    print(f"   Trigger & Transport: {conn.trigger_transport}")
    print(f"   Connection Parameters: {conn.connection_params}")
    print(f"   O->T: RPI={conn.ot_rpi}, Size={conn.ot_size}")
    print(f"   T->O: RPI={conn.to_rpi}, Size={conn.to_size}")
    if conn.help_string:
        print(f"   Description: {conn.help_string}")

# Example 4: Network configuration
print("\n" + "=" * 80)
print("EXAMPLE 4: Network Configuration")
print("=" * 80)

for port in model.ports:
    print(f"\n🌐 {port.port_id}: {port.name}")
    print(f"   Protocol: {port.protocol}")
    print(f"   Path: {port.path}")
    if port.port_number:
        print(f"   Port Number: {port.port_number}")

# Example 5: Capacity information
print("\n" + "=" * 80)
print("EXAMPLE 5: Device Capacity")
print("=" * 80)

capacity = model.capacity
print(f"\n💾 Resource Limits:")
print(f"   Max Message Connections: {capacity.max_msg_connections or 'N/A'}")
print(f"   Max I/O Producers: {capacity.max_io_producers or 'N/A'}")
print(f"   Max I/O Consumers: {capacity.max_io_consumers or 'N/A'}")

if capacity.tspecs:
    print(f"\n   Transport Specifications:")
    for spec in capacity.tspecs:
        print(f"   - {spec['type']}: {spec['value1']}, {spec['value2']}")

# Example 6: Handling diagnostics
print("\n" + "=" * 80)
print("EXAMPLE 6: Parsing Diagnostics")
print("=" * 80)

if diagnostics:
    print(f"\n⚠️  Found {len(diagnostics)} diagnostic messages:")
    for diag in diagnostics:
        severity_icon = {
            Severity.INFO: "ℹ️",
            Severity.WARN: "⚠️",
            Severity.ERROR: "❌",
            Severity.FATAL: "💀"
        }.get(diag.severity, "❓")
        print(f"\n{severity_icon} {diag.severity.value}: {diag.message}")
        print(f"   Code: {diag.code}")
        if diag.location:
            print(f"   Location: Line {diag.location.line}")
else:
    print("\n✅ No diagnostics - file parsed perfectly!")

# Example 7: JSON export
print("\n" + "=" * 80)
print("EXAMPLE 7: Exporting to JSON")
print("=" * 80)

json_str = model.to_json(indent=2)
print(f"\n📄 JSON output: {len(json_str)} characters")
print(f"   First 200 characters:")
print(f"   {json_str[:200]}...")

# Save to file
with open('example_output.json', 'w') as f:
    f.write(json_str)
print(f"\n✅ Saved to example_output.json")

# Example 8: Accessing extensions
print("\n" + "=" * 80)
print("EXAMPLE 8: Vendor-Specific Extensions")
print("=" * 80)

if model.extensions:
    print(f"\n📦 Found {len(model.extensions)} extension sections:")
    for section_name, items in model.extensions.items():
        print(f"\n   [{section_name}]")
        for item in items[:3]:  # Show first 3 items
            print(f"   - {item['key']} = {item['value'][:50]}...")
else:
    print("\n✅ No extensions - all sections were recognized!")

print("\n" + "=" * 80)
print("Examples complete!")
print("=" * 80)
