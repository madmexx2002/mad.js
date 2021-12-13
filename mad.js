/**
 * @namespace mad
 * @author Mark Lenzer
 * @version 1.2
 **/
var mad = mad || {};

/**
 * @module IR 
 * @description Functions for Interactive Reports
 */
mad.IR = {
    /**
     * @function Pagination
     * @description Init createPagination event handlers
     * @param p_InteractiveReport Interactive Report Static ID
     */
    Pagination: (p_InteractiveReport) => {
        apex.jQuery(apex.gPageContext$).on("apexreadyend", function (e) {
            console.info('ApexReadyEnd');
            mad.IR.createPagination(p_InteractiveReport);
        });

        apex.jQuery("#" + p_InteractiveReport).on("apexafterrefresh", function () {
            console.info('apexafterrefresh');
            mad.IR.createPagination(p_InteractiveReport);
        });
    },

    /**
     * @function createPagination
     * @description  Create Buttons for pagination in the menubar for Interactive Report
     * @param p_InteractiveReport Interactive Report Static ID
     */
    createPagination: (p_InteractiveReport) => {
        console.info('createPagination');

        /* Place where the buttons will be created .a-IRR-buttons */
        let temp_target = '.a-IRR-actions';
        /* New Buttons */
        let temp_Button_prev = '<button class="t-Button t-Button--noLabel t-Button--icon t-Button--padLeft" onclick="void(0);" type="button" id="ir_btn_prev" title="Previous Page" aria-label="Previous Page"><span class="t-Icon fa fa-chevron-left" aria-hidden="true"></span></button>';
        let temp_Button_next = '<button class="t-Button t-Button--noLabel t-Button--icon" onclick="void(0);" type="button" id="ir_btn_next" title="Next Page" aria-label="Next Page"><span class="t-Icon fa fa-chevron-right" aria-hidden="true"></span></button>';
        /* Pagination Buttons */
        let IR_Pagination_Next = '[aria-controls="' + p_InteractiveReport + '"][title="Next"],[aria-controls="' + p_InteractiveReport + '"][title="Weiter"]';
        let IR_Pagination_Prev = '[aria-controls="' + p_InteractiveReport + '"][title="Previous"],[aria-controls="' + p_InteractiveReport + '"][title="Zurück"]';

        // Append Previous Button to dom
        $('#' + p_InteractiveReport + ' ' + temp_target).append(temp_Button_prev)

        // Add Click Handler
        $('#ir_btn_prev').bind('click', function () {
            console.info('Button Previous');
            $(IR_Pagination_Prev).click();
        });

        // Disable Button if Previous Button isn't rendered
        if ($(IR_Pagination_Prev).length === 0) {
            apex.item('ir_btn_prev').disable();
        }

        // Append Next Button to dom
        $('#' + p_InteractiveReport + ' ' + temp_target).append(temp_Button_next);

        // Add Click Handler
        $('#ir_btn_next').bind('click', function () {
            console.info('Button Next');
            $(IR_Pagination_Next).click();
        });

        // Disable Button if Previous Button isn't rendered
        if ($(IR_Pagination_Next).length === 0) {
            apex.item('ir_btn_next').disable();
        }
    },

    /**
     * @function HighlightSearch
     * @description  Highlight search for Interactive Report
     * @param p_InteractiveReport Interactive Report Static ID
     */
    HighlightSearch: (p_InteractiveReport) => {
        // Create dynamic Keyup Handler
        $('#' + p_InteractiveReport).keyup(function (e) {
            if (e.target.id == p_InteractiveReport + '_search_field') {
                v_search = $('#' + p_InteractiveReport + '_search_field').val();
                v_search = v_search.toLowerCase();
                globalThis.gSearch = v_search;
                //console.log('HighlightSearch => ' + v_search);
                mad.util.HighlightCell(p_InteractiveReport, globalThis.gSearch, 'highlight-data');
            }
        });

        // Create Handler for AfterRefresh
        apex.jQuery('#' + p_InteractiveReport).on('apexafterrefresh', function () {
            console.log('apexafterrefresh => HighlightSearch');
            mad.util.HighlightCell(p_InteractiveReport, globalThis.gSearch, 'highlight-data');
        });

        // Create class for highlight style
        mad.util.insertCSS('.highlight-data {background-color: #f5df69!important}');

        // Clear local globalThis
        globalThis.gSearch = null;
    }

};

/**
 * @module download 
 * @description Dowload functions
 */
mad.download = {
    /**
     * @function downloadJSON
     * @description Download one or more files via AJAX Callback
     * @example If you need session state 
     * pOptions = {
     * f01: array,
     * x01: "test",
     * pageItems: ["P1_DEPTNO","P1_EMPNO"]
     * }
     */
    downloadJSON: (callback, pOptions, e) => {
        apex.server.process(callback,
            pOptions, {
                loadingIndicator: e,
                loadingIndicatorPosition: "after",
                success: function (pData) {
                    mad.download.saveBlob(mad.download.toBlob(pData.content, pData.type), pData.filename);
                }
            });
    },

    /**
     * @function saveBlob
     * @description Append a Link with a DataURL and click it
     */
    saveBlob: (pBlob, pFilename) => {
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveOrOpenBlob(pBlob, pFilename);
        } else {
            var link = document.createElement("a");
            link.href = URL.createObjectURL(pBlob);
            link.download = pFilename;
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            setTimeout(function () {
                URL.revokeObjectURL(link.href);
                document.body.removeChild(link);
            }, 100);
        }
    },

    /**
     * @function toBlob
     * @description Convert a blob to base64
     */
    toBlob: (pBase64, pType) => {
        var s = atob(pBase64);
        var ab = new ArrayBuffer(s.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < s.length; i++) {
            ia[i] = s.charCodeAt(i);
        }
        return (new Blob([ab], {
            type: pType
        }));
    }
};

mad.util = {
    /**
     * @function insertCSS
     * @description Append a CSS Rule to the head
     * @param p_CSS => '.highlight { backcolor: gold}'
     */
    insertCSS: (p_CSS) => {
        // Create a CSS Rule and add to the dom
        var style = document.createElement('style');
        document.head.appendChild(style);
        style.sheet.insertRule(p_CSS);
        console.log('insertCSS => ' + p_CSS);

    },
    /**
     * @function HighlightCell
     * @description Highlight Table
     */
    HighlightCell: (p_Table, p_Search, p_Class) => {
        console.log('HighlightCell => ' + p_Table);
        $('#' + p_Table + ' td').each(function () {
            // get the data from IR cell and make it to lower case
            cellData = $(this).text();
            cellData = cellData.toLowerCase();

            // search IR search field value with IR cell data
            cellData = cellData.search(p_Search);

            // if any match found in IR cells then add the class 
            if ((cellData != '-1' || cellData == 0) && p_Search != '') {
                $(this).closest('td').addClass(p_Class);
            }
            // if no match found in IR cells then remove the class
            else if (cellData == '-1') {
                $(this).closest('td').removeClass(p_Class);
            } else
                $(this).closest('td').removeClass(p_Class);
        });
    }
};