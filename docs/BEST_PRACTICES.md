# Best Practices for Device Configuration UI Generation

**Version:** 1.0
**Last Updated:** 2025-11-12

---

## Table of Contents

1. [General Principles](#general-principles)
2. [Menu Organization](#menu-organization)
3. [Control Selection](#control-selection)
4. [Validation & Feedback](#validation--feedback)
5. [Accessibility](#accessibility)
6. [Performance](#performance)
7. [Testing](#testing)

---

## General Principles

### ✅ DO: Preserve Manufacturer Intent

**Why:** Manufacturers organize parameters based on device operation workflow

```jsx
// ✅ GOOD: Use menu structure as-is
const MenuNavigation = ({ menus }) => (
  <nav>
    {menus.map(menu => (
      <MenuItem key={menu.id} menu={menu} />
    ))}
  </nav>
);

// ❌ BAD: Reorganize alphabetically
const MenuNavigation = ({ menus }) => {
  const sorted = [...menus].sort((a, b) => a.name.localeCompare(b.name));
  // This destroys the manufacturer's logical grouping
};
```

### ✅ DO: Show Default Values

**Why:** Users need to know factory defaults for reset/comparison

```jsx
// ✅ GOOD: Display default prominently
<div>
  <Label>{param.name}</Label>
  <Input value={currentValue} onChange={handleChange} />
  <span className="text-muted">Default: {param.default_value}</span>
</div>

// ❌ BAD: Hide default value
<Input value={currentValue} onChange={handleChange} />
```

### ✅ DO: Respect Access Rights

**Why:** Prevents user frustration and potential device damage

```jsx
// ✅ GOOD: Disable read-only parameters
<Input
  value={value}
  disabled={item.access_right_restriction === 'ro'}
  className={item.access_right_restriction === 'ro' ? 'opacity-50' : ''}
/>

// ❌ BAD: Allow editing read-only values
<Input value={value} onChange={handleChange} />
```

### ✅ DO: Handle Missing Data Gracefully

**Why:** Not all devices have complete IODD definitions

```jsx
// ✅ GOOD: Check for null parameter
if (!item.parameter) {
  return (
    <div className="text-muted">
      Parameter definition not available
    </div>
  );
}

// ❌ BAD: Assume parameter exists
const control = generateControl(item.parameter.data_type);  // May crash
```

---

## Menu Organization

### Hierarchical Navigation

**Pattern:** Breadcrumb + Tree View

```jsx
const ConfigPage = () => {
  return (
    <div className="flex">
      {/* Left: Tree navigation */}
      <aside className="w-64">
        <MenuTree menus={menus} />
      </aside>

      {/* Right: Active content */}
      <main className="flex-1">
        {/* Breadcrumb */}
        <nav className="mb-4">
          Home → Parameters → Detection Setup
        </nav>

        {/* Content */}
        <MenuContent menu={activeMenu} />
      </main>
    </div>
  );
};
```

### Visual Hierarchy

```css
/* Level 1: Main sections */
.menu-level-1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: primary;
}

/* Level 2: Subsections */
.menu-level-2 {
  font-size: 1rem;
  font-weight: 600;
  color: secondary;
  padding-left: 1rem;
}

/* Level 3: Parameters */
.menu-level-3 {
  font-size: 0.875rem;
  font-weight: 400;
  padding-left: 2rem;
}
```

### Collapsible Sections

```jsx
// ✅ GOOD: Expand first level by default
const [expandedMenus, setExpandedMenus] = useState(() => {
  return new Set(menus.filter(m => !m.parentId).map(m => m.id));
});

// ❌ BAD: Expand all levels (overwhelming)
const [expandedMenus, setExpandedMenus] = useState(() => {
  return new Set(menus.map(m => m.id));
});
```

---

## Control Selection

### Decision Matrix

| Condition | Control Type | Example |
|-----------|--------------|---------|
| Has 2-5 enum values | Radio Group | On/Off, Low/Med/High |
| Has 6+ enum values | Dropdown | Country list, modes |
| Boolean type | Toggle Switch | Enable/Disable |
| Numeric with range | Slider + Input | 0-100, Temperature |
| Numeric without range | Number Input | Custom value |
| String | Text Input | Device name |
| Button action | Button | Teach-in, Reset |

### Control Implementation

#### Enumeration → Radio Group (2-5 values)

```jsx
<RadioGroup value={value} onValueChange={onChange}>
  {Object.entries(param.enumeration_values).map(([val, name]) => (
    <div key={val} className="flex items-center space-x-2">
      <RadioGroupItem value={val} id={val} />
      <Label htmlFor={val}>{name}</Label>
    </div>
  ))}
</RadioGroup>
```

#### Enumeration → Dropdown (6+ values)

```jsx
<Select value={value} onValueChange={onChange}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    {Object.entries(param.enumeration_values).map(([val, name]) => (
      <SelectItem key={val} value={val}>{name}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

#### Numeric → Slider + Input

```jsx
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <Label>{param.name}</Label>
    <Input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-20"
      min={param.min_value}
      max={param.max_value}
    />
  </div>
  <Slider
    value={[parseInt(value)]}
    onValueChange={([v]) => onChange(v.toString())}
    min={parseInt(param.min_value)}
    max={parseInt(param.max_value)}
    step={1}
  />
  <div className="flex justify-between text-xs text-muted">
    <span>{param.min_value}</span>
    <span>{param.max_value}</span>
  </div>
</div>
```

---

## Validation & Feedback

### Validation Timing

```jsx
// ✅ GOOD: Validate on blur, show errors immediately
const [error, setError] = useState(null);

const handleBlur = () => {
  const errors = validateParameter(item, value);
  setError(errors.length > 0 ? errors[0] : null);
};

// ❌ BAD: Only validate on submit (late feedback)
```

### Error Display

```jsx
// ✅ GOOD: Inline errors with icons
{error && (
  <div className="flex items-center gap-2 mt-1 text-red-500 text-sm">
    <AlertCircle className="w-4 h-4" />
    <span>{error}</span>
  </div>
)}

// ❌ BAD: Toast notification (disappears, hard to track multiple errors)
```

### Success Feedback

```jsx
// ✅ GOOD: Visual confirmation
const [saved, setSaved] = useState(false);

const handleSave = async () => {
  await saveParameter();
  setSaved(true);
  setTimeout(() => setSaved(false), 2000);
};

{saved && (
  <div className="flex items-center gap-2 text-green-500">
    <CheckCircle className="w-4 h-4" />
    <span>Saved successfully</span>
  </div>
)}
```

---

## Accessibility

### Keyboard Navigation

```jsx
// ✅ GOOD: Keyboard support
<div
  role="menuitem"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSelect();
    }
  }}
>
  {menu.name}
</div>
```

### Screen Readers

```jsx
// ✅ GOOD: ARIA labels
<Slider
  aria-label={param.name}
  aria-valuemin={param.min_value}
  aria-valuemax={param.max_value}
  aria-valuenow={value}
  aria-valuetext={`${value} ${item.unit_code || ''}`}
/>
```

### Focus Management

```jsx
// ✅ GOOD: Focus first control when menu changes
useEffect(() => {
  if (activeMenu) {
    const firstInput = menuRef.current?.querySelector('input, select, button');
    firstInput?.focus();
  }
}, [activeMenu]);
```

---

## Performance

### Lazy Loading

```jsx
// ✅ GOOD: Load menu content on demand
const [loadedMenus, setLoadedMenus] = useState(new Set());

const loadMenuContent = (menuId) => {
  if (!loadedMenus.has(menuId)) {
    // Fetch detailed parameter data
    fetchMenuDetails(menuId);
    setLoadedMenus(prev => new Set([...prev, menuId]));
  }
};
```

### Memoization

```jsx
// ✅ GOOD: Memoize expensive computations
const filteredMenus = useMemo(() => {
  return menus.filter(menu =>
    availableMenuIds.includes(menu.id)
  );
}, [menus, availableMenuIds]);

// ✅ GOOD: Memoize control rendering
const ParameterControl = React.memo(({ item, value, onChange }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value &&
         prevProps.item.variable_id === nextProps.item.variable_id;
});
```

### Debouncing

```jsx
// ✅ GOOD: Debounce text inputs
const [debouncedValue, setDebouncedValue] = useState(value);

useEffect(() => {
  const timer = setTimeout(() => {
    onChange(debouncedValue);
  }, 300);

  return () => clearTimeout(timer);
}, [debouncedValue]);

<Input
  value={debouncedValue}
  onChange={(e) => setDebouncedValue(e.target.value)}
/>
```

---

## Testing

### Unit Tests

```javascript
describe('ParameterControl', () => {
  it('renders dropdown for enumeration parameters', () => {
    const param = {
      enumeration_values: { '0': 'Off', '1': 'On' }
    };

    const { getByRole } = render(
      <ParameterControl item={{ parameter: param }} />
    );

    expect(getByRole('combobox')).toBeInTheDocument();
  });

  it('disables control for read-only parameters', () => {
    const item = {
      access_right_restriction: 'ro',
      parameter: { data_type: 'UIntegerT' }
    };

    const { getByRole } = render(
      <ParameterControl item={item} />
    );

    expect(getByRole('spinbutton')).toBeDisabled();
  });
});
```

### Integration Tests

```javascript
describe('ConfigPage', () => {
  it('filters menus by user role', async () => {
    const { queryByText } = render(
      <ConfigPage deviceId={123} userRole="observer" />
    );

    // Observer should not see parameter menu
    await waitFor(() => {
      expect(queryByText('Parameters')).not.toBeInTheDocument();
      expect(queryByText('Identification')).toBeInTheDocument();
    });
  });
});
```

### Manual Testing Checklist

- [ ] All menu levels are accessible
- [ ] Parameters respect access rights
- [ ] Validation works for all data types
- [ ] Default values are displayed
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Long parameter lists don't freeze UI
- [ ] Error messages are clear and actionable
- [ ] Role filtering works correctly

---

## Common Pitfalls

### ❌ Ignoring Unit Codes

```jsx
// ❌ BAD: No unit display
<Input value={value} />

// ✅ GOOD: Show unit
<Input value={value} />
<span className="ml-2 text-muted">{item.unit_code}</span>
```

### ❌ Not Handling MenuRef

```jsx
// ❌ BAD: Skip submenu items
{item.parameter && <ParameterControl item={item} />}

// ✅ GOOD: Render submenu links
{item.menu_ref ? (
  <button onClick={() => navigateToMenu(item.menu_ref)}>
    → {item.menu_ref}
  </button>
) : item.parameter ? (
  <ParameterControl item={item} />
) : null}
```

### ❌ Forgetting Button Items

```jsx
// ❌ BAD: Only handle parameters
{item.parameter && <ParameterControl item={item} />}

// ✅ GOOD: Handle all item types
{item.button_value ? (
  <ActionButton item={item} />
) : item.parameter ? (
  <ParameterControl item={item} />
) : null}
```

---

## Reference Implementation

The enhanced **Menus tab** in this application demonstrates all these best practices:

- Collapsible menu sections
- Proper control type selection
- Default value display
- Access rights enforcement
- Config form previews
- Role-based filtering

**Location:** `frontend/src/App.jsx` - Lines 1020-1590

---

## Further Reading

- `CONFIG_PAGE_DEVELOPER_GUIDE.md` - Complete implementation guide
- `API_SPECIFICATION.md` - API reference
- IODD Specification 1.1 - Official standard
- IO-Link Master Integration Guide - Device communication

---

**Have suggestions?** The Menus tab is a living reference - improvements welcome!
