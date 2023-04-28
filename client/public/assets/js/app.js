!(function ($) {})(window.jQuery),
  (function ($) {
    'use strict';
    $(window).load(function () {
      $('#status').fadeOut();
      $('#preloader').delay(350).fadeOut('slow');
      $('body').delay(350).css({
        overflow: 'visible',
      });
    });
  })(window.jQuery);
