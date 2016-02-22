(function(window, factory) {
	if( typeof define === 'function' && define.amd ){
		define(['exports', 'js/jquery-2.2.0.min', 'js/pxloader-images.min'], function(exports){
			return factory(window, exports);
		});
	} else {
		window.yuanxiao = factory(window, {});
	}
}(this, function(window, yuanxiao){
	'use strict';

	if( !(window.Zepto || window.jQuery) ){
		throw new Error('jQuery or Zepto not loaded');
	}

	var $ = window.jQuery || window.Zepto;

	// common
	var _elStyle = document.createElement('div').style;

	var _vendor = (function(){
		var transform,
			vendors = {
				"t": "",
				"webkitT": "-webkit-",
				"MozT": "-moz-",
				"msT": "-ms-",
				"OT": "-o-"
			};
		for( var key in vendors ){
			transform = key + 'ransform';
			if( transform in _elStyle ){
				return {
					attr: key,
					value: vendors[key]
				}
			}
		}
		return false;
	})();

	var _transitionEnd = (function(){
		var transEndEventNames = {
			'WebkitTransition' : 'webkitTransitionEnd',
			'MozTransition'    : 'transitionend',
			'msTransition'     : 'transitionend',
			'OTransition'      : 'oTransitionEnd otransitionend',
			'transition'       : 'transitionend'
		}
		for( var name in transEndEventNames ){
			if( name in _elStyle ) return transEndEventNames[name];
		}
	})();

	var _transform = (_vendor ? _vendor.value : '') + 'transform',
		_transition = (_vendor ? _vendor.value : '') + 'transition';

	function isObject(obj){
		return Object.prototype.toString.call(obj) === '[object Object]';
	}

	function isArray(arr){
		return Object.prototype.toString.call(arr) === '[object Array]';
	}

	function isFunction(func){
		return Object.prototype.toString.call(func) === '[object Function]';
	}

	function random(min, max){
		return Math.round(Math.random() * (max - min)) + min;
	}

	$.extend($.easing, {
		easeOutCubic: function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t + 1) + b;
		},
		easeOutQuad: function (x, t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		},
		easeOutQuart: function (x, t, b, c, d) {
			return -c * ((t=t/d-1)*t*t*t - 1) + b;
		},
		easeOutQuint: function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t*t*t + 1) + b;
		},
		easeOutExpo: function (x, t, b, c, d) {
			return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
		}
	});


	var P = 50;                 // 滚动的像素与实际距离的比率
	var MAX_DURATION = 8000;

	function getDuration(dist){
		var _dist = Math.min(MAX_DURATION, dist);
		return Math.round($.easing.easeOutQuad(null, Math.floor(_dist / 10), 10, MAX_DURATION, MAX_DURATION / 10));
	}

	// background
	function BG(options){
		this.options = options || {};

		this.yuanxiao = this.options.yuanxiao;
		this.$cont = this.yuanxiao.$cont;
		this.$bg = $('.bg');
		this.$left = this.$bg.find('.left');
		this.$right = this.$bg.find('.right');
		this.$rule = this.$bg.find('.rule');

		if( this.options.height && this.options.height > this.$cont.height() ){
			this.$bg.height(this.options.height);
		} else {
			this.$bg.height('100%');
			this.options.height = this.$bg.height();
		}

		this.showGift();

		this.showRule();
	}

	$.extend(BG.prototype, {
		showGift: function(){
			var bh = 400,                 // 礼物的间距
				bb = Math.floor(bh / 4);  // 礼物起始位置的最大值
			var n = Math.round(this.options.height / bh);

			for( var i = 2; i < n; i ++ ){
				var $giftL = this.createGift(i);
				var t = random(0, bb);
				$giftL.css('bottom', bh * i + t);
				this.$left.append($giftL);

				var $giftR = this.createGift(i);
				var t = random(bh / 2, bb * 3);
				$giftR.css('bottom', bh * i + t);
				this.$right.append($giftR);
			}
		},

		createGift: function(index){
			var $box = $('<div class="box' + random(1, 4) + '"></div>');
			var w = random(7, 10), wp = w + '0%';
			$box.width(wp);
			$box.css('left', ((10 - w) / 2 * 10) + '%');
			$box.css('padding-top', wp);
			return $box;
		},

		showRule: function(){
			for( var i = 5; i < (this.options.height / P); i += 5 ){
				this.$rule.append('<div class="num" style="left:3px;bottom:' + (i * P) + 'px;">' + i + '米</div>');
				this.$rule.append('<div class="num" style="right:3px;bottom:' + (i * P) + 'px;">米' + i + '</div>');
			}
		},

		roll: function(distance, duration, rollEnd){
			distance = distance || this.options.height - this.$cont.height();
			duration = duration || 1500;
			var css = {};
			css[_transform] = 'translateY(' + distance + 'px)';
			css[_transition] = _vendor.value + 'transform ' + duration + 'ms cubic-bezier(0, 0, 0.42, 1.0)';
			this.$bg.css(css).on(_transitionEnd, rollEnd);
		},

		reset: function(){
			var css = {};
			css[_transform] = 'translate3d(0, 0, 0)';
			css[_transition] = '';
			this.$bg.css(css).off(_transitionEnd);
		}
	});


	// ball
	function Ball(){
		this.$ball = $('.ball-cont');
		this.width = this.$ball.width();
	}

	$.extend(Ball.prototype, {
		roll: function(distance, duration, move, direction, rollEnd, bgroll, bgdist){
			var css = {}, callback;
			var timing = 'linear';
			css[_transition] = _vendor.value + 'transform ' + duration + 'ms ';
			css[_transform] = 'translateY(-' + distance + 'px)';
			if( move != 0 ){
				css[_transform] += ' translateX(' + (move * direction) + 'px)';
			}

			if( isFunction(bgroll) ){
				callback = bgroll;
			} else {
				if( isFunction(rollEnd) ){
					timing = 'cubic-bezier(0, 0, 0.42, 1.0)';
					callback = rollEnd;
				} else {
					callback = function(){};
				}
			}

			css[_transition] += timing;

			this.$ball.css(css).off(_transitionEnd).on(_transitionEnd, callback);
		},

		reset: function(){
			var css = {};
			css[_transform] = 'translate3d(0, 0, 0)';
			css[_transition] = '';
			this.$ball.css(css).off(_transitionEnd);
		}
	});


	// overlay
	function Overlay(){
		var _this = this;

		this.$overlay = $('.overlay');
		this.showState = false;
		this.tmHide = null;

		this.$overlay.on('touchmove', function(event){
			event.stopPropagation();
			event.preventDefault();
		});

		this.$overlay.on('click', function(){
			$(this).triggerHandler('hide');
		});

		this.$overlay.on('hide', function(){
			var $overlay = $(this);
			if( $overlay.is(':visible') ){
				$overlay.fadeOut(300, function() {
					$overlay.hide().find('> div').hide();
					_this.showState = false;
					if( _this.tmHide ) clearTimeout(_this.tmHide);
				});
			}
		});

		this.$overlay.find('.button > span').on('click', function(){
			if( $(this).hasClass('not-hide') ){
				return false;
			}

			_this.$overlay.triggerHandler('hide');
		});
	}

	$.extend(Overlay.prototype, {
		show: function(popup, duration, callback){
			var _this = this;

			this.$overlay.find('> div').hide();

			var $popup = $(popup);
			$popup.css('display', 'block');
			
			this.$overlay.fadeIn(300);

			this.showState = true;
			
			$popup.off('click').on('click', function(event){
				return false;
			});

			if( duration ){
				this.tmHide = setTimeout(function(){
					_this.$overlay.triggerHandler('hide');
				}, duration);
			}

			if( isFunction(callback) ){
				callback.call($popup);
			}
		}
	});


	// yuanxiao
	var bg, ball, overlay;

	var Yuanxiao = {
		log: function(msg){
			var $log = $('.log');
			if( $log.length ){
				$log.show().prepend('<p>' + msg + '</p>');
			} else {
				console.log(msg);
			}
		},

		loadImages: function(images, callback){
			if( ! isArray(images) || images.length == 0 ){
				if( isFunction(callback) ) callback();
			}

			var loader = new PxLoader();

			for( var i = 0; i < images.length; i ++ ){
				var pxImage = new PxLoaderImage(images[i]);
				pxImage.imageNumber = i + 1;
				loader.add(pxImage);
			}

			loader.addProgressListener(function(e) {
				var progress = parseInt(e.completedCount / e.totalCount * 100);
			});

			loader.addCompletionListener(function(){
				if( isFunction(callback) ) callback();
			});

			loader.start();
		},

		init: function(options){
			$(document).on('touchmove', function(event){
				event.preventDefault();
			});

			window.realDistance = null;

			options = options || {};

			var _this = this;
			var images = [].concat(options.imagesLoad || []);

			this.loadImages(images, $.proxy(function(){
				this.$cont = $('.container');
				this.options = $.extend({
					times: 9999,
					subscribe: false,
					width: this.$cont.width(),
					height: this.$cont.height()
				}, options);
				this.options.roadWidth = this.options.width;

				this.state = 0;

				bg = new BG({height: 15000, yuanxiao: this});
				ball = new Ball({yuanxiao: this});
				
				this.overlay = overlay = new Overlay();

				ball.$ball.on('click', function(){
					if( _this.options.subscribe !== true ){
						overlay.show('.qrcode', null);

						return false;
					}

					var $cover = $('.cover');
					$cover.fadeOut(500, function(){
						$cover.remove();
					});

					$('.start', this).fadeOut(500, function() {
						$(this).remove();
					});

					bg.$rule.animate({opacity: 1}, 500);
					
					setTimeout(function(){					
						overlay.show('.tips', 2500);     // 显示游戏规则提示

						_this.initTouch();

						ball.$ball.off('click');
					}, 500);
				});
			}, this));
		},

		initTouch: function(){
			var _this = this;
			var swipeTime = 400;
			var touch = {}, startTime = null, firstTouch, touchTimeout, swipeTimeout;

			function resetTouch(){
				if( touchTimeout ) clearTimeout(touchTimeout);
				startTime = null;
				touch = {};
			}
			function cancelTouch(){
				if( swipeTimeout ) clearTimeout(swipeTimeout);
				resetTouch();
			}

			$(document).on('touchstart', function(event){
				var e = event.originalEvent || event;
				startTime = Date.now();
				firstTouch = e.touches[0];
				touch.el = $('tagName' in firstTouch.target ? firstTouch.target : firstTouch.target.parentNode);
				touch.x1 = firstTouch.pageX;
				touch.y1 = firstTouch.pageY;
				touchTimeout = setTimeout(resetTouch, swipeTime + 50);
			})
			.on('touchmove', function(event){
				var e = event.originalEvent || event;
				firstTouch = e.touches[0];
				touch.x2 = firstTouch.pageX;
				touch.y2 = firstTouch.pageY;
			})
			.on('touchend', function(event){
				if( ! startTime ) return;

				var e = event.originalEvent || event;
				var duration = Date.now() - startTime;
				if( touch.x2 && touch.y2 && duration < swipeTime && (touch.y1 - touch.y2) > 30 ){
					swipeTimeout = setTimeout(function(){
						var move = touch.x1 - touch.x2,
							distance = Math.abs(touch.y1 - touch.y2),
							direction = move < 0 ? 1 : -1;
						
						roll(distance, duration, Math.abs(move), direction);

						resetTouch();
					}, 0);
				} else {
					resetTouch();
				}
			})
			.on('touchcancel', cancelTouch);

			function roll(distance, duration, move, direction){
				if( _this.state > 0 ) return;

				_this.log(distance + '|' + duration + '|' + move);
				
				var SWIPE2DISTANCE = navigator.userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? 1500 : 600;
				
				var _distance = Math.floor((distance / duration) * SWIPE2DISTANCE);
				var _duration = getDuration(_distance);
				var _move = Math.floor(Math.pow(move, 2));

				_this.log(_distance + '|' + _duration + '|' + _move);

				_this.roll(_distance, _duration, _move, direction);
			}
		},

		reset: function(){
			ball.reset();
			bg.reset();
			this.state = 0;
		},

		roll: function(distance, duration, move, direction){
			direction = direction || 1;

			var _this = this;
			var _move = move || 0;
			var maxmove = Math.floor(this.options.roadWidth / 2);
			var ballmove = _move, bgmove = 0;
			var balldist, bgdist = 0,
				balldur, bgdur = 0;

			if( _move > maxmove ){
				var r = maxmove / _move;
				distance = Math.floor(distance * r);
				duration = Math.floor(duration * r);
				_move = maxmove + 5;
			}

			if( distance < this.options.height - 100 ){
				balldist = distance;
				balldur = duration;
				if( _move > 0 ){
					ballmove = _move;
				}
			} else {
				balldist = Math.floor(this.options.height / 2);
				bgdist = distance - balldist;
				var r = (balldist / distance);
				balldur = Math.floor(duration * r * 0.88);   // 乘以的最后一个小数是因为bg滚动有渐慢效果，时长要加长，ball滚动时长就要减少
				bgdur = duration - balldur;
				ballmove = Math.floor(_move * r * 1.05);
				bgmove = _move;
			}

			window.realDistance = null;

			var rollEnd = function(){
				_this.state = 2;    // 状态设置为滚动结束
				_this.options.times --;

				var realDist = (distance + parseInt(ball.$ball.css('bottom')) + (ball.width / 2)) / P;
				realDist = Math.round(realDist * 100) / 100;

				window.realDistance = realDist;

				overlay.show('.confirm', null, function(){
					var $confirm = $(this), title = '滚了' + realDist + '米: ';

					if( realDist <= 50 ){
						title += '继续加油哦！';
					} else if( realDist > 50 && realDist <= 80 ){
						title += '不错哟！';
					} else if( realDist > 80 && realDist <= 120 ){
						title += '牛魔王呀！大奖在向你招手了！';
					} else if( realDist > 120 && realDist <= 200 ){
						title += '霸主级！';
					} else if( realDist > 200 ){
						title += '神级高手！跪拜了！';
					}

					$confirm.find('h2').text(title);

					if( _this.options.times > 0 ){
						var reset = function(){
							overlay.$overlay.off('click.reset');
							_this.reset();
						}

						overlay.$overlay.on('click.reset', reset);

						$confirm.find('.button > span.btn-reset').off('click.reset').on('click.reset', reset);

						$confirm.find('.button > span.btn-share').off('click.share').on('click.share', function(){
							overlay.$overlay.find('.share').show();
						});
					} else {
						$confirm.find('.button').hide();
					}
				});

				if( isFunction(_this.options.rollEnd) ){
					_this.options.rollEnd.call(_this, realDist);
				}
			}

			var bgroll = null;

			if( bgdist > 0 ){
				bgroll = function(){
					bg.roll(bgdist, bgdur, rollEnd);
					if( bgmove != 0 ){
						ball.roll(balldist, bgdur, _move, direction);
					}
				}
			}

			ball.roll(balldist, balldur, ballmove, direction, rollEnd, bgroll, bgdist);

			var ballani = Math.round(duration / 10),
				i = 0, prev = 0, bp = 1;

			ball.$ball.find('.ball').animate({
				"_temp": '+=' + ballani
			}, {
				step: function(now, fx){
					i ++;
					var t = Math.round(now);
					if( i % 3 == 0 ){
						if( t > prev ){
							$(fx.elem).css({"background-position": (bp == 1 ? "100%" : "0") + " 0"});
							bp = Math.abs(bp - 1);
							prev = t;
						}
					}
				},
				easing: 'easeOutQuart',
				duration: duration
			});

			this.state = 1;    // 状态设置为滚动中
			
		}
	}

	return Yuanxiao;
}));

