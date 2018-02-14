(function($) {
  "use strict";

  window.Analytics = {
    modal: function(options) {
      PluginEndpoint.ensure();

      var div = $('.overlay_content');

      $.ajax({
        url: options.url,
        dataType: "json",
        type: "GET"
      }).done(function(r) {
        var frame = document.createElement("iframe");
        frame.sandbox = "allow-scripts";

        frame.onload = function(e) {
          PluginEndpoint.init(frame.contentWindow, {data: r.data })
        };

        div.append(frame);
        frame.setAttribute("src", r.view_path);
      }).fail(function(xhr) {
        var errorEl = document.createElement("div");
        $(errorEl).addClass("error");
        errorEl.textContent = xhr.responseText;
        div.append(errorEl);
      });

      $('.overlay').show();
      $('.overlay_bg').show();
      $('body').addClass("fixed");

      $('.overlay_close').click(function() {
        $('.overlay').fadeOut();
        $('.overlay_bg').fadeOut();
        $('body').removeClass("fixed");
        div.empty();
      });
    }
  };

})(jQuery);
