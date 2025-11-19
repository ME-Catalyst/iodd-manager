#!/usr/bin/env python3
"""
Automated Tab Extraction Script for DeviceDetailsPage
Extracts tab components from App.jsx based on line ranges
"""

import os
import re

# Configuration
APP_JSX_PATH = r"F:\github\GreenStack\frontend\src\App.jsx"
TABS_DIR = r"F:\github\GreenStack\frontend\src\components\device-details\tabs"
OUTPUT_DIR = r"F:\github\GreenStack\frontend\src\components\device-details"

# Tab definitions with line ranges and metadata
TABS = [
    {
        'name': 'OverviewTab',
        'start_line': 2547,
        'end_line': 3297,
        'file': 'OverviewTab.jsx',
        'imports': [
            'Card', 'CardHeader', 'CardContent', 'CardTitle', 'CardDescription',
            'Badge', 'Tabs', 'TabsContent'
        ],
        'icons': [
            'Zap', 'Database', 'ImageIcon', 'FileCode', 'FileText',
            'GitBranch', 'Cable', 'Clock', 'CheckCircle', 'Code2', 'List', 'Layers',
            'Settings', 'Lock', 'Wrench', 'Monitor', 'ExternalLink'
        ],
        'props': ['device', 'deviceData', 'API_BASE', 'formatVersion', 'translateText']
    },
    {
        'name': 'ParametersTab',
        'start_line': 3300,
        'end_line': 3623,
        'file': 'ParametersTab.jsx',
        'imports': [
            'Card', 'CardHeader', 'CardContent', 'CardTitle',
            'Button', 'Input', 'Badge', 'TabsContent'
        ],
        'icons': ['Database', 'Download', 'Search', 'Filter'],
        'props': ['device', 'parameters', 'exportHandlers', 'getDataTypeDisplay', 'getAccessRightInfo']
    },
    {
        'name': 'ProcessDataTab',
        'start_line': 3862,
        'end_line': 4408,
        'file': 'ProcessDataTab.jsx',
        'imports': [
            'Card', 'CardHeader', 'CardContent', 'CardTitle', 'CardDescription',
            'Button', 'Badge', 'TabsContent', 'Skeleton'
        ],
        'icons': ['Activity', 'Download', 'Info', 'Database'],
        'props': ['device', 'deviceData', 'exportHandlers', 'formatDisplayValue', 'applyScaling', 'getUiInfo']
    },
    {
        'name': 'MenusTab',
        'start_line': 4542,
        'end_line': 4824,
        'file': 'MenusTab.jsx',
        'imports': [
            'Card', 'CardHeader', 'CardContent', 'CardTitle',
            'Button', 'TabsContent', 'ScrollArea'
        ],
        'icons': ['Menu', 'Download'],
        'props': ['device', 'uiMenus', 'MenuItemDisplay', 'InteractiveParameterControl']
    },
    {
        'name': 'CommunicationTab',
        'start_line': 4411,
        'end_line': 4539,
        'file': 'CommunicationTab.jsx',
        'imports': [
            'Card', 'CardHeader', 'CardContent', 'CardTitle', 'CardDescription',
            'Badge', 'TabsContent'
        ],
        'icons': ['Wifi', 'Network', 'Gauge'],
        'props': ['device', 'communicationProfile', 'translateBitrate', 'formatCycleTime']
    },
    {
        'name': 'XMLTab',
        'start_line': 4827,
        'end_line': 4873,
        'file': 'XMLTab.jsx',
        'imports': [
            'Card', 'CardHeader', 'CardContent', 'CardTitle',
            'Button', 'TabsContent', 'ScrollArea', 'Skeleton'
        ],
        'icons': ['Code2', 'Copy'],
        'props': ['device', 'xmlContent', 'loadingXml', 'fetchXml']
    },
    {
        'name': 'TechnicalTab',
        'start_line': 4876,
        'end_line': 4981,
        'file': 'TechnicalTab.jsx',
        'imports': [
            'Card', 'CardHeader', 'CardContent', 'CardTitle', 'CardDescription',
            'Badge', 'TabsContent'
        ],
        'icons': ['Settings', 'Info'],
        'props': ['device', 'processDataConditions', 'deviceVariants']
    }
]

def read_file_lines(filepath, start, end):
    """Read specific lines from a file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        return lines[start-1:end]

def generate_tab_component(tab_config):
    """Generate a tab component file"""
    print(f"Extracting {tab_config['name']}...")
    
    # Read the tab content from App.jsx
    content_lines = read_file_lines(
        APP_JSX_PATH,
        tab_config['start_line'],
        tab_config['end_line']
    )
    
    # Generate imports
    imports = f"""import React from 'react';
import {{
  {', '.join(tab_config['imports'])}
}} from '@/components/ui';
import {{
  {', '.join(tab_config['icons'])}
}} from 'lucide-react';
"""
    
    # Generate component structure
    props_str = '{ ' + ', '.join(tab_config['props']) + ' }'
    
    component = f"""{imports}

export const {tab_config['name']} = ({props_str}) => {{
  return (
    {''.join(content_lines)}
  );
}};
"""
    
    # Write to file
    output_path = os.path.join(TABS_DIR, tab_config['file'])
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(component)
    
    print(f"  ✓ Created {output_path}")
    return output_path

def main():
    """Main extraction process"""
    print("=" * 60)
    print("DeviceDetailsPage Tab Extraction Script")
    print("=" * 60)
    print()
    
    # Ensure output directory exists
    os.makedirs(TABS_DIR, exist_ok=True)
    
    # Extract each tab
    extracted_files = []
    for tab in TABS:
        try:
            filepath = generate_tab_component(tab)
            extracted_files.append(filepath)
        except Exception as e:
            print(f"  ✗ Error extracting {tab['name']}: {e}")
    
    print()
    print("=" * 60)
    print(f"Extraction Complete: {len(extracted_files)}/{len(TABS)} tabs")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Review extracted tab components")
    print("2. Fix any import/reference issues")
    print("3. Create DeviceDetailsPage container")
    print("4. Update App.jsx imports")
    print("5. Test build: npm run build")

if __name__ == '__main__':
    main()
