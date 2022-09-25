const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const pdf = require("pdf-creator-node");
const option = require("../helpers/options");
const nodemailer = require('nodemailer');
var requests = require("request");
var paymentDetail;
var amount;
var tempAmount;
var paymentUrl;
var pdfData;
var plans;
var gsts;
var expiry;
let _result;



const request = (req, res) => {
  let returnUrl = "http://localhost:4000/api/v1/payment/cashfree/response";
  let notifyUrl = "";
  let appId = process.env.APP_ID;
  let orderId = uuidv4();
  let detail = {
    orderAmount: req.query.orderAmount,
    customerEmail: req.query.customerEmail,
    companyName: req.query.companyName,
    customerPhone: req.query.customerPhone,
    userName: req.query.userName,
    gstin: req.query.gstin,
    address: req.query.address,
    uid: req.query.uid,
  };
  paymentDetail = detail;
  amount = paymentDetail.orderAmount;
  var postData = {
      appId: appId,
      orderId: orderId,
      orderAmount: paymentDetail.orderAmount,
      orderCurrency: "INR",
      companyName: paymentDetail.companyName,
      customerEmail: paymentDetail.customerEmail,
      customerPhone: paymentDetail.customerPhone,
      userName: paymentDetail.userName,
      gstin: paymentDetail.gstin,
      address: paymentDetail.address,
      returnUrl: returnUrl,
      notifyUrl: notifyUrl,
    },
    mode = "TEST",
    secretKey = process.env.SECRET_KEY;
  sortedKeys = Object.keys(postData);
  signatureData = "";
  sortedKeys.sort();
  for (var i = 0; i < sortedKeys.length; i++) {
    k = sortedKeys[i];
    signatureData += k + postData[k];
  }
  var signature = crypto
    .createHmac("sha256", secretKey)
    .update(signatureData)
    .digest("base64");
  postData["signature"] = signature;
  if (mode == "PROD") {
    paymentUrl = "https://www.cashfree.com/checkout/post/submit";
  } else {
    paymentUrl = "https://test.cashfree.com/billpay/checkout/post/submit";
  }
  let formFields = "";
  for (let x in postData) {
    formFields +=
      "<input type = 'hidden' name = '" +
      x +
      "' value = '" +
      postData[x] +
      "' >";
  }
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(
    '<html><head><title>Merchant Checkout Page</title><link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css\" rel=\"stylesheet\" integrity=\"sha384-gH2yIJqKdNHPEq0n4Mqa/HGKIhSkIHeL5AyhkYV8i59U5AR6csBvApHHNl/vI1Bx\" crossorigin=\"anonymous\"></head><body><center><div class=\"d-flex mt-5 justify-content-center align-item-center\"><img height=\"40\" width=\"50\" src=\"https://www.nirvanameet.com/icons/Icon-512.png\" alt=\"\" style=\"margin: center;\">'+
    '<h1 class=\"p-0 m-0 \" align=\"center\">Nirvanameet</h1></div><p class=\"p-0 m-0 text-center\">Making India Meet With NirvanaMeet</p><hr class=\"w-50\" /><p>Please Don\'t refresh this page</p><hr class=\"w-50\"/></center><form method=\"post\" action=\"' +
      paymentUrl +
      '" name="f1">' +
      formFields +
      '</form><script type="text/javascript">document.f1.submit();</script><script src=\"https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js\"'+
      'integrity=\"sha384-A3rJD856KowSb7dwlZdYEkO39Gagi7vIsF0jrRAoQmDKKtQBHUuLZ9AsSv4jD4Xa\"crossorigin=\"anonymous\"></script></body></html>'
  );
  res.end();
};

const response = async (req, res) => {
  var postData = {
      orderId: req.body.orderId,
      orderAmount: req.body.orderAmount,
      referenceId: req.body.referenceId,
      txStatus: req.body.txStatus,
      paymentMode: req.body.paymentMode,
      txMsg: req.body.txMsg,
      txTime: req.body.txTime,
    },
    secretKey = process.env.SECRET_KEY,
    signatureData = "";
  for (var key in postData) {
    signatureData += postData[key];
  }
  var computedsignature = crypto
    .createHmac("sha256", secretKey)
    .update(signatureData)
    .digest("base64");
  postData["signature"] = req.body.signature;
  postData["computedsignature"] = computedsignature;

  _result = JSON.parse(JSON.stringify(postData));
  res.render("response", { data: _result });

  console.log("Payment mode : Online");
  if (_result.txStatus == "SUCCESS") {
    console.log("Payment Status :  Success");
    let txndate = _result.txTime;
    var dtoday = new Date(txndate);
    var dd2 = String(dtoday.getDate()).padStart(2, "0");
    var mm2 = String(dtoday.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy2 = dtoday.getFullYear();

    dtoday = dd2 + "/" + mm2 + "/" + yyyy2;
    

    var someDate = new Date();
    var numberOfDaysToAdd;
    var plan;
    var gst;

    if (amount == "4719") {
      numberOfDaysToAdd = 90;
      tempAmount = "3999";
      gst = "720";
      gsts = gst;
      plan = "Starter";
      plans = plan;
      console.log("plan are: ", plans);
    } else if (amount == "8259") {
      numberOfDaysToAdd = 180;
      tempAmount = "6999";
      gst = "1260";
      gsts = gst;
      plan = "Growth";
      plans = plan;
      console.log("plan are: ", plans);
    } else if (amount == "15339") {
      numberOfDaysToAdd = 360;
      tempAmount = "12999";
      gst = "2340";
      gsts = gst;
      plan = "Enterprise";
      plans = plan;
      console.log("plan are: ", plans);
    }
    var tempresult = someDate.setDate(someDate.getDate() + numberOfDaysToAdd);
    console.log("amount are : ", amount);
    var result = new Date(tempresult);
    var dd1 = String(result.getDate()).padStart(2, "0");
    var mm1 = String(result.getMonth()+1).padStart(2, "0");
    var yyyy1 = result.getFullYear();
    result = dd1+ "/" + mm1  + "/" + yyyy1;
    expiry = result;
    var data = {
      orderid: _result.orderId,
      tid: _result.referenceId,
      amount: _result.orderAmount,
      tdate: _result.txTime,
      status: _result.txStatus,
      companyName: paymentDetail.companyName,
      name: paymentDetail.userName,
      email: paymentDetail.customerEmail,
      number: paymentDetail.customerPhone,
      GSTIN: paymentDetail.gstin,
      address: paymentDetail.address,
      date: dtoday,
    };
    pdfData = data;
  } else {
    console.log("Payment Status : Failed");
    let txnDate = _result.txTime;
    var today1 = new Date(txnDate);
    var dd2 = String(today1.getDate()).padStart(2, "0");
    var mm2 = String(today1.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy2 = today1.getFullYear();

    today1 = dd2 + "/" + mm2 + "/" + yyyy2;
    let data1 = {
      orderid: _result.orderId,
      tid: _result.referenceId,
      amount: _result.orderAmount,
      tdate: _result.txTime,
      status: _result.txStatus,
      company: paymentDetail.companyName,
      name: paymentDetail.userName,
      email: paymentDetail.customerEmail,
      number: paymentDetail.customerPhone,
      gstin: paymentDetail.gstin,
      address: paymentDetail.address,
      date: today1,
    };
  }
};


let mailTransporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'vikashkumarshukla2000@gmail.com',
		pass: 'cpaotajikrjmikyn'
	}
});
const htmlInvoice = ()=>{
  return `
    <div>
      <h1  style="text-align:center;width:100%; background-color:#e74c3c">Invoice Mail</h1>
      <div>
        <h3>Hi ${paymentDetail.userName},</h3>
        <p >We are Sorry to Inform you, Payment was Not Successfull...<br />
            If money got Deducted or got stuck during Payment Please Contact Us..
        </p>
      </div>
      <p>If any Query Please Contact at <a href='mailto:info@niladvantage.com'>info@niladvantage.com</a></p>
      <br/>
      <div>
      <br/><br/>
      <p style='margin:0;padding:0;'>With Regards</p>
      <hr/>
      <img style='margin:0;padding:0;' src='https://www.nirvanameet.com/icons/Icon-512.png' width='20px' height='18px'/> 
      <h2 style='margin:0;padding:0;'>Nirvanameet</h2>
      <p style='margin:0;padding:0;'>Making India Meet With Nirvanameet<br/>
      <a href="https://nirvanameet.com">www.nirvanameet.com</a>
      <br/>Powered By:
      <a href="https://niladvantage.com">Niladvantage Technologies Pvt. Ltd.</a></p>
      
      </div>
    </div>`
}

const generatePdf = async (req, res) => {
  
  if(_result.txStatus == "SUCCESS"){
    const html = fs.readFileSync(
      path.join(__dirname, "../views/template.html"),
      "utf-8"
    );
    const filename = Math.random() + "doc" + ".pdf";
    let invoice = Math.floor(Math.random() * 100) / 100;
    let array = [];
    const prod = {
      email: pdfData.email,
      company: pdfData.companyName,
      plan: plans,
      price: amount,
      purchaseDate: pdfData.date,
      expiryDate: expiry,
      userName: pdfData.name,
      address: pdfData.address,
      number: pdfData.number,
      Gstin: paymentDetail.gstin,
      date: pdfData.date,
      invoice: invoice,
      tid: _result.referenceId,
      amountprice:tempAmount,
    };
    array.push(prod);
    let subTotal = "";
    array.forEach((i) => {
      subTotal += parseInt(i.amountprice);
    });
    let tax = Math.ceil(parseFloat(18/100)*parseInt(subTotal));
    let grandTotal = parseInt(subTotal)+ parseInt(tax);

    var obj = {
      prodlist: array,
      subtotal: subTotal,
      tax: tax,
      gtotal: grandTotal,
    };
    let document = {
      html: html,
      data: {
        products: obj,
      },
      path: "./docs/" + filename,
    };
    await pdf
      .create(document, option)
      .then((res) => {
        console.log('Invoice Location : '+res.filename);
      })
      .catch((e) => {
        console.log(e);
      });
    const filepath = "http://localhost:4000/docs/" + filename;
    const pathfile = "docs/" + filename;
    var options1 = {
      method: "POST",
      url: "http://localhost:4000/upload",
      headers: {},
      formData: {
        inv: {
          value: fs.createReadStream(pathfile),
          options: {
            filename: pathfile,
            contentType: null,
          },
        },
        custEmail:pdfData.email,
        custName:pdfData.name,
        custPhone:pdfData.number,
        custPlan:plans,
        custPurchase:pdfData.date,
        custExpiry:expiry,
      },
    };
    await requests(
      options1,
      await function (error, response) {
        if (error) throw new Error(error);
      }
    )

    
  }
  else{
    let mailDetails = {
      from: 'vikashkumarshukla2000@gmail.com',
      to: `${paymentDetail.customerEmail}`,
      // 'arj4653@gmail.com','vishal@niladvantage.com','niladri@niladvantage.com',
      cc: ['tigertiwari1023@gmail.com'],
      subject: 'Nirvanameet Purchase Invoice',
      //text: 'Node.js testing mail 3 from tejas '
      html: htmlInvoice(),
    };
    await mailTransporter.sendMail(mailDetails, function(err, data) {
      if(err) {
        console.log(err);
      } else {
        console.log('Email sent successfully');
      }
    });
  }
  res.redirect('https://niladvantage.com')
};

module.exports = {
  request,
  response,
  generatePdf,
};
