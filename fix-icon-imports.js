#!/usr/bin/env node

/**
 * Fix Icon Imports Script
 * سكريبت إصلاح استيرادات الأيقونات
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fix Icon Imports Script');
console.log('🔧 سكريبت إصلاح استيرادات الأيقونات');
console.log('='.repeat(50));

// Icon mappings for @heroicons/react/24/outline
const iconMappings = {
  'DatabaseIcon': 'CircleStackIcon as DatabaseIcon',
  'MailIcon': 'EnvelopeIcon as MailIcon',
  'CreditCardIcon': 'BanknotesIcon as CreditCardIcon',
  'CurrencyDollarIcon': 'BanknotesIcon as CurrencyDollarIcon',
  'PhoneIcon': 'DevicePhoneMobileIcon as PhoneIcon',
  'LocationMarkerIcon': 'MapPinIcon as LocationMarkerIcon',
  'MenuIcon': 'Bars3Icon as MenuIcon',
  'XIcon': 'XMarkIcon as XIcon',
  'SearchIcon': 'MagnifyingGlassIcon as SearchIcon',
  'FilterIcon': 'FunnelIcon as FilterIcon',
  'DotsVerticalIcon': 'EllipsisVerticalIcon as DotsVerticalIcon',
  'DotsHorizontalIcon': 'EllipsisHorizontalIcon as DotsHorizontalIcon',
  'RefreshIcon': 'ArrowPathIcon as RefreshIcon',
  'DownloadIcon': 'ArrowDownTrayIcon as DownloadIcon',
  'UploadIcon': 'ArrowUpTrayIcon as UploadIcon',
  'DuplicateIcon': 'DocumentDuplicateIcon as DuplicateIcon',
  'CollectionIcon': 'RectangleStackIcon as CollectionIcon',
  'ViewListIcon': 'ListBulletIcon as ViewListIcon',
  'ViewGridIcon': 'Squares2X2Icon as ViewGridIcon',
  'SelectorIcon': 'ChevronUpDownIcon as SelectorIcon',
  'SortAscendingIcon': 'BarsArrowUpIcon as SortAscendingIcon',
  'SortDescendingIcon': 'BarsArrowDownIcon as SortDescendingIcon',
  'CalendarIcon': 'CalendarDaysIcon as CalendarIcon',
  'ClipboardIcon': 'ClipboardDocumentIcon as ClipboardIcon',
  'ClipboardCopyIcon': 'ClipboardDocumentCheckIcon as ClipboardCopyIcon',
  'ClipboardListIcon': 'ClipboardDocumentListIcon as ClipboardListIcon',
  'DocumentDownloadIcon': 'DocumentArrowDownIcon as DocumentDownloadIcon',
  'DocumentAddIcon': 'DocumentPlusIcon as DocumentAddIcon',
  'FolderDownloadIcon': 'FolderArrowDownIcon as FolderDownloadIcon',
  'FolderAddIcon': 'FolderPlusIcon as FolderAddIcon',
  'UserAddIcon': 'UserPlusIcon as UserAddIcon',
  'UserRemoveIcon': 'UserMinusIcon as UserRemoveIcon',
  'UsersIcon': 'UsersIcon',
  'UserGroupIcon': 'UserGroupIcon',
  'LoginIcon': 'ArrowRightOnRectangleIcon as LoginIcon',
  'LogoutIcon': 'ArrowLeftOnRectangleIcon as LogoutIcon',
  'SwitchHorizontalIcon': 'ArrowsRightLeftIcon as SwitchHorizontalIcon',
  'SwitchVerticalIcon': 'ArrowsUpDownIcon as SwitchVerticalIcon',
  'TrendingUpIcon': 'ArrowTrendingUpIcon as TrendingUpIcon',
  'TrendingDownIcon': 'ArrowTrendingDownIcon as TrendingDownIcon',
  'ExternalLinkIcon': 'ArrowTopRightOnSquareIcon as ExternalLinkIcon',
  'ReplyIcon': 'ArrowUturnLeftIcon as ReplyIcon',
  'ShareIcon': 'ShareIcon',
  'HeartIcon': 'HeartIcon',
  'StarIcon': 'StarIcon',
  'ThumbUpIcon': 'HandThumbUpIcon as ThumbUpIcon',
  'ThumbDownIcon': 'HandThumbDownIcon as ThumbDownIcon',
  'ChatIcon': 'ChatBubbleLeftIcon as ChatIcon',
  'ChatAltIcon': 'ChatBubbleLeftRightIcon as ChatAltIcon',
  'AnnotationIcon': 'ChatBubbleBottomCenterTextIcon as AnnotationIcon',
  'QuestionMarkCircleIcon': 'QuestionMarkCircleIcon',
  'InformationCircleIcon': 'InformationCircleIcon',
  'ExclamationIcon': 'ExclamationTriangleIcon as ExclamationIcon',
  'ExclamationCircleIcon': 'ExclamationCircleIcon',
  'CheckIcon': 'CheckIcon',
  'CheckCircleIcon': 'CheckCircleIcon',
  'XIcon': 'XMarkIcon as XIcon',
  'XCircleIcon': 'XCircleIcon',
  'MinusIcon': 'MinusIcon',
  'MinusCircleIcon': 'MinusCircleIcon',
  'PlusIcon': 'PlusIcon',
  'PlusCircleIcon': 'PlusCircleIcon',
  'BanIcon': 'NoSymbolIcon as BanIcon',
  'ShieldCheckIcon': 'ShieldCheckIcon',
  'ShieldExclamationIcon': 'ShieldExclamationIcon',
  'LockClosedIcon': 'LockClosedIcon',
  'LockOpenIcon': 'LockOpenIcon',
  'KeyIcon': 'KeyIcon',
  'EyeIcon': 'EyeIcon',
  'EyeOffIcon': 'EyeSlashIcon as EyeOffIcon',
  'CogIcon': 'CogIcon',
  'AdjustmentsIcon': 'AdjustmentsHorizontalIcon as AdjustmentsIcon',
  'ColorSwatchIcon': 'SwatchIcon as ColorSwatchIcon',
  'PhotographIcon': 'PhotoIcon as PhotographIcon',
  'CameraIcon': 'CameraIcon',
  'VideoCameraIcon': 'VideoCameraIcon',
  'MicrophoneIcon': 'MicrophoneIcon',
  'VolumeUpIcon': 'SpeakerWaveIcon as VolumeUpIcon',
  'VolumeOffIcon': 'SpeakerXMarkIcon as VolumeOffIcon',
  'MusicNoteIcon': 'MusicalNoteIcon as MusicNoteIcon',
  'PlayIcon': 'PlayIcon',
  'PauseIcon': 'PauseIcon',
  'StopIcon': 'StopIcon',
  'FastForwardIcon': 'ForwardIcon as FastForwardIcon',
  'RewindIcon': 'BackwardIcon as RewindIcon',
  'SkipNextIcon': 'PlayIcon', // No direct equivalent
  'SkipPreviousIcon': 'PlayIcon', // No direct equivalent
  'ShuffleIcon': 'ArrowsRightLeftIcon as ShuffleIcon',
  'RepeatIcon': 'ArrowPathIcon as RepeatIcon'
};

// Files to check and fix
const filesToFix = [
  'src/app/[lang]/admin/settings/page.tsx',
  'src/components/admin/AdminSettings.tsx',
  'src/components/admin/EnhancedTestManagement.tsx',
  'src/components/admin/DatabaseDiagnostics.tsx',
  'src/components/admin/AdvancedDataManagement.tsx',
  'src/components/admin/ModernAdminDashboard.tsx',
  'src/components/admin/OrganizedAdminDashboard.tsx',
  'src/components/admin/notifications/AdminNotifications.tsx'
];

// Function to fix icon imports in a file
const fixIconImports = (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ ${filePath} - File not found`);
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix import statements
    Object.entries(iconMappings).forEach(([oldIcon, newIcon]) => {
      // Pattern to match import statements
      const importPattern = new RegExp(`\\b${oldIcon}\\b(?=.*from\\s+['"]@heroicons/react)`, 'g');
      
      if (importPattern.test(content)) {
        content = content.replace(new RegExp(`\\b${oldIcon}\\b`, 'g'), newIcon);
        modified = true;
        console.log(`  ✅ Fixed ${oldIcon} → ${newIcon}`);
      }
    });

    // Fix specific problematic imports
    const specificFixes = [
      {
        from: /import\s*{\s*([^}]*)\s*}\s*from\s*['"]@heroicons\/react\/24\/outline['"];?/g,
        to: (match, imports) => {
          // Clean up the imports
          const cleanImports = imports
            .split(',')
            .map(imp => imp.trim())
            .filter(imp => imp.length > 0)
            .join(',\n  ');
          
          return `import {\n  ${cleanImports}\n} from '@heroicons/react/24/outline';`;
        }
      }
    ];

    specificFixes.forEach(fix => {
      if (fix.from.test(content)) {
        content = content.replace(fix.from, fix.to);
        modified = true;
        console.log(`  ✅ Cleaned up import formatting`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath} - Fixed successfully`);
      return true;
    } else {
      console.log(`ℹ️ ${filePath} - No changes needed`);
      return false;
    }

  } catch (error) {
    console.log(`❌ Error fixing ${filePath}: ${error.message}`);
    return false;
  }
};

// Main execution
console.log('\n🔍 Checking and fixing icon imports...');

let totalFixed = 0;

filesToFix.forEach(filePath => {
  console.log(`\n📁 Processing ${filePath}:`);
  if (fixIconImports(filePath)) {
    totalFixed++;
  }
});

// Additional check for any remaining problematic imports
console.log('\n🔍 Scanning for remaining issues...');

const scanForIssues = (filePath) => {
  if (!fs.existsSync(filePath)) return;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for problematic icon names
    const problematicIcons = [
      'DatabaseIcon',
      'MailIcon',
      'CreditCardIcon',
      'CurrencyDollarIcon'
    ];

    problematicIcons.forEach(icon => {
      if (content.includes(icon) && content.includes('@heroicons/react')) {
        console.log(`⚠️ ${filePath} still contains ${icon}`);
      }
    });

  } catch (error) {
    // Ignore read errors
  }
};

filesToFix.forEach(scanForIssues);

console.log('\n📊 Summary:');
console.log(`✅ Fixed ${totalFixed} files`);
console.log(`📁 Total files processed: ${filesToFix.length}`);

if (totalFixed > 0) {
  console.log('\n🎉 Icon import fixes completed!');
  console.log('🎉 تم إكمال إصلاح استيرادات الأيقونات!');
} else {
  console.log('\n✅ No icon import issues found!');
  console.log('✅ لم يتم العثور على مشاكل في استيرادات الأيقونات!');
}

console.log('\n💡 Next steps:');
console.log('1. Run: npm run build');
console.log('2. Check for any remaining build errors');
console.log('3. Test the application locally');

module.exports = { fixIconImports, iconMappings };
