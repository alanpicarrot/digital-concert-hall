/**
 * API 路徑檢查工具
 * 用於掃描前端代碼中的潛在 API 路徑問題
 * 
 * 使用方法:
 * node check-api-paths.js
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

// 不包含 /api 的 API 調用的正則表達式
const invalidApiPatternRegex = /(axios|axiosInstance)\.(get|post|put|delete|patch)\(['"`](?!\/api\/)[^'"`]+['"`]/g;

// 硬編碼的 API URL 的正則表達式
const hardcodedUrlRegex = /['"`](https?:\/\/[^'"`]+\/api\/|http?:\/\/[^'"`]+\/api\/)[^'"`]+['"`]/g;

// 記錄問題文件
const issues = [];

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
      checkFile(fullPath);
    }
  }
}

// 檢查單個文件
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fileHasIssues = false;
    
    // 檢查不包含 /api 的 API 調用
    const invalidApiMatches = content.match(invalidApiPatternRegex);
    if (invalidApiMatches) {
      issues.push({
        file: filePath,
        issues: `Found ${invalidApiMatches.length} API call(s) not starting with /api/`,
        matches: invalidApiMatches
      });
      fileHasIssues = true;
    }
    
    // 檢查硬編碼的 API URL
    const hardcodedUrlMatches = content.match(hardcodedUrlRegex);
    if (hardcodedUrlMatches) {
      if (!fileHasIssues) {
        issues.push({
          file: filePath,
          issues: `Found ${hardcodedUrlMatches.length} hardcoded API URL(s)`,
          matches: hardcodedUrlMatches
        });
      } else {
        // 如果文件已經有問題，就附加新問題
        issues[issues.length - 1].issues += ` and ${hardcodedUrlMatches.length} hardcoded API URL(s)`;
        issues[issues.length - 1].matches = [
          ...(issues[issues.length - 1].matches || []),
          ...hardcodedUrlMatches
        ];
      }
    }
    
    // 檢查是否存在未使用 validateApiPath 的情況
    // 這需要上下文分析，可能會有誤報，僅作為參考
    if (content.includes('axiosInstance') || content.includes('axios.')) {
      const hasImportValidateApiPath = content.includes('validateApiPath');
      if (!hasImportValidateApiPath && (content.includes('/api/') || invalidApiMatches)) {
        if (!fileHasIssues) {
          issues.push({
            file: filePath,
            issues: 'API calls present but validateApiPath function not imported or used',
            recommendation: 'Consider importing and using validateApiPath for all API calls'
          });
        } else {
          // 附加建議
          issues[issues.length - 1].recommendation = 'Consider importing and using validateApiPath for all API calls';
        }
      }
    }
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err.message}`);
  }
}

// 打印報告
function printReport() {
  console.log('===== API Path Check Report =====');
  console.log(`Total files with issues: ${issues.length}`);
  console.log('');
  
  if (issues.length === 0) {
    console.log('🎉 No API path issues found!');
    return;
  }
  
  issues.forEach((issue, index) => {
    console.log(`Issue #${index + 1}:`);
    console.log(`File: ${issue.file}`);
    console.log(`Problem: ${issue.issues}`);
    
    if (issue.matches) {
      console.log('Examples:');
      // 只顯示前 3 個例子
      const examples = issue.matches.slice(0, 3);
      examples.forEach(match => {
        console.log(`  - ${match}`);
      });
      
      if (issue.matches.length > 3) {
        console.log(`  ... and ${issue.matches.length - 3} more.`);
      }
    }
    
    if (issue.recommendation) {
      console.log(`Recommendation: ${issue.recommendation}`);
    }
    
    console.log('');
  });
  
  console.log('===== End of Report =====');
  console.log('');
  console.log('Reminder: Always use validateApiPath to ensure API paths start with /api/');
  console.log('See Documentation/API_PATH_STANDARD.md for more details.');
}

// 主函數
function main() {
  console.log('Scanning for API path issues...');
  
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
