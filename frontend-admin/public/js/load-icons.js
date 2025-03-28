// 從 CDN 載入 Lucide 圖標並保存到指定路徑
document.addEventListener('DOMContentLoaded', function() {
  // 確保 Lucide 已加載
  if (typeof lucide !== 'undefined') {
    // 創建 Music 圖標作為 logo192.png
    const musicSvg = lucide.icons.music.toSvg({
      width: 192,
      height: 192,
      color: '#14b8a6'
    });
    
    // 創建 Headphones 圖標作為 logo512.png
    const headphonesSvg = lucide.icons.headphones.toSvg({
      width: 512,
      height: 512,
      color: '#14b8a6'
    });
    
    // 將 SVG 顯示在頁面上但實際不可見，用作圖標
    const iconContainer = document.createElement('div');
    iconContainer.style.display = 'none';
    iconContainer.innerHTML = musicSvg + headphonesSvg;
    document.body.appendChild(iconContainer);
    
    // 設置 favicon
    const link = document.querySelector("link[rel='icon']");
    if (link) {
      const faviconSvg = lucide.icons.music.toSvg({
        width: 32,
        height: 32,
        color: '#14b8a6'
      });
      
      const svgBlob = new Blob([faviconSvg], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);
      link.href = svgUrl;
    }
  }
});
