// Mobile menu
$('.toggle').click(function(){
if($('.slided-it').size()==0){
  $('.slide-x').addClass('slided-it');
  $('#body-wrapper').removeClass('body-wrapper-default').addClass('body-wrapper-lock');
}else{
  $('.slide-x').removeClass('slided-it');
  $('#body-wrapper').removeClass('body-wrapper-lock').addClass('body-wrapper-default');
}
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

$(document).ready(function() {
  if ($('#nav-main-menu').length === 0) {
    return;
  }

  var main_menuitems = $('#nav-main-menu [tabindex="0"]');
  var prev_li, prev_li_lv2, new_li, new_li_lv2, focused_item;
  $('#nav-main > .has-submenus > li > .submenu.has-submenus > li').bind('mouseover focusin', function(event) {
    new_li_lv2 = $(this);
    if (!prev_li_lv2 || prev_li_lv2.attr('id') !== new_li_lv2.attr('id')) {
      // Open the menu
      new_li_lv2.addClass('hover').find('[aria-expanded="false"]').attr('aria-expanded', 'true');
      if (prev_li_lv2) {
        // Close the last selected menu 
        prev_li_lv2.dequeue('sub');
      }
    } else {
      prev_li_lv2.clearQueue('sub');
    }
  }).bind('mouseout focusout', function(event) {
    prev_li_lv2 = $(this);
	var e = event.toElement || event.relatedTarget;
	e = e ? e.parentNode.parentNode : e;
    prev_li_lv2.delay(100, 'sub').queue('sub', function() {
    	//do nothing when mouseout triggered via submenu

      if (prev_li_lv2 && (event.type == 'focusout' || e == this.parentNode)) {
        prev_li_lv2.clearQueue('sub');
        // Close the menu
        prev_li_lv2.removeClass('hover').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
        prev_li_lv2 = null;
        if (focused_item) {
          focused_item.get(0).blur();
        }
      }
    }).dequeue('sub');
  });

  $('#nav-main > .has-submenus > li').bind('mouseover focusin', function(event) {
    new_li = $(this);
    if (!prev_li || prev_li.attr('id') !== new_li.attr('id')) {
      // Open the menu
      new_li.addClass('hover').find('[aria-expanded="false"]').attr('aria-expanded', 'true');
      if (prev_li) {
        // Close the last selected menu 
        prev_li.dequeue();
      }
    } else {
      prev_li.clearQueue();
    }
  }).bind('mouseout focusout', function(event) {
    prev_li = $(this);
    prev_li.delay(100).queue(function() {
      if (prev_li) {
        prev_li.clearQueue();
        // Close the menu
        prev_li.find('.hover').removeClass('hover');
        prev_li.removeClass('hover').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
        prev_li = null;
        prev_li_lv2 = null;
        if (focused_item) {
          focused_item.get(0).blur();
        }
      }
    });
  }).each(function(menu_idx) {
    var menuitems = $(this).find('a');

    menuitems.mouseover(function(event) {
      this.focus(); // Sometimes $(this).focus() doesn"t work
    }).focus(function() {
      focused_item = $(this);
    }).each(function(item_idx) {
      // Enable keyboard navigation
      $(this).keydown(function(event) {
        var target;
        if(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
          return true;
        }
        switch (event.keyCode) {
          case 33: // Page Up
          case 36: // Home
            target = menuitems.first();
            break;
          case 34: // Page Down
          case 35: // End
            target = menuitems.last();
            break;
          case 38: // Up
            target = (item_idx > 0) ? menuitems.eq(item_idx - 1)
                                    : menuitems.last();
            break;
          case 40: // Down
            target = (item_idx < menuitems.length - 1) ? menuitems.eq(item_idx + 1)
                                                       : menuitems.first();
            break;
          case 37: // Left
            target = (menu_idx > 0) ? main_menuitems.eq(menu_idx - 1)
                                    : main_menuitems.last();
            break;
          case 39: // Right
            target = (menu_idx < main_menuitems.length - 1) ? main_menuitems.eq(menu_idx + 1)
                                                            : main_menuitems.first();
            break;
        }
        if (target) {
          target.get(0).focus(); // Sometimes target.focus() doesn't work
          return false;
        }
        return true;
      });
    });
  });

  // With JavaScript enabled, we can provide a full navigation with #nav-main.
  // Now "hide" the duplicated #footer-menu from AT.
  $('#footer-menu').attr('role', 'presentation');
  
});
