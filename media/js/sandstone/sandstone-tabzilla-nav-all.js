/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {

// If there's no nav-main element, don't initialize the menu.
if ($('#nav-main').length === 0) {
    return;
}

var NavMain = {};

/**
 * Whether or not MS Internet Explorer version 4, 5, 6, 7 or 8 is used
 *
 * If true, the small mode is never triggered.
 *
 * @var Boolean
 */
NavMain.isMSIEpre9 = (function() {
    return (/MSIE\ (4|5|6|7|8)/.test(navigator.userAgent));
})();

/**
 * Whether or not the main nav is in small mode
 *
 * @var Boolean
 */
NavMain.smallMode = false;

/**
 * Whether or not the main menu is opened in small mode
 *
 * @var Boolean
 */
NavMain.smallMenuOpen = false;

/**
 * Jquery object representing the currently opened sub-menu
 * in small-mode
 *
 * @var jQuery
 */
NavMain.currentSmallSubmenu = null;

/**
 * Jquery object representing the previously focused main menu item
 *
 * @var jQuery
 */
NavMain.previousMenuItem = null;

/**
 * Jquery object representing the currently focused sub-menu item
 *
 * @var jQuery
 */
NavMain.currentSubmenuItem = null;

/**
 * Main menu items in the menubar
 *
 * @var jQuery
 */
NavMain.mainMenuItems = null;

/**
 * Main menu items in the menubar
 *
 * @var jQuery
 */
NavMain.mainMenuLinks = null;

NavMain.init = function()
{
    NavMain.mainMenuItems = $('#nav-main .has-submenus > li');
    NavMain.mainMenuLinks = $('#nav-main ul > li > [tabindex="0"]');

    NavMain.mainMenuItems
        .bind('mouseover focusin', NavMain.handleFocusIn)
        .bind('mouseout focusout', NavMain.handleFocusOut)
        .each(NavMain.initSubmenu);

    if (!NavMain.isMSIEpre9) {
        $(window).resize(NavMain.handleResize);
        NavMain.handleResize();
    }

    // set up small-mode menu toggle button
    $('#nav-main .toggle')
        .click(function(e) {
            e.preventDefault();
            NavMain.toggleSmallMenu();
        })
        .keydown(function(e) {
            if (e.keyCode == 13 || e.keyCode == 32) {
                e.preventDefault();
                NavMain.toggleSmallMenu();
            }
        });

    // On touch-enabled devices, hijack the click event and just make it focus
    // the item. This prevents flashing menus on iOS and prevents clicking on
    // a top-level item causing navigation on Android.
    if ('ontouchstart' in window) {
        NavMain.mainMenuLinks.click(function(e) {
            e.preventDefault();
            this.focus();
        });
    }

    // With JavaScript enabled, we can provide a full navigation with
    // #nav-main. Now "hide" the duplicated #footer-menu from AT.
    $('#footer-menu').attr('role', 'presentation');
};

NavMain.handleFocusIn = function(e)
{
    var item = $(this);

    if (NavMain.previousMenuItem) {
        if (NavMain.previousMenuItem.attr('id') !== item.attr('id')) {
            // Close the last selected menu
            NavMain.previousMenuItem.dequeue();
        } else {
            NavMain.previousMenuItem.clearQueue();
        }
    }

    // Open the menu
    item
        .addClass('hover')
        .find('[aria-expanded="false"]')
        .attr('aria-expanded', 'true');
};

NavMain.handleFocusOut = function(e)
{
    NavMain.previousMenuItem = $(this);
    NavMain.previousMenuItem
        .delay(100)
        .queue(function() {
            if (NavMain.previousMenuItem) {
                // Close the menu
                NavMain.previousMenuItem
                    .clearQueue()
                    .removeClass('hover')
                    .find('[aria-expanded="true"]')
                    .attr('aria-expanded', 'false');

                NavMain.previousMenuItem = null;

                // If there was a focused sub-menu item, blur it
                if (NavMain.currentSubmenuItem) {
                    NavMain.currentSubmenuItem.get(0).blur();
                }
            }
        });
};

NavMain.initSubmenu = function(menu_idx)
{
    var menuItems = $(this).find('a');

    menuItems.mouseover(function(e) {
        this.focus(); // Sometimes $(this).focus() doesn't work
    }).focus(function() {
        NavMain.currentSubmenuItem = $(this);
    }).each(function(item_idx) {
        $(this).keydown(function(e) {
            var target;
            switch (e.keyCode) {
                case 33: // Page Up
                case 36: // Home
                    target = menuItems.first();
                    break;

                case 34: // Page Down
                case 35: // End
                    target = menuItems.last();
                    break;

                case 38: // Up
                    target = (item_idx > 0)
                        ? menuItems.eq(item_idx - 1)
                        : menuItems.last();

                    break;

                case 40: // Down
                    target = (item_idx < menuItems.length - 1)
                        ? menuItems.eq(item_idx + 1)
                        : menuItems.first();

                    break;

                case 37: // Left
                    target = (menu_idx > 0)
                        ? NavMain.mainMenuLinks.eq(menu_idx - 1)
                        : NavMain.mainMenuLinks.last();

                    break;

                case 39: // Right
                    target = (menu_idx < NavMain.mainMenuLinks.length - 1)
                        ? NavMain.mainMenuLinks.eq(menu_idx + 1)
                        : NavMain.mainMenuLinks.first();

                    break;
            }
            if (target) {
                target.get(0).focus(); // Sometimes target.focus() doesn't work
                return false;
            }
            return true;
        });
    });
};

NavMain.handleResize = function()
{
    var width = $(window).width();

    if (width <= 760 && !NavMain.smallMode) {
        NavMain.enterSmallMode();
    }

    if (width > 760 && NavMain.smallMode) {
        NavMain.leaveSmallMode();
    }
};

NavMain.enterSmallMode = function()
{
    NavMain.unlinkMainMenuItems();

    $('#nav-main-menu')
	.css('display', 'none')
	.attr('aria-hidden');

    $(document).click(NavMain.handleDocumentClick);
    $('a, input, textarea, button, :focus')
        .focus(NavMain.handleDocumentFocus);

    $('#nav-main-menu, #nav-main-menu .submenu')
	.attr('aria-hidden', 'true');

    // remove submenu click handler and CSS class
    NavMain.mainMenuLinks
	.addClass('submenu-item')
	.unbind('click', NavMain.handleSubmenuClick);

    // add click handler to menu links to hide menu
    NavMain.linkMenuHideOnClick();

    NavMain.smallMode = true;
};

NavMain.leaveSmallMode = function()
{
    NavMain.relinkMainMenuLinks();

    $('#nav-main-menu')
	.css('display', '')
	.removeAttr('aria-hidden');

    $(document).unbind('click', NavMain.handleDocumentClick);
    $('a, input, textarea, button, :focus')
        .unbind('focus', NavMain.handleDocumentFocus);

    $('#nav-main .toggle').removeClass('open');

    // reset submenus
    $('#nav-main-menu > li > .submenu')
	.stop(true)
	.css(
	    {
		'left'         : '',
		'top'          : '',
		'display'      : '',
		'opacity'      : '',
		'height'       : '',
		'marginTop'    : '',
		'marginBottom' : ''
	    }
	)
	.attr('aria-expanded', 'false');

    // remove click handler from menu links that hide menu
    NavMain.unlinkMenuHideOnClick();

    NavMain.currentSmallSubmenu = null;
    NavMain.smallMode = false;
    NavMain.smallMenuOpen = false;
};

/**
 * Causes smallMode menu to close when clicking on a menu/submenu link
 *
 * Allows closing of smallMode menu when navigating in-page
 */
NavMain.linkMenuHideOnClick = function() {
    if (NavMain.mainMenuItems.length === 0) {
        $('#nav-main-menu > li > a').on('click.smallmode', function(e) {
            NavMain.closeSmallMenu();
        });
    } else {
        $('.submenu > li > a').on('click.smallmode', function(e) {
            NavMain.closeSmallMenu();
        });
    }
};

/**
 * Remove smallMode menu closing when clicking menu/submenu link
 */
NavMain.unlinkMenuHideOnClick = function() {
    if (NavMain.mainMenuItems.length === 0) {
        $('#nav-main-menu > li > a').off('click.smallmode');
    } else {
        $('.submenu > li > a').of('click.smallmode');
    }
};

/**
 * Removes the href attribute from menu items with submenus
 *
 * This prevents load bar from appearing on iOS when you press
 * an item.
 */
NavMain.unlinkMainMenuItems = function()
{
    NavMain.mainMenuLinks.each(function(i, n) {
        var node = $(n);
        if (node.siblings('.submenu')) {
            node.attr('data-old-href', node.attr('href'));
            node.removeAttr('href');
        }
    });
};

/**
 * Returns the href attribute back to main menu links
 */
NavMain.relinkMainMenuLinks = function()
{
    NavMain.mainMenuLinks.each(function(i, n) {
        var node = $(n);
        if (node.attr('data-old-href')) {
            node.attr('href', node.attr('data-old-href'));
            node.removeAttr('data-old-href');
        }
    });
};

NavMain.handleDocumentClick = function(e)
{
    if (NavMain.smallMode) {
        var $clicked = $(e.target);
        if (!$clicked.parents().is('#nav-main')) {
            NavMain.closeSmallMenu();
        }
    }
};

NavMain.handleDocumentFocus = function(e)
{
    var $focused = $(e.target);
    if (!$focused.parents().is('#nav-main')) {
        NavMain.closeSmallMenu();
    }
};

NavMain.handleToggleKeypress = function(e)
{
    if (e.keyCode == 13) {
        NavMain.toggleSmallMenu();
    }
};

NavMain.toggleSmallMenu = function()
{
    if (NavMain.smallMenuOpen) {
        NavMain.closeSmallMenu();
    } else {
        NavMain.openSmallMenu();
    }
};

NavMain.openSmallMenu = function()
{
    if (NavMain.smallMenuOpen) {
        return;
    }

    $('#nav-main-menu')
        .slideDown(150)
        .removeAttr('aria-hidden');

    $('#nav-main .toggle').addClass('open');

    // add click handler and set submenu class on submenus
    NavMain.mainMenuLinks
        .addClass('submenu-item')
        .click(NavMain.handleSubmenuClick);

    // focus first item
    $('#nav-main-menu [tabindex=0]').get(0).focus();

    NavMain.smallMenuOpen = true;
};

NavMain.closeSmallMenu = function()
{
    if (!NavMain.smallMenuOpen) {
        return;
    }

    $('#nav-main-menu, #nav-main-menu .submenu')
        .slideUp(100)
        .attr('aria-hidden', 'true');

    $('#nav-main .toggle').removeClass('open');

    // remove submenu click handler and CSS class
    NavMain.mainMenuLinks
        .addClass('submenu-item')
        .unbind('click', NavMain.handleSubmenuClick);

    if (NavMain.currentSmallSubmenu) {
        NavMain.closeSmallSubmenu(NavMain.currentSmallSubmenu);
    }
    NavMain.currentSmallSubmenu = null;

    NavMain.smallMenuOpen = false;
};

NavMain.handleSubmenuClick = function(e)
{
    e.preventDefault();
    var menu = $(this).siblings('.submenu');
    NavMain.openSmallSubmenu(menu);
};

NavMain.openSmallSubmenu = function(menu)
{
    // close previous menu
    if ( NavMain.currentSmallSubmenu
        && NavMain.currentSmallSubmenu.get(0).id !== menu.get(0).id) {
        NavMain.closeSmallSubmenu(NavMain.currentSmallSubmenu);
    }

    // skip current menu
    if ( NavMain.currentSmallSubmenu
        && NavMain.currentSmallSubmenu.get(0).id === menu.get(0).id) {
        // still focus first item
        menu.find('a').get(0).focus();
        return;
    }

    menu
        .stop(true)
        .css(
            {
                'left'         : '80px',
                'top'          : 'auto',
                'display'      : 'none',
                'opacity'      : '1',
                'height'       : 'auto',
                'marginTop'    : '-8px',
                'marginBottom' : '0'
            }
        )
        .slideDown(150)
        .attr('aria-expanded', 'true');

    // focus first item
    menu.find('a').get(0).focus();

    NavMain.currentSmallSubmenu = menu;
};

NavMain.closeSmallSubmenu = function(menu)
{
    menu
        .stop(true)
        .fadeOut(100, function() {
        menu
	    .css(
		{
		    'left'         : '',
		    'top'          : '',
		    'display'      : '',
		    'opacity'      : '',
		    'height'       : '',
		    'marginTop'    : '',
		    'marginBottom' : ''
		}
	    )
            .attr('aria-expanded', 'false');
    });
};

/* monkey patch for disabling submeny */
NavMain.handleSubmenuClick = function(e)
{
    window.location = $(this).attr('data-old-href');
};

$(document).ready(NavMain.init);

})();
/**
 * Tabzilla global navigation for Mozilla projects
 *
 * This code is licensed under the Mozilla Public License 1.1.
 *
 * Portions adapted from the jQuery Easing plugin written by Robert Penner and
 * used under the following license:
 *
 *   Copyright 2001 Robert Penner
 *   All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions are
 *   met:
 *
 *   - Redistributions of source code must retain the above copyright notice,
 *     this list of conditions and the following disclaimer.
 *   - Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *   - Neither the name of the author nor the names of contributors may be
 *     used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 *   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 *   TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *   PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *   Media query matchMedia polyfill implementation from Paul Irish
 *   (https://github.com/paulirish/matchMedia.js/) used under the following
 *   license (MIT):
 *
 *   Copyright (c) 2012 Scott Jehl
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to
 *   deal in the Software without restriction, including without limitation the
 *   rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 *   sell copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 *   THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *   DEALINGS IN THE SOFTWARE.
 *
 *
 * @copyright 2012-2013 silverorange Inc.
 * @license   http://www.mozilla.org/MPL/MPL-1.1.html Mozilla Public License 1.1
 * @author    Michael Gauthier <mike@silverorange.com>
 * @author    Steven Garrity <steven@silverorange.com>
 * @author    Isac Lagerblad <icaaaq@gmail.com>
 */

var Tabzilla = (function (Tabzilla) {
    'use strict';
    var minimumJQuery = '1.7.1';
    var panel;
    var nav;
    var headlines;
    var tab;
    var opened = false;
    var hasMediaQueries = ('matchMedia' in window);
    var isIE9 = (document.documentMode === 9);
    var hasConsole = (typeof console == "object");
    var mode = 'wide';
    var negativeTabIndex = '-1';
    var $ = null; // non-version-conflicting jQuery alias for tabzilla
    var jQuery;
    var checkMode = function () {
        var currentMode = getMode();
        if (mode !== currentMode) {
            mode = currentMode;
            setMode();
        }
    };
    var getMode = function() {
        if (hasMediaQueries && matchMedia('(max-width: 719px)').matches) {
            return 'compact';
        }
        return 'wide';
    };
    var setMode = function () {
        if (mode === 'wide') {
            leaveCompactMode();
        } else {
            enterCompactMode();
        }
    };
    var leaveCompactMode = function () {
        removeCompactModeAttributes();
        removeCompactModeEvents();
        panel.focus();
    };
    var enterCompactMode = function () {
        addCompactModeAttributes();
        addCompactModeEvents();
    };
    var addCompactModeAttributes = function () {
        nav.find('>ul').attr('role', 'presentation');

        headlines.each(function (i) {
            $(this).attr({
                'id': 'tab-' + i,
                'aria-controls': 'panel-' + i,
                'tabindex': negativeTabIndex,
                'role': 'tab',
                'aria-expanded': false
            });
        });
        if (!nav.find('h2[tabindex=0]').length) {
            nav.find('h2:first').attr('tabindex', 0);
        }
        nav.find('div').each(function (i) {
            $(this).attr({
                'id': 'panel-' + i,
                'aria-labeledby': 'tab-' + i,
                'role': 'tabpanel'
            }).css('display','none');
        });
    };
    var removeCompactModeAttributes = function () {
        nav.find('>ul').removeAttr('role');
        headlines.removeAttr('id aria-controls tabindex role aria-expanded');
        nav.find('div').removeAttr('id aria-labeledby role style');
    };
    var addCompactModeEvents = function () {
        nav.on('click.submenu', 'h2', function (event) {
            event.preventDefault();
            var div = $(event.target).next('div');
            $(event.target).attr('aria-expanded', div.is(':hidden'));
            div.toggle();
        });
        nav.on('keydown.submenu', function (event) {
            var which = event.which;
            var target = $(event.target);
            // enter or space
            if (which === 13 || which === 32) {
                event.preventDefault();
                target.trigger('click');
            }
            // up or left
            if (which === 37 || which === 38) {
                event.preventDefault();
                headlines.each(function (i) {
                    if (i > 0 && $(this).attr('tabindex') === 0) {
                        $(this).attr('tabindex', negativeTabIndex);
                        $(headlines[i - 1]).attr('tabindex', 0).focus();
                        return false;
                    }
                });
            }
            // down or right
            if (which === 40 || which === 39) {
                event.preventDefault();
                headlines.each(function (i) {
                    if (i < (headlines.length - 1) && $(this).attr('tabindex') === 0) {
                        $(this).attr('tabindex', negativeTabIndex);
                        $(headlines[i + 1]).attr('tabindex', 0).focus();
                        return false;
                    }
                });
            }
            // esc
            if (which === 27 && target.is('a')) {
                event.preventDefault();
                event.stopPropagation();
                target.parents('div').prev('h2').trigger('click').focus();
            }
        });
    };
    var removeCompactModeEvents = function () {
        nav.off('.submenu');
    };
    Tabzilla.open = function () {
        opened = true;
        panel.toggleClass('open');
        var height = $('#tabzilla-contents').height();
        panel.animate({'height': height}, 200, function () {
            panel.css('height', 'auto');
        });
        tab
            .attr({'aria-expanded' : 'true'})
            .addClass('tabzilla-opened')
            .removeClass('tabzilla-closed');

        panel.focus();
        return panel;
    };
    Tabzilla.close = function () {
        opened = false;
        panel.animate({height: 0}, 200, function () {
            panel.toggleClass('open');
        });

        tab
            .attr({'aria-expanded' : 'false'})
            .addClass('tabzilla-closed')
            .removeClass('tabzilla-opened');
        return tab;
    };

    // Old public functions that needs to work for a while.
    Tabzilla.opened = function () {
        if (hasConsole) {
            console.warn("This call is soon going to be deprecated, please replace it with Tabzilla.open() instead.");
        }
        return Tabzilla.open();
    };
    Tabzilla.closed = function () {
        if (hasConsole) {
            console.warn("This call is soon going to be deprecated, please replace it with Tabzilla.close() instead.");
        }
        return Tabzilla.close();
    };

    var addEaseInOut = function () {
        $.extend($.easing, {
            'easeInOut':  function (x, t, b, c, d) {
                if (( t /= d / 2) < 1) {
                    return c / 2 * t * t + b;
                }
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            }
        });
    };
    var addMatchMediaPolyfill = function () {
        window.matchMedia = window.matchMedia || (function( doc, undefined ) {
            var bool;
            var docElem = doc.documentElement;
            var refNode = docElem.firstElementChild || docElem.firstChild;
            // fakeBody required for <FF4 when executed in <head>
            var fakeBody = doc.createElement( "body" );
            var div = doc.createElement( "div" );

            div.id = "mq-test-1";
            div.style.cssText = "position:absolute;top:-100em";
            fakeBody.style.background = "none";
            fakeBody.appendChild(div);

            return function(q){
                div.innerHTML = "&shy;<style media=\"" + q + "\"> #mq-test-1 { width: 42px; }</style>";
                docElem.insertBefore( fakeBody, refNode );
                bool = div.offsetWidth === 42;
                docElem.removeChild( fakeBody );
                return {
                    matches: bool,
                    media: q
                };
            };
        }( document ));
    };
    var init = function () {
        if (0 == $('#tabzilla-panel').length) {
            $('body').prepend(content);
        }
        tab = $('#tabzilla');
        panel = $('#tabzilla-panel');
        nav = $('#tabzilla-nav');
        headlines = nav.find('h2');

        if (isIE9 && !hasMediaQueries) {
            addMatchMediaPolyfill();
            hasMediaQueries = true;
        }

        addEaseInOut();

        checkMode();
        $(window).on('resize', function () {
            checkMode();
        });

        panel.on('keydown', function (event) {
            if (event.which === 27) {
                event.preventDefault();
                close();
            }
        });

        tab.attr('aria-label', 'Mozilla links');

        tab.on('click', function (event) {
            event.preventDefault();
            if (opened) {
                Tabzilla.close();
            } else {
                Tabzilla.open();
            }
        });
    };
    var loadJQuery = function (callback) {
        var noConflictCallback = function() {
            // set non-conflicting version local aliases
            jQuery = window.jQuery.noConflict(true);
            $ = jQuery;
            callback.call();
        };
        var script = document.createElement("script");
        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    script.onreadystatechange = null;
                    noConflictCallback.call();
                }
            };
        } else {
            script.onload = noConflictCallback;
        }
        script.src = '//mozorg.cdn.mozilla.net/media/js/libs/jquery-' + minimumJQuery + '.min.js';
        document.getElementsByTagName('head')[0].appendChild(script);
    };
    var compareVersion = function (a, b) {
        a = ('' + a).split('.');
        b = ('' + b).split('.');
        while (a.length < b.length) { a.push('0'); }
        while (b.length < a.length) { b.push('0'); }
        for (var i = 0; i < a.length; i++) {
            if (a[i] > b[i]) { return 1; }
            if (a[i] < b[i]) { return -1; }
        }
        return 0;
    };
    (function () {
        if (window.jQuery !== undefined &&
            compareVersion(window.jQuery.fn.jquery, minimumJQuery) !== -1
        ) {
            // set up local jQuery aliases
            jQuery = window.jQuery;
            $ = jQuery;
            $(document).ready(init);
        } else {
            // no jQuery or older than minimum required jQuery
            loadJQuery(init);
        }
    })();

    var content = '<div id="tabzilla-panel" class="close-nav" tabindex="-1">\
  <div id="tabzilla-contents">\
    <div id="tabzilla-promo">\
      <div id="tabzilla-promo-ff-android" class="snippet"> <!--ex: promo-firefox, promo-MWC, promo-flicks -->\
        <a href="https://play.google.com/store/apps/details?id=org.mozilla.firefox">\
          <h4>Firefox for Android</h4>\
\
          <p>我會說中文了！</p>\
        </a>\
      </div>\
      <!-- end of promo-name -->\
    </div>\
    <!-- end of tabzilla-promo -->\
    <div id="tabzilla-nav">\
      <ul>\
        <li class="sitemap">\
          <h2>Firefox</h2>\
          <div>\
            <ul>\
              <li>\
                <a href="//mozilla.com.tw/firefox/features/" title="下載 Mozilla Firefox 中文桌面版">Firefox 桌面版</a>\
              </li>\
              <li>\
                <a href="//mozilla.com.tw/firefox/mobile/" title="Mozilla Firefox 行動版">Firefox 行動版</a>\
              </li>\
              <li>\
                <a href="//mozilla.com.tw/firefox/channel/" title="Mozilla Firefox 未來發行版">Firefox 未來發行版</a>\
              </li>\
              <li>\
                <a href="//mozilla.com.tw/firefoxos/" title="Firefox 行動作業系統">Firefox OS</a>\
              </li>\
              <li>\
                <a href="https://addons.mozilla.org/zh-TW/firefox/" title="Firefox 附加元件">附加元件</a>\
              </li>\
              <li>\
                <a href="https://support.mozilla.com/zh-TW/home" title="Firefox 說明文件、支援中心">支援中心</a>\
              </li>\
            </ul>\
          </div>\
        </li>\
        <li class="sitemap">\
          <h2>社群參與</h2>\
          <div>\
            <ul>\
              <li>\
                <a href="http://firefox.club.tw/" title="Firefox 活力軍">Firefox 活力軍</a>\
              </li>\
              <li>\
                <a href="//mozilla.com.tw/community/student/" title="校園大使">校園大使</a>\
              </li>\
              <li>\
                <a href="//mozilla.com.tw/community/contribute/" title="社群專案">社群專案</a>\
              </li>\
            </ul>\
          </div>\
        </li>\
        <li class="sitemap">\
          <h2>訊息中心</h2>\
          <div>\
            <ul>\
              <li>\
                <a href="//blog.mozilla.com.tw/main" title="部落格">部落格</a>\
              </li>\
              <li>\
                <a href="//mozilla.com.tw/news/press/" title="Mozilla 新聞">Mozilla 新聞</a>\
              </li>\
              <li>\
                <a href="//blog.mozilla.com.tw/events-list" title="活動訊息">活動訊息</a>\
              </li>\
              <li>\
                <a href="//tech.mozilla.com.tw/" title="謀智台客">謀智台客</a>\
              </li>\
            </ul>\
          </div>\
        </li>\
        <li class="sitemap">\
          <h2>關於我們</h2>\
          <div>\
            <ul>\
              <li>\
                <a href="//mozilla.com.tw/about/manifesto/" title="Mozilla 宣言">Mozilla 宣言</a>\
              </li>\
              <li>\
                <a href="//mozilla.com.tw/about/space/" title="Mozilla Space">Mozilla Space</a>\
              </li>\
              <li>\
                <a href="//mozilla.com.tw/about/careers/" title="工作機會">工作機會</a>\
              </li>\
              <li>\
                <a href="//mozilla.com.tw/about/contact/" title="聯絡資訊">聯絡資訊</a>\
              </li>\
              <li>\
                <a href="//mozilla.org/en-US/" title="Mozilla (US)">Mozilla (US)</a>\
              </li>\
            </ul>\
          </div>\
        </li>\
        <!-- end of sitemap -->\
      </ul>\
    </div>\
    <!-- end of tabzilla-nav -->\
  </div>\
  <!-- end of tabzilla-content -->\
</div>\
<!-- end of tabzilla-panel -->';
    return Tabzilla;
})(Tabzilla || {});