/**
 * 調試腳本 - 測試初始化和認證流程
 * 
 * 使用方法：
 * 1. 在瀏覽器開發者工具中運行此腳本
 * 2. 查看控制台輸出
 */

async function testPaths() {
  console.log('開始測試路徑 - ' + new Date().toISOString());

  // 後端基本 URL
  const baseUrl = 'http://localhost:8081'; // 直接訪問後端伺服器

  // 嘗試的路徑列表
  const paths = [
    `${baseUrl}/api/setup/init`,
    `${baseUrl}/setup/init`,
    `${baseUrl}/api/test/init`,
    `${baseUrl}/test/init`,
    `${baseUrl}/setup/admin-init`,
    `${baseUrl}/test/ping`
  ];

  let successfulPath = null;
  let initResponse = null;

  // 嘗試每個路徑進行初始化
  for (const path of paths) {
    try {
      console.log(`嘗試路徑: ${path}`);
      const response = await fetch(path);
      
      if (response.ok) {
        const data = await response.text();
        console.log(`成功! 使用路徑: ${path}`);
        console.log(`初始化響應: "${data}"`);
        successfulPath = path;
        initResponse = data;
        break;
      } else {
        console.log(`路徑 ${path} 失敗: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`路徑 ${path} 錯誤: ${error.message}`);
    }
  }
  
  // 如果成功初始化，嘗試登入並獲取 token
  if (successfulPath) {
    try {
      // 嘗試登入
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123'
        })
      });
      
      if (loginResponse.ok) {
        const authData = await loginResponse.json();
        console.log('登入成功!');
        console.log('令牌:', authData.accessToken);
        
        // 使用令牌測試多個受保護的端點
        const token = authData.accessToken;
        const testPaths = [
          `${baseUrl}/api/test/ping`,
          `${baseUrl}/test/ping`
        ];
        
        let testSuccessful = false;
        
        for (const testPath of testPaths) {
          try {
            console.log(`嘗試訪問測試端點: ${testPath}`);
            const testResponse = await fetch(testPath, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (testResponse.ok) {
              const testData = await testResponse.text();
              console.log(`測試響應成功 (${testPath}): "${testData}"`);
              testSuccessful = true;
              break;
            } else {
              console.log(`測試響應失敗 (${testPath}): ${testResponse.status} ${testResponse.statusText}`);
            }
          } catch (error) {
            console.log(`訪問 ${testPath} 錯誤: ${error.message}`);
          }
        }
        
        if (!testSuccessful) {
          console.log('所有測試端點訪問都失敗了!');
        }
        
      } else {
        console.log(`登入失敗: ${loginResponse.status} ${loginResponse.statusText}`);
        const errorData = await loginResponse.text();
        console.log(`錯誤詳情: ${errorData}`);
      }
    } catch (error) {
      console.log(`認證錯誤: ${error.message}`);
    }
  } else {
    console.log('所有初始化路徑都失敗了!');
  }
}

// 運行測試
testPaths();
