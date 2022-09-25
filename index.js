// Requirements of Library
const express = require("express");
const multer = require('multer');
const connectDb = require("./db/database");
const nodemailer = require('nodemailer');
const path = require("path");
const fs = require("fs");
const utils = require("util");
const { uploadInv, getFileStream } = require("./s3");
var payment_route = require("./routes/payment_route");
var pdf_route = require("./routes/pdf_route");


//Server and App Configurations
const port = process.env.PORT || 4000;
require("dotenv").config();
const app = express();
const unlinkFile = utils.promisify(fs.unlink);
//Routiing Configurations
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
//Mail Configuarations
let mailTransporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'vikashkumarshukla2000@gmail.com',
		pass: 'cpaotajikrjmikyn'
	}
});
// Disgital Ocean Multer Storage Configurations
const storage = multer.diskStorage({
  destination: (req, rez, cb) => {
      cb(null, 'docs')
  },
  filename: (req, file, cb) => {
      cb(null, 'Inv_Nirvana' + file.originalname)
      filepath='docs/'+file.originalname
      unlinkFile(filepath)
  }
});
const upload = multer({ storage: storage });
// veiw engine Configurations
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");



//Routing and Routes
app.get("/", (req, res) => {
  res.send("<h1>Welcome To our HomePage</h1>");
});
app.use("/api/v1", payment_route);
app.use(pdf_route.routes);
app.use("/docs", express.static(path.join(__dirname, "docs")));

//uploadinvoice for getting url 
app.get('/upload/:key',async (req, res) => {
  const id = req.params.key;
  const readStream = await getFileStream(id);
  res.send(`<a href=${readStream}>${readStream}</a>`);
})


const htmlInvoice = (custName,custEmail,custPhone,custPlan,custPurchase,custExpiry,download)=>{
  return `
    <div>
      <h1  style="text-align:center;width:100%; background-color:#27ff9a">Invoice Mail</h1>
      <div>
        <h3>Hi ${custName},</h3>
        <p>We are Glad to have You with us. Nirvanameet Will Deliver best Services in Video Conferencing Solution<br />
        <br/>Subscription Details:<br/>
        Name: ${custName}<br/>
        Email: ${custEmail}<br/>
        Phone: ${custPhone}<br/>
        Plan: ${custPlan}<br/>
        Purchase Date: ${custPurchase}<br/>
        Expiry Date: ${custExpiry}<br/>
        </p>
        <h3>Thank You for your Purchase...<br/> Invoice is Attached to Mail or Click <a href="${download}">Download Invoice<a> to Download</h3>
      </div>
      <br/>
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


//get method for Uploading 
app.post('/upload', upload.single('inv'),async (req, res) => {
  const file = req.file;
  const result = await uploadInv(file);
  const custEmail = req.body.custEmail
  const custName = req.body.custName
  const custPhone = req.body.custPhone
  const custPlan = req.body.custPlan
  const custPurchase = req.body.custPurchase
  const custExpiry = req.body.custExpiry
  let filepath =await getFileStream(result.key);
  var download = `http://localhost:4000/upload/${result.key}`; 
  let mailDetails = {
    from: 'vikashkumarshukla2000@gmail.com',
    to: `${custEmail}`,
    // 'arj4653@gmail.com','vishal@niladvantage.com','niladri@niladvantage.com',
    cc: ['tigertiwari1023@gmail.com'],
    subject: 'Nirvanameet Purchase Invoice',
    //text: 'Node.js testing mail 3 from tejas '
    html: htmlInvoice(custName,custEmail,custPhone,custPlan,custPurchase,custExpiry,download),
    attachments: [{
      filename: result.key,
      path: filepath
    }]
  };
  await mailTransporter.sendMail(mailDetails, function(err, data) {
    if(err) {
      console.log(err);
    } else {
      console.log('Email sent successfully');
    }
  });
  await unlinkFile(file.path);
})

//download invoice method
app.get('/download/:key',async (req, res) => {
  const id = req.params.key;
  const link = await getFileStream(id);
  res.redirect(link);
});





//Server Start Method
const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI).then(() => {
      app.listen(port, () =>
        console.log(`Server are running on port http://localhost:${port}`)
      );
    });
  } catch (error) {
    console.log(error);
  }
};

start();
