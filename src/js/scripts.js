(function(window, document, $, undefined) {
  'use strict';

  var scope = {
    // Initializes all functions.
    init: function() {
      scope.sliderCustom();
      scope.customJs();
    },

    sliderCustom: function() {
      var triggers = $('.each_triggers');
      var images = $('.images-wrapper li');
      var lastElem = triggers.length-1;
      var mask = $('.banner__wrapper-mask .images-wrapper');
      var imgWidth = images.width();
      var target;

      triggers.first().addClass('selected');
      mask.css('width', imgWidth*(lastElem+1) +'px');

      function sliderResponse(target) {
        mask.stop(true,false).animate({'left':'-'+ imgWidth*target +'px'},300);
        triggers.removeClass('selected').eq(target).addClass('selected');
      }

      triggers.click(function() {
        if ( !$(this).hasClass('selected') ) {
          target = $(this).index();
          sliderResponse(target);
        }
      });

      $('.next').click(function() {
        target = $('.banner__wrapper-triggers span.selected').index();
        target === lastElem ? target = lastElem : target = target+1;
        sliderResponse(target);
      });

      $('.prev').click(function() {
        target = $('.banner__wrapper-triggers span.selected').index();
        lastElem = triggers.length-1;
        target === 0 ? target = 0 : target = target-1;
        sliderResponse(target);
      });
    },

    customJs: function() {
      // Back to top button
      $("#backtotop").click(function () {
       $("html, body").animate({scrollTop: 0}, 1000);
    });
    }
  };

  scope.init();

})(window, document, jQuery);
