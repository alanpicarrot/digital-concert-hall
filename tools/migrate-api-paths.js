/**
 * API 路徑自動修復工具
 * 用於將舊的 API 路徑模式修改為新的標準模式
 * 
 * 使用方法:
 * node migrate-api-paths.js
 */

const fs = require('fs');
const path = require('path');

// 搜索這些擴展名的文件
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

// 需要掃描的目錄
const dirsToScan = [
  path.resolve(__dirname, '../frontend-client/src'),
  path.resolve(__dirname, '../frontend-admin/src')
];

// 要進行替換的模式
const replacements = [
  // 替換不帶 /api 前綴的路徑 
  {
    pattern: /(axios|axiosInstance)\.(get|post|put|delete|patch)\(['"`](\/(?!api\/)[^'"`]+)['"`]/g,
    replacement: (match, client, method, url) => `${client}.${method}(validateApiPath('/api${url}')`
  },
  // 替換硬編碼的 baseURL
  {
    pattern: /baseURL: ['"`](https?:\/\/[^'"`]+)['"`]/g,
    replacement: (match, url) => {
      if (url.endsWith('/api')) {
        return `baseURL: '${url.slice(0, -4)}'`;
      }
      return match;
    }
  },
  // 將直接字串連接替換為 validateApiPath
  {
    pattern: /(['"]\${API_URL})(\/api\/[^'"`]+['"])/g,
    replacement: (match, baseUrl, apiPath) => `${baseUrl}${apiPath.slice(0, 1)}validateApiPath('/api${apiPath.slice(5)}')`
  }
];

// 需要添加的導入語句
const requiredImport = "import { validateApiPath } from '../utils/apiUtils';";
const requiredAdminImport = "import { validateApiPath } from '../../utils/apiUtils';";

// 記錄修改的文件
const modifiedFiles = [];

// 遞歸掃描目錄
function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // 排除 node_modules 和其他常見的不需要掃描的目錄
      if (entry.name !== 'node_modules' && 
          entry.name !== 'build' && 
          entry.name !== 'dist' && 
          !entry.name.startsWith('.')) {
        scanDirectory(fullPath);
      }
    } else if (fileExtensions.includes(path.extname(entry.name))) {
      processFile(fullPath);
    }
  }
}

// 處理單個文件
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let modified = false;
    
    // 檢查文件是否包含 API 調用
    const hasApiCalls = content.includes('axios.') || content.includes('axiosInstance.');
    
    if (!hasApiCalls) {
      return;
    }
    
    // 進行替換
    for (const { pattern, replacement } of replacements) {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }
    
    // 添加必要的導入語句
    if (modified && !content.includes('validateApiPath')) {
      // 判斷是在管理員界面還是客戶端界面
      const isAdmin = filePath.includes('/admin/');
      const importStatement = isAdmin ? requiredAdminImport : requiredImport;
      
      // 找到最後一個 import 語句，在其後添加
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        let endOfImport = content.indexOf(';', lastImportIndex);
        if (endOfImport !== -1) {
          content = content.slice(0, endOfImport + 1) + '\n' + importStatement + content.slice(endOfImport + 1);
        } else {
          // 如果找不到分號，可能是使用了另一種導入語法
          endOfImport = content.indexOf('\n', lastImportIndex);
          if (endOfImport !== -1) {
            content = content.slice(0, endOfImport + 1) + importStatement + '\n' + content.slice(endOfImport + 1);
          } else {
            // 最後的嘗試，在文件頂部添加
            content = importStatement + '\n\n' + content;
          }
        }
      } else {
        // 如果沒有 import 語句，直接在頂部添加
        content = importStatement + '\n\n' + content;
      }
    }
    
    // 如果文件有更改，保存並記錄
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles.push(filePath);
    }
  } catch (err) {
    console.error(`Error processing file ${filePath}: ${err.message}`);
  }
}

// 打印報告
function printReport() {
  console.log('===== API Path Migration Report =====');
  console.log(`Total files modified: ${modifiedFiles.length}`);
  console.log('');
  
  if (modifiedFiles.length === 0) {
    console.log('No files needed modifications.');
    return;
  }
  
  console.log('Modified files:');
  modifiedFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  
  console.log('');
  console.log('===== End of Report =====');
  console.log('');
  console.log('Please review the changes and test your application before committing.');
  console.log('See Documentation/API_PATH_STANDARD.md for the API path standards.');
}

// 主函數
function main() {
  console.log('Starting API path migration...');
  
  dirsToScan.forEach(dir => {
    if (fs.existsSync(dir)) {
      scanDirectory(dir);
    } else {
      console.warn(`Directory does not exist: ${dir}`);
    }
  });
  
  printReport();
}

main();
