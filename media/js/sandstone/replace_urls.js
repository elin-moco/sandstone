(function() {
    var links;
    links = $('a[href*="//blog.mozilla.com.tw"]');
    links.each(function() {
      $(this).attr('href', $(this).attr('href').replace('//blog.mozilla.com.tw', '//blog.inspire.mozilla.com.tw'));
    })
    links = $('a[href*="//mozilla.com.tw"]');
    links.each(function() {
      $(this).attr('href', $(this).attr('href').replace('//mozilla.com.tw', '//bedrock.inspire.mozilla.com.tw'));
    })
    links = $('a[href*="//myfirefox.com.tw"]');
    links.each(function() {
      $(this).attr('href', $(this).attr('href').replace('//myfirefox.com.tw', '//stage.myfirefox.com.tw'));
    })
    links = $('a[href*="//firefox.club.tw"]');
    links.each(function() {
      $(this).attr('href', $(this).attr('href').replace('//firefox.club.tw', '//ffclub.inspire.mozilla.com.tw'));
    })
    links = $('a[href*="//tech.mozilla.com.tw"]');
    links.each(function() {
      $(this).attr('href', $(this).attr('href').replace('//tech.mozilla.com.tw', '//tech.inspire.mozilla.com.tw'));
    })
})();