/**
 * @description Show custom menu on click
 * @param pName => Name of server process
 * @param pData => Object containing data to send to the server 
 * @example pData = {
 *              x01: triggeringElement$.attr('data-object-name'),
 *              x02: triggeringElement$.attr('data-object-type')
 *          }
 */
(function ($) {

    console.log('Init custom Menu');
    "use strict";
    let l_rowSelectedClass = 'rowSelected',
        l_reportShowCheckbox = 'js-showCheckbox',
        l_checkbox_sel = '.rowSelector',
        l_actionMenuTrigger_sel = '.actionMenu--trigger',
        l_actionMenu_sel = '.actionMenu';

    // Put this HTML Expression into the Column Formatting section
    let menu$ = $("<div id='actionsMenu'></div>");
    $("body").append(menu$);

    //get the items and generate the menu content
    menu$.menu({
        asyncFetchMenu: function (menu, callback) {
            let triggeringElement$ = $(this.currentTarget);
            //console.log(triggeringElement);
            //console.log(triggeringElement.attr('data-object-name'));
            let promise = apex.server.process("LOAD_MENU", {
                x01: triggeringElement$.attr('data-object-name'),
                x02: triggeringElement$.attr('data-object-type')
            });

            promise.done(function (data) {
                // use data to populate menu.items
                menu.items = data.items;

                callback();
            });
        }
    });

    // toggle the active state and show the menu
    $(l_actionMenuTrigger_sel).on('click', function (event) {
        let target$,
            pos;

        // set active
        $(this).addClass('is-active');

        target$ = $(event.target);
        pos = target$.offset();

        //show the menu according to where it was called from
        menu$.menu("toggle", pos.left, pos.top + target$.outerHeight());
    });

    //remove the active state when menu closes
    menu$.on("menuafterclose", function (event, ui) {
        $('.example-3 .is-active').removeClass('is-active');
    });

})(apex.jQuery);