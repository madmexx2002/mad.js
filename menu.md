# menu.js

Create a dynamic popup menu for reports.

Create a Page Process (Ajax Callback)

```plsql
begin

  apex_json.open_object;
  apex_json.open_array('items');

      --edit item
      apex_json.open_object;
      apex_json.write('type',   'action');
      apex_json.write('icon',   'fa fa-edit');
      apex_json.write('label',  'Edit ' || apex_application.g_x01);
      apex_json.write('href',   apex_util.prepare_url('f?p=&APP_ID.:1101:' || :APP_SESSION || ':::1101:P1101_EMPNO:' || apex_application.g_x01));
      apex_json.close_object;

      --copy item
      apex_json.open_object;
      apex_json.write('type',   'action');
      apex_json.write('icon',   'fa fa-clone');
      apex_json.write('label',  'Copy');
      apex_json.write('href',   'javascript: void(0);');
      apex_json.close_object;

      --print item
      apex_json.open_object;
      apex_json.write('type',   'action');
      apex_json.write('icon',   'fa fa-print');
      apex_json.write('label',  'Print');
      apex_json.write('href',   'javascript: void(0);');
      apex_json.close_object;

      --delete item
      apex_json.open_object;
      apex_json.write('type',   'action');
      apex_json.write('icon',   'fa fa-trash-o');
      apex_json.write('label',  'Delete ' || apex_application.g_x02);
      apex_json.write('href',   'javascript: apex.page.confirm( "Are you sure you want to delete ' || apex_application.g_x02 || '?", ''DELETE_' ||apex_application.g_x02 || ''' );');
      apex_json.close_object;

  apex_json.close_array;
  apex_json.close_object;
exception when others then
    apex_json.open_object;
    apex_json.write('error', 'Unable to render menu. ' + sqlerrm);
    apex_json.close_all;    
end;
```

Import or create menu.js and change process name and process data to your own requirement

```javascript
(function ($) {
    "use strict";
    let l_actionMenuTrigger_sel = '.actionMenu--trigger'
    
    // Put this HTML Expression into the Column Formatting section
    let menu$ = $("<div id='actionsMenu'></div>");
    $("body").append(menu$);

    //get the items and generate the menu content
    menu$.menu({
        asyncFetchMenu: function (menu, callback) {
            let triggeringElement$ = $(this.currentTarget);

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
```

Then create a HTML Expression in report column like with one ore more data attributes

```html
<a href="javascript: void(0);" class="showRowHover actionMenu--trigger" data-object-name="#OBJECT_NAME#" data-object-type="#OBJECT_TYPE#" title="Action Menu"><span class="fa fa-ellipsis-h" aria-hidden="true"></span></a><div class="actionMenu"></div>
```

Last step. Put some CSS into the page and set class my-report on report

```css
.my-report .rowSelector, .my-report .showRowHover {
  opacity: 0;
  transition: .2s all; 
}

.my-report .js-showCheckbox .rowSelector, .my-report .rowSelector:checked {
  opacity: 1; 
}

.my-report tr:hover .showRowHover {
  opacity: 1; 
}

.my-report tr.rowSelected .t-Report-cell {
  background-color: #f3e1b7;
}

.my-report tbody tr {
  transition: .2s all;
  outline: 1px solid rgba(220, 170, 53, 0); 
}
.my-report tbody tr:hover {
    outline: 1px solid #dcaa35; 
}

.my-report .actionMenu--trigger.is-active {
  opacity: 1; 
}
```

