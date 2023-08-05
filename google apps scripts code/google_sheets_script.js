var timeZone = "Africa/Accra";

var dateTimeFormat = "dd/MM/yyyy HH:mm:ss";
var logSpreadSheetId = "";
var attendanceLogSheetName = "attendance log"; // attendance log sheet
var defaultTerminalName = "headquarter"; // default terminal name
var mainTabName = "main tab"; // main tab name or database name /** change **/

// create custom "Anyboards Menu" when spreadsheet is opened
function onOpen() {
    var ui = SpreadsheetApp.getUi();

    ui.createMenu('Anyboards Menu')
        // can be deleted after initialization
        .addItem('Initial Setup', 'initialSetup')
        .addItem('Add New UIDs', 'addNewUIDsFromAttendanceLogUiHandler')
        .addItem('Add One Selected UID', 'addOneSelectedUID')
        .addToUi(); // add custom menu and all items to the Google Sheets UI. 
    // end of menu items
}


// creates sheets and columns
function initialSetup() {
    if (!getAttendanceLogSheet()) { // check if "attendance log" sheet does not exists
        // Create the main tab and set column headers and widths
        var mainSheet = SpreadsheetApp.getActiveSheet().setName(mainTabName); // get the currently active (viewed) sheet in the spreadsheet and set its name to the value in `mainTabName` variable
        var rowData = ['UID', 'Name', 'Access', 'Text To Display', 'Visits Count', 'Last Visit']; // create array with column headers for `main tab` sheet
        mainSheet.getRange(1, 1, 1, rowData.length).setValues([rowData]); // access or select a range of cells in the first row from column 1 and span across rowData.length columns, and set their values to that in `rowData` array
        mainSheet.setColumnWidths(1, rowData.length + 1, 150); // set the width of the columns from column 1 to column headers + 1 extra to 150 pixels

        // create the attendance log sheet and set column headers and widths
        var attendanceSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(attendanceLogSheetName); // insert a new sheet with the name stored in the `attendanceLogSheetName` variable into the active spreadsheet
        rowData = ['Date Time', 'UID', 'Name', 'Result', 'Terminal']; // create array with column headers for `attendance log` sheet
        attendanceSheet.getRange(1, 1, 1, rowData.length).setValues([rowData]); // access or select a range of cells in the first row from column 1 and span across rowData.length columns, and set their values to that in `rowData` array
        attendanceSheet.setColumnWidths(1, rowData.length + 1, 150); // set the width of the columns from column 1 to column headers + 1 extra to 150 pixels
    }
    else { // if sheet already exists
        var ui = SpreadsheetApp.getUi(); // get ui service to interact with user interface
        ui.alert('The spreadsheet system has already been initialized'); // show alert dialog
    }
}


// add new UIDs from attendance sheet to main sheet
function addNewUIDsFromAttendanceLogUiHandler() {
    var ui = SpreadsheetApp.getUi(); // get ui service to interact with user interface
    var response = ui.alert('All new Uids from ' + attendanceLogSheetName + ' will be added to the main tab', 'Are you sure?', ui.ButtonSet.YES_NO); // display an alert dialog box with a confirmation message with YES and NO options and return the result

    // process the user's response.
    if (response == ui.Button.YES) { // if response was YES
        addNewUIDsFromAttendanceLog(); // add new UIDs from attendance sheet to main sheet through function
    }
}


// add currently selected UID from attendance sheet to main sheet
function addOneSelectedUID() {
    var tabName = SpreadsheetApp.getActiveSheet().getName(); // get the name of the currently active sheet (the sheet the user is currently viewing) and store it in the `tabName` variable
    if (tabName != attendanceLogSheetName) { // check if user is in not "attendance log" sheet
        SpreadsheetApp.getUi().alert('It Shoud be ' + attendanceLogSheetName + ' sheet'); // display alert message that user is not in the right sheet
    }
    var row = SpreadsheetApp.getActiveSheet().getActiveCell().getRow(); // get row number of selected cell in active sheet
    var col = SpreadsheetApp.getActiveSheet().getActiveCell().getColumn(); // get column number of selected cell in active sheet

    addNewUIDsFromAttendanceLog(row); // add currently selected UID from attendance sheet to main sheet by passing row number to function
}


// adds new UIDs from attendance log to main tab
function addNewUIDsFromAttendanceLog(row) {
    var mainTab = getMainSheet(); // get main tab sheet, where UIDs will be added
    var data = mainTab.getRange(2, 1, mainTab.getLastRow(), 1).getValues(); // retrieve data in column 1 (UIDs) of the main tab sheet, starting from row 2 and going up to the last row with data. store the data in the data variable as 2D array
    var registeredUIDs = []; // intialize empty array to store unique registered UIDs
    data.forEach(x => registeredUIDs.push(x[0])); // loop through each row of `data` array and push the UID into `registeredUIDS` array, to prepare for quick membership checking later

    registeredUIDs = [...new Set(registeredUIDs)]; // remove duplicate UIDs by converting to a set then back to array

    var attendanceSheet = getAttendanceLogSheet(); // get attendance log sheet, where new UIDs will be fetched

    var data;

    // determine which rows of data from attendance log sheet to process based on `row` argument passed
    if (row) // if row argument is provided
        data = attendanceSheet.getRange(row, 1, row, 2).getValues(); // fetch specific data(date and UID) from that specific row
        // change .getRange(row, 1, row, 2) to .getRange(2, 1, row, 2)
    else // else row argument is not provided
        data = attendanceSheet.getRange(2, 1, attendanceSheet.getLastRow(), 2).getValues(); // fetch specific data(date and UID) from that all rows
    
    var arr = []; // empty array to store new UIDs and their associated dates that are not already registered in main tab

    for (var i = 0; i < data.length; i++) {
        var visit = [];
        var uid = data[i][1];
        if (!registeredUIDs.includes(uid)) {

            visit.date = data[i][0];
            visit.uid = uid;
            arr.push(visit)
            registeredUIDs.push(uid);
        }
    }

    var startRow = mainTab.getLastRow() + 1;
    data = [];
    for (var i = arr.length - 1; i >= 0; i--) // in reverse for proper last visit
    {
        //'UID','Name','Access','Text','Last Visit'
        var row = [];
        row[0] = arr[i].uid;
        row[1] = 'Person ' + (startRow - 2 + arr.length - i);
        row[2] = -1;
        row[3] = "You're unregistered";
        row[4] = 0;
        row[5] = arr[i].date;
        data.push(row);

    }
    if (data.length > 0)
        mainTab.getRange(startRow, 1, data.length, data[0].length).setValues(data);

}




function doGet(e) {
    //default values
    var access = "-1";
    var text = 'ERROR';
    var name = 'Invalid ID';

    var dateTime = Utilities.formatDate(new Date(), timeZone, dateTimeFormat);
    // var json;
    // var error="idk";
    Logger.log(JSON.stringify(e)); // view parameters
    var result = 'Ok'; // assume success

    if (e.parameter == 'undefined') {
        result = 'No Parameters';
    } else {

        var uid = '';
        // var onlyPing=false;
        var terminal = defaultTerminalName;
        // var error = '';
        for (var param in e.parameter) {

            var value = stripQuotes(e.parameter[param]);

            switch (param) {
                case 'uid':
                    uid = value;
                    break;
                case 'terminal':
                    terminal = value;
                    break;

                default:
                    result = "unsupported parameter";
            }
        }


        var mainSheet = getMainSheet();

        var data = mainSheet.getDataRange().getValues();
        if (data.length == 0)
            return;
        //checking if uid is known
        for (var i = 0; i < data.length; i++) {

            if (data[i][0] == uid) {
                name = data[i][1];
                access = data[i][2];
                // text = data[i][3];
                text = 'Welcome' + name;
                var numOfVisits = mainSheet.getRange(i + 1, 5).getValue();
                mainSheet.getRange(i + 1, 5).setValue(numOfVisits + 1);
                mainSheet.getRange(i + 1, 6).setValue(dateTime + ' ' + terminal);
                break;
            }

        }
        //inserting record to attendence log
        var attendanceSheet = getAttendanceLogSheet();  // get attendance log sheet, 
        data = [dateTime, uid, name, access, terminal];
        attendanceSheet.getRange(attendanceSheet.getLastRow() + 1, 1, 1, data.length).setValues([data]);
    }


    result = access + ":" + name + ":" + text;
    return ContentService.createTextOutput(result);

}

// MISCELLANEOUS FUNCTIONS
// 
function getAttendanceLogSheet() {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(attendanceLogSheetName);
}

// 
function getMainSheet() {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(mainTabName);
}

// Remove leading and trailing single or double quotes
function stripQuotes(value) {
    return value.replace(/^["']|['"]$/g, "");
}