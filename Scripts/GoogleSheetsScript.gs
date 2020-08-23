const col_UserId = 1;
const col_FirstName = 2;
const col_LastName = 3;
const col_Email = 4;
const col_UserType = 5;
const col_Language = 6;
const col_LastEntry = 7;
const col_EntryTodayFlag = 8;
const col_Date = 9;
const col_TimeStamp = 10;
const col_RowId = 11;
const col_Finalized = 12;
const col_ChoiceEntered = 13;
const col_Location = 14;
const col_Transportation = 15;
const col_Temperature = 16;
const col_Exposure = 17;
const col_ContactedNurse = 18;
const col_OptionalQuestion = 19
const col_FullName = 20;
const col_EZPass = 21;
const col_QuarantineEndDate = 22;
const col_UnderQuarantine = 23;
const col_QuarantineMessage = 24;
const col_LastChoiceEntered = 25;
const col_LastExposureEntered = 26;
const col_TalkedToNurse = 27;
// Health Log Constants
const col_sync = 12;

/**
 * Returns an arbitrary list of values in a column as an array
 * 
 * @param {string} sheetName Name of the sheet to get the values from
 * @param {number} column    Number representing the column to grab values from
 * @param {number} headers   Number of rows containing headers to skip when looking for data
 */ 
function getColumnValues(sheetName, column, matchKey) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var valueArray = sheet.getRange(1, column, sheet.getMaxRows() - 1, 1).getValues();
  var values = [];
  for(var i = 0; i < valueArray.length; i++) {
    if(valueArray[i][0] == matchKey) {
      values.push(i+1);
    }
  }
  return values;
}

function runNightly() {
  var SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("User");
  var counter = 2;
  var lastRow = SHEET.getLastRow();
  var ColLastChoiceEntered = col_LastChoiceEntered;
  Logger.log('Counter : ' + counter + ' Last Row' + lastRow);
  for (var i=counter; i<lastRow+1; i++)
  {
    rows = SHEET.getRange(i,col_LastChoiceEntered);rows.setValue("NO");
    rows = SHEET.getRange(i,col_LastExposureEntered);rows.setValue("NO");
    rows = SHEET.getRange(i,col_TalkedToNurse);rows.setValue("");
  }
}

function archiveValuesByDate(targetDate) {
  var SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("HealthLog");
  var RANGE = SHEET.getDataRange();
  var rows = SHEET.getDataRange().getValues();
  targetDate = new Date('2020-07-16');
  
  var COL_TO_SEARCH = 2; //Zero is first
  
  var startTime = new Date().getTime();

  var filteredRangeKeep = rows.filter(function(val){
    
    return (val[COL_TO_SEARCH] == "TimeStamp" || val[COL_TO_SEARCH] > targetDate);
  });
  var filteredRangeErase = rows.filter(function(val){
    return !(val[COL_TO_SEARCH] > targetDate);
  });  
  
  Logger.log("Target Date is : "+ targetDate);
  Logger.log("Keep " + filteredRangeKeep);
  Logger.log("Erase " + filteredRangeErase);
  
  RANGE.clearContent();
  
  var newRange = SHEET.getRange(1,1,filteredRangeKeep.length, filteredRangeKeep[0].length);
  newRange.setValues(filteredRangeKeep);

}

function doGet(e) {
  var content = jsonify("SyncSheet");
  updateSyncFlag("HealthLog");
  return ContentService.createTextOutput(JSON.stringify(content) ).setMimeType(ContentService.MimeType.JSON); 
}

function updateSyncFlag(GWorkSheet)
{
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(GWorkSheet);
  var lrow = sheet.getLastRow();
  for ( i = 2; i < lrow+1; i++){  
    writecell = sheet.getRange(i,col_sync);
    writecell.setValue("SYNC");
  }
}


function jsonify(GWorkSheet) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(GWorkSheet);
  var lrow = sheet.getLastRow();
  var rows = sheet.getDataRange().getValues();
  
  var APIPayloadObject = {gspayload:[]};
  if (lrow > 100) low = 100;
  for ( i = 1; i < lrow; i++){
    if (rows[i][1] != ""){
      APIPayloadObject.gspayload[i-1] = {
        RowId : rows[i][0],
        StudentID : rows[i][1],     
        TimeStamp : rows[i][2],
        ResponseFlag : rows[i][3],
        Location : rows[i][4],
        Transportation : rows[i][5],
        Temperature : rows[i][6],
        Exposure : rows[i][7],
        ContactedNurse : rows[i][8],
        OptionalQuestion : rows[i][9],
        EnteredBy : rows[i][10]
      };
    }
  }
  return APIPayloadObject;
}

function changeWatch() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = activeSheet.getLastRow();
  var cell = activeSheet.getActiveCell();
  var col = cell.getColumn();
  var row = cell.getRow();
  var colCk1 = activeSheet.getRange(row,col_EntryTodayFlag);
  var UserId = activeSheet.getRange(row,col_UserId).getValue();
  var timestamp = new Date();
  var email = activeSheet.getRange(row, col_Email).getValue(); // Account Email
  var EntryData1 = activeSheet.getRange(row, col_ChoiceEntered).getValue(); // Daily Answer
  var EntryData2 = activeSheet.getRange(row, col_Location).getValue(); // Location
  var EntryData3 = activeSheet.getRange(row, col_Transportation).getValue(); // Transportation Question
  var EntryData4 = activeSheet.getRange(row, col_Temperature).getValue(); // Temperature
  var EntryData5 = activeSheet.getRange(row, col_Exposure).getValue(); // Exposure
  var EntryData6 = activeSheet.getRange(row, col_ContactedNurse).getValue(); // Contact Nurse
  var EntryData7 = activeSheet.getRange(row, col_OptionalQuestion).getValue(); // Optional Question
  var EntryData8 = activeSheet.getRange(row, col_Finalized).getValue(); // Record Entered By
  
    // Changes to Last Entry
  if (col != col_LastEntry || activeSheet.getName() !== 'User' || cell.isBlank() || cell.getValue() != "6/10/2020 20:24:43") {
    // Do nothing
  } else {
    // Clear Last Entry Value(s)
    writecell = activeSheet.getRange(row,col_LastChoiceEntered);writecell.setValue("NO");
    writecell = activeSheet.getRange(row,col_LastExposureEntered);writecell.setValue("");
  }
   
  
  
  // Changes to Finalized
  if (col != col_Finalized || activeSheet.getName() !== 'User' || cell.isBlank() || colCk1.getValue() == true) {
    return;
  } else {
   
    // Update value of person doing input
    writecell = activeSheet.getRange(row,col_LastEntry);writecell.setValue(timestamp);
    writecell = activeSheet.getRange(row,col_Finalized);writecell.setValue("");
    writecell = activeSheet.getRange(row,col_ChoiceEntered);writecell.setValue("");
    writecell = activeSheet.getRange(row,col_Location);writecell.setValue("");
    writecell = activeSheet.getRange(row,col_Transportation);writecell.setValue("");
    writecell = activeSheet.getRange(row,col_Temperature);writecell.setValue("");
    writecell = activeSheet.getRange(row,col_Exposure);writecell.setValue("");
    writecell = activeSheet.getRange(row,col_ContactedNurse);writecell.setValue("");
    writecell = activeSheet.getRange(row,col_OptionalQuestion);writecell.setValue(""); 
    writecell = activeSheet.getRange(row,col_LastChoiceEntered);writecell.setValue(EntryData1);
    writecell = activeSheet.getRange(row,col_LastExposureEntered);writecell.setValue(EntryData5);
    writecell = activeSheet.getRange(row,col_TalkedToNurse);writecell.setValue(EntryData6);
    writecell = activeSheet.getRange(row,col_TimeStamp);writecell.setValue(new Date().getTime());
    
    // ** Finish text below and give real values **
    var rowContents = [UserId,timestamp,EntryData1,EntryData2,EntryData3,EntryData4,EntryData5,EntryData6,EntryData7,EntryData8];
    addNewHealthLog(rowContents);
    
    // ** Do a sibling Check and update if neccessary
    if (EntryData1 == 'YES' || EntryData5 == 'YES')
    {
      var RowValues = getColumnValues('User', col_Email, email);
      for (rownum in RowValues)
      {
        if (RowValues[rownum] != row && (activeSheet.getRange(RowValues[rownum],col_LastChoiceEntered).getValue() != "YES" || activeSheet.getRange(RowValues[rownum],col_LastExposureEntered).getValue() != "YES"))
        {
          writecell = activeSheet.getRange(RowValues[rownum],col_LastChoiceEntered);writecell.setValue(EntryData1);
          writecell = activeSheet.getRange(RowValues[rownum],col_LastExposureEntered);writecell.setValue(EntryData5);
          writecell = activeSheet.getRange(RowValues[rownum],col_LastEntry);writecell.setValue(timestamp);
          var sUserId = activeSheet.getRange(RowValues[rownum],col_UserId).getValue();
          // Enter log for sibling
          var srowContents = [sUserId,timestamp,EntryData1,,,,EntryData5,,,'Auto'];
          addNewHealthLog(srowContents);
        }
      } 
    }    
  }
  
  
}


function addNewHealthLog(rowContents) {
  var arowContents = rowContents;
  var HealthLogSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("HealthLog");
  var lRow = 122100001 + HealthLogSheet.getLastRow();
  rowContents.unshift(lRow);
  HealthLogSheet.appendRow(rowContents);
  var ArchiveLogSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DataArchive");
  var laRow = 122100001 + ArchiveLogSheet.getLastRow();
  arowContents[0] = laRow;
  ArchiveLogSheet.appendRow(arowContents);
}