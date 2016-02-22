/*!
 * jwTextureSwim.js
 * 
 * Jerome "PJ" Willims
 * http://jworksstudios.com/plugins/jwtextureswim/
 *
 * A jQuery plugin that enables you to animate the x and y positions of an element background image. 
 * Why? I thought my background looked good but was a little boring.
 *
 * Feel free to remix this!
 * 
 * This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
 
 /*
 * textureSwim - Animate background texture of an element. It helps to have a seamless repeating background image.
 *
 * IN: Options:
 *       distanceX - int - Number of pixels the texture will swim (horizontally) in one cycle. Default: 500
 *                           Note: Pass a negative number to go left.
 *       distanceY - int - Number of pixels the texture will swim (vertically) in one cycle. Default: 0
 *                           Note: Pass a negative number to go up.
 *       duration  - int - Milliseconds - The amount of time it will take the texture to move "distance" pixels. Default: 5000
 *       delay     - int - Milliseconds - The time delay after each animation is complete.
 *       ease      - string - The easing function to use to animate. Default: Linear. Try passing an empty string...
 *       repeat    - int - Number of times the function should repeat. Default: -1 (Infinitely)
 *       stop      - bool - Whether or not to stop the swim. Default false.
 *                            Note: You can also just call .stop();
 *       
 * RET: Matching searched elements (for chaining).
 *
 * Basic Usage: $(".elements").textureSwim();
 * 
 */
(function ($){
  $.fn.textureSwim = function(options){
    var settings = $.extend({
      distanceX : 500,
      distanceY : 0,
      delay : 0,
	  delayAfter : 0,
      duration : 5000,
      ease : "linear", 
	  repeat : -1,
	  stop: false
    }, options);
    
	// Calculate my step-per distances...
    var sX = settings.duration != 0 ? settings.distanceX / settings.duration : 0; // Per step-time
    var sY = settings.duration != 0 ? settings.distanceY / settings.duration : 0; // Per step-time

    // My constant distance variable to help determine elapsed time.
    var dist = 1000;

    return this.each(function(){
      $(this).animate({
          // Continuous animation. Also used to calculate time. The best way I know to bypass the animate() limitations.
          "" : "+=" + dist + "px"
        },
        {
          step : function(now, fx){
            // Get the elapsed time...
            var eT = now * settings.duration / dist;
            
            // Now increment both directions.
            $(fx.elem).css({"background-position" : (sX * eT) + "px " + (sY * eT) + "px"});
          },
	  duration : settings.duration,
          easing : settings.ease, 
          complete : function(){
            // Should we do it again?
            // NOTE: This will ONLY stop if the repeat is set to 0. Anything less is inifinite.
            if(settings.repeat != 0){
              // Decrement our counter...
              settings.repeat--;
              $(this).textureSwim(settings);
            }
          }
        }
      ).delay(settings.delay);
    });
  };
}(jQuery));