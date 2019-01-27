<style>
  h1 {
    font-family: sans-serif;
    font-size: 13px;
  }
  
  td, div, body {
    font-family: sans-serif;
    vertical-align: top;
  }
  
  error {
    color: red;
  }
  
  .maxThreads {
    width: 30px;
  }
  
  h1 {
    margin-top: 30px;
  }
  
  [data-mode="SELECT"] .labelDisplayMode {
    display: none;
  }
  
  [data-mode="DISPLAY"] .labelSelectMode {
    display: none;
  }
  
  [data-label-name=""] .labelOnly {
    display: none;
  }
  
  [data-label-name]:not([data-label-name=""]) .nonLabelOnly {
    display: none;
  }
  
  .removeLog {
    cursor: pointer;
    display: inline-block;
    margin-left: 8px;
  }
  
  a, .labelName {
    font-size: 16px;
    text-decoration: underline;
    cursor: pointer;
    color: #0000ff;
  }
  
  a.editableField {
    text-decoration: none;
    cursor: pointer;
    color: #000000;
  }
  
  .editableText {
    cursor: pointer;
  }
  
  .textInput {
    font-size: 16px;
    width: 100%;
  }
  
  .clearSpreadsheetUrl {
    display: block;
    margin-top: 20px;
  }
  
  .overviewTable tr:nth-child(even) {
    background: #dddddd;
  }

  .overviewTable tr:nth-child(odd) {
    background: #ffffff;
  }
  
  .overviewTable tr[data-status="Completed"],
  .overviewTable tr[data-status="Obsolete"],
  .overviewTable tr[data-status="Completed"]  a.editableField,
  .overviewTable tr[data-status="Obsolete"]  a.editableField {
    color: #999999;
  }
  
  a.addLink {
    color: #9999cc;
  }
  
  .overviewTable tr[data-status="Completed"] a.addLink,
  .overviewTable tr[data-status="Obsolete"] a.addLink {
    display: none;
  }
  
  .loadTime {
    font-size: 11px;
    margin-top: 4px;
  }
  
  .priority {
    width: 90px;
  }
  
  .status {
    width: 90px;
  }
  
  input.field[type="text"] {
    width: 100%;
  }
  
  .error {
    font-size: 13px;
    color: red;
  }
  
  .optionPicker {
    margin-top: 5px;
    border-radius: 4px;
    border: 1px solid #333333;
    background: #eeeeee;
  }
  
  .optionPicker div {
    font-size: 14px;
    text-decoration: underline;
    cursor: pointer;
    padding: 2px;
    margin-top: 1px;
    margin-right: 3px;
    margin-left: 3px;
    border-top: 1px solid #333333;
  }
  
  .optionPicker div.currValue {
    background: #cccccc;
  }
  
  .optionPicker div:first-child {
    margin-top: 0;
    border-top: none;
  }
  
  .optionPicker div:hover {
    background: #aaaaaa;
  }
  
  .editLink {
    cursor: pointer;
    color: black;
    height: 14px;
    margin-left: 3px;
  }
  
  [data-href=""] .editLink {
    opacity: .3;
  }
</style>
