var fs = require('fs');
var Docxtemplater = require('docxtemplater');
var JSZip = require('jszip');

var content = fs
    .readFileSync(__dirname+"/engagement_letter.docx","binary");

var zip = new JSZip(content);
var doc = new Docxtemplater().loadZip(zip);

doc.setData({
    "signatory.date": "December, 10th, 2016",
    "signatory.name": "Mr. Zold",
    "signatory.email": "test@gmail.com",
    "signatory.company": "FlexFunds Test",
    "signatory.address_line1" : "400 Sunny Isles Blvd",
    "signatory.address_line2" : "Apartment 1906, FL ,33160",
    "signatory.country" : "United States",
    "series.name": "FlexNotes Test",
    "series.number": "100",
    "series.due_year": "2099",
    "series.product_type": "Fund"
});

doc.render();

var buf = doc.getZip()
    .generate({type:"nodebuffer"});

fs.writeFileSync(__dirname+"/output.docx",buf);