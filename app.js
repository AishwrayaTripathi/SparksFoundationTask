const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.resolve(__dirname,'./public')));
app.use(express.json());
app.set('view engine','ejs');
app.use(express.urlencoded({ extended: false}));
mongoose.connect('mongodb+srv://aish:Aish@cluster0.cwoc5zn.mongodb.net/?retryWrites=true&w=majority',()=>console.log('Database connected'),(err)=>{
    console.log(err);
});

const customerSchema = new mongoose.Schema({
    AccountNo: {
        type : String,
        required: true
    },
    Name: {
        type : String,
        required: true
    },
    Balance: {
        type : String,
        required: true
    },
    Email: {
        type : String,
        required: true
    },
    ContactNo: {
        type : String,
        required: true
    }
});

const customer = new mongoose.model('customer',customerSchema);


app.get('/',(req,res)=>{
    res.sendFile(path.resolve(__dirname,'./public/home.html'));
});

app.get('/customer',(req,res)=>{
    customer.find({}, function (err, data) {
        if (err) {
            console.log(err);
        } 
        else {
            res.render("customer", { "customerData" : data });
            // console.log(data);
        }
    })
});

app.get('/transfer',(req,res)=>{
    res.sendFile(path.resolve(__dirname,'./public/transfer.html'));
});

app.post('/transfer', async (req,res)=>{
    var sen = req.body.Sender;
    var rec = req.body.Receiver;
    var amt = Number(req.body.Amount);
    
    const notValidSenderAccountNo = await customer.findOne({"AccountNo":sen});
    if(notValidSenderAccountNo==null){
        return res.send("Sender's account number is not valid");
    }

    const notValidReceiverAccountNo = await customer.findOne({"AccountNo":rec});
    if(notValidReceiverAccountNo==null){
        return res.send("Receiver's account number is not valid");
    }

    var senderBalance = Number(notValidSenderAccountNo.Balance);
    var receiverBalance = Number(notValidReceiverAccountNo.Balance);

    if(senderBalance < amt){
        return res.send("Balance is not adequate");
    }
    else{
        senderBalance = senderBalance - amt;
        receiverBalance = receiverBalance + amt;
        console.log(senderBalance);
        console.log(receiverBalance);
        // customer.update({AccountNo:sen},{Balance:senderBalance.toString()},function(err,result){
        //     if(err)
        //         res.send(err);
        //     else
        //         res.json(result);
        // });
        // customer.update({AccountNo:res},{Balance:receiverBalance.toString()},function(err,result){
        //     if(err)
        //         res.send(err);
        //     else
        //         res.json(result);
        // });
        await customer.updateOne({AccountNo:sen},{$set:{Balance:senderBalance.toString()}});
        await customer.updateOne({AccountNo:rec},{$set:{Balance:receiverBalance.toString()}});
        return res.send("Successfull");
    }
});

app.listen(PORT,()=>{
    console.log("Server started");
});