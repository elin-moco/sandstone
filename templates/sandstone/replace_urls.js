(function() {
    var links;
{% for origin,local in URL_MAP.items() %}
    links = $('a[href*="//{{ origin }}"]');
    links.each(function() {
      $(this).attr('href', $(this).attr('href').replace('//{{ origin }}', '//{{ local }}'));
    })
{% endfor %}
})();