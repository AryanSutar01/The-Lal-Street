const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const uiDir = path.join(__dirname, 'client', 'src', 'components', 'ui');

// Icon name mappings (Icon suffix -> without Icon)
const iconMappings = {
  'XIcon': 'X',
  'CircleIcon': 'Circle',
  'ChevronDownIcon': 'ChevronDown',
  'CheckIcon': 'Check',
  'ChevronRightIcon': 'ChevronRight',
  'PanelLeftIcon': 'PanelLeft',
  'GripVerticalIcon': 'GripVertical',
  'SearchIcon': 'Search',
  'MinusIcon': 'Minus',
};

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix @radix-ui imports with version numbers
  content = content.replace(/@radix-ui\/react-([^"'\s@]+)@[\d.]+/g, (match, pkg) => {
    changed = true;
    return `@radix-ui/react-${pkg}`;
  });

  // Fix lucide-react imports with version numbers
  content = content.replace(/from\s+["']lucide-react@[\d.]+["']/g, (match) => {
    changed = true;
    return match.replace(/@[\d.]+/, '');
  });

  // Fix icon imports (Icon suffix)
  for (const [oldName, newName] of Object.entries(iconMappings)) {
    const importRegex = new RegExp(`import\\s*\\{[^}]*\\b${oldName}\\b[^}]*\\}\\s*from\\s*["']lucide-react["']`, 'g');
    if (importRegex.test(content)) {
      content = content.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName);
      changed = true;
    }
  }

  // Fix icon usage
  for (const [oldName, newName] of Object.entries(iconMappings)) {
    const usageRegex = new RegExp(`<${oldName}`, 'g');
    if (usageRegex.test(content)) {
      content = content.replace(new RegExp(`<${oldName}`, 'g'), `<${newName}`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${path.basename(filePath)}`);
    return true;
  }
  return false;
}

// Get all .tsx files in ui directory
const files = fs.readdirSync(uiDir)
  .filter(file => file.endsWith('.tsx'))
  .map(file => path.join(uiDir, file));

console.log(`Found ${files.length} UI component files`);
let fixedCount = 0;

files.forEach(file => {
  if (fixImports(file)) {
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files`);

