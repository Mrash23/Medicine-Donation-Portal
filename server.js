var expresskuch = require("express");
var app = expresskuch();
var path = require("path");
var mysql = require("mysql");
var nodemailer = require('nodemailer');
var fileuploader=require("express-fileupload");
const { CLIENT_RENEG_LIMIT } = require("tls");
const { get } = require("http");
var mysql=require("mysql");
//app.use(expressKuch.urlencoded('extended:true'));


app.use(expresskuch.static("public"));

var dbconfiguration = {
    host: "localhost",
    user: "root",
    password: "",
    database: "webmed"
}

var reqdb = mysql.createConnection(dbconfiguration);

reqdb.connect(function (err) {
    if (!err)
        console.log("Connected Successfully!!");
    else
        console.log("Error during connection!");

});




app.listen(2004, function () {
    console.log("Server Started!");
})

app.get("/hello", function (req, resp) {
    resp.send("Hello JI");
})


app.get("/", function (req, resp) {

    //var path=process.cwd()+"/public/index.html";
    var fpath = path.join(__dirname, "public", "/index.html")
    resp.sendFile(fpath);
});


app.get("/admin", function (req, resp) {
    var fpath = path.join(__dirname, "public", "/admin-panel.html")
    resp.sendFile(fpath);
})

app.get("/chkemail", function (req, resp) {

    reqdb.query("select * from profile where email=?", [req.query.txtemail], function (err, result) {

        if (err) {
            resp.send(err);
        }
        else if (result.length == 0)
            resp.send("Available!!");

        else {
            resp.send("Not Available");
        }
    });
});

app.get("/savesignup", function (req, resp){
 
    var datarray=[req.query.txtemail,req.query.txtpass,req.query.utype];
    reqdb.query("insert into profile values(?,?,?,1)", datarray, function (err, result) {
        if (err) {
            resp.send(err);
        }
        else
        {
            resp.send("Inserted Successfully!");
            //====================================================
            let mailTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'priyanshuempire23@gmail.com',
                    pass: 'olyqmvhstpsostku'
                }
            });
             
            let mailDetails = {
                from: 'priyanshuempire23@gmail.com',
                to: req.query.txtemail,
                subject: 'Signup Information',
                text: 'Signed Up successfully!!'
            };
             
            mailTransporter.sendMail(mailDetails, function(err, data) {
                if(err) {
                    console.log('Error Occurs');
                } else {
                    console.log('Email sent successfully');
                }
            });

        }
    });



});


app.get("/chklogin", function (req, resp){
 
    
 
    var ary=[req.query.txtemail,req.query.txtpass];
    reqdb.query("select * from profile where email=? and password=? and status=1",ary, function (err, result) 
    {
        if (err) {
            resp.send(err);
        }
        else
         {
            
            resp.send(result);
        }
       

    });

});

app.get("/updrec",function(req,resp){

    var ary=[req.query.txtemail,req.query.txtpass,req.query.txtpassnew];
    var ary2=[req.query.txtpassnew,req.query.txtemail];

    reqdb.query("select * from profile where email=? and password=?",ary,function(err,result)
    {
        if(err)
        resp.send(err);
        else
        if(result.length==1)
        {
            reqdb.query("update  profile set password =? where email=? ",ary2, function (err, result){
                if (err) 
                {
                    resp.send(err);
                }
                else
                 {
                    
                    resp.send("Password Successfully updated!!");
                }
               
            });

        }
        else
       resp.send("Invalid Old Password");
    })
   

});
app.use(fileuploader());
app.use(expresskuch.urlencoded('extended:true'));
app.post("/donorprofile-process",function(req,resp){

    var fname1=req.body.txtemail+'-'+req.files.proofPic.name;
    var des1= process.cwd()+"/public/donorpic/"+fname1;
    req.files.proofPic.mv(des1,function(err){
        if(err)
        console.log(err);
        else
        console.log("Saved Proofpic");
    })

    var fname2=req.body.txtemail+'-'+req.files.profilePic.name;
    var des2= process.cwd()+"/public/donorpic/"+fname2;
    req.files.profilePic.mv(des2,function(err){
        if(err)
        console.log(err);
        else
        console.log("Saved Profile Pic");
    })

    var dataAry=[req.body.txtemail,req.body.txtname,req.body.txtmob,req.body.txtaddress,req.body.city,req.body.idproof,req.body.txtcontime,fname1,fname2];
    reqdb.query("insert into  dprofile values(?,?,?,?,?,?,?,?,?)",dataAry,function(err,result){
          if(err)
          resp.send(err);
          else
          resp.send("Data Inserted Successfully!!!");
    });

});

app.get("/getdonorProfile",function(req,resp){

    reqdb.query("select * from dprofile where emailid=?",[req.query.txtemail],function(err,result){
        if(err)
       resp.send(err);
     
           else{
           resp.send(result);
       }
   });



});

app.post("/donorprofile-update",function(req,resp){

    var fname1;
    var fname2;
    if(req.files=null)  
    {
        fname1=req.query.hdnid;
        fname2=req.query.hdnprofile;
    }
    else if(req.files.proofPic==null &&  req.files.profilePic!=null )
    {
        fname1=req.query.hdnid;

        var fname2=req.body.txtemail+'-'+req.files.profilePic.name;
        var des= process.cwd()+"/public/donorpic/"+fname2;
        req.files.profilePic.mv(des,function(err){
            if(err)
            console.log(err);
            else
            console.log("Updated Profile pic");
        })

    }
   
   else if(req.files.proofPic!=null &&  req.files.profilePic==null) {
        
    var fname1=req.body.txtemail+'-'+req.files.proofPic.name;
    var des= process.cwd()+"/public/donorpic/"+fname1;
    req.files.proofPic.mv(des,function(err){
        if(err)
        console.log(err);
        else
        console.log("Updated Proof pic");
    })
  
    fname2=req.query.hdnprofile;
   }
 






    var dataAry=[req.body.txtname,req.body.txtmob,req.body.txtaddress,req.body.city,req.body.idproof,req.body.txtcontime,fname1,fname2,req.body.txtemail];
    reqdb.query("update dprofile set name=?,mobile=?,address=?,city=?,prooftype=?,timings=?,proofpic=?,profilepic=? where emailid=?",dataAry,function(err,result){
        if(err)
       resp.send(err);
     
           else{
           resp.send("Data Updated  Successfully!");
       }
   });



});

app.post("/availmed-process",function(req,resp){

    var fname=req.body.txtemail+'-'+req.files.medpic.name;
    var des= process.cwd()+"/public/medpic/"+fname;
    req.files.medpic.mv(des,function(err){
        if(err)
        console.log(err);
        else
        console.log("Saved Med Pic");
    })
    dataAry=[req.body.txtemail,req.body.txtmed,req.body.packing,req.body.txtqty,req.body.expdate,req.body.txtcompany,fname,req.body.txtdesc];
    reqdb.query("insert into medicines values(?,?,?,?,?,?,?,?,current_date())",dataAry,function(err,result){
        if(err)
        resp.send(err);
        else
        resp.send("Data Inserted Successfully!!!");
  });
});

app.post("/needyprofile-process",function(req,resp){

    var fname1=req.body.txtemail+'-'+req.files.proofPic.name;
    var des= process.cwd()+"/public/proofPic/"+fname1;
    req.files.profilePic.mv(des,function(err){
        if(err)
        console.log(err);
        else
        console.log("Saved Proofpic");
    })

    var fname2=req.body.txtemail+'-'+req.files.profilePic.name;
    var des= process.cwd()+"/public/profilepic/"+fname2;
    req.files.profilePic.mv(des,function(err){
        if(err)
        console.log(err);
        else
        console.log("Saved Profile Pic");
    })

    var dataAry=[req.body.txtemail,req.body.txtname,req.body.txtmob,req.body.txtaddress,req.body.city,req.body.idproof,req.body.txtcontime,fname1,fname2];
    reqdb.query("insert into  dprofile values(?,?,?,?,?,?,?,?,?)",dataAry,function(err,result){
          if(err)
          resp.send(err);
          else
          resp.send("Data Inserted Successfully!!!");
    });

});


app.get("/fetchallrecord",function(req,resp){

    reqdb.query("select * from profile",function(result,err){
        if(err)
        resp.send(err);
        else
        resp.send(result);
    })
});

app.get("/blockuser",function(req,resp){

    reqdb.query("update profile set status=0 where email=?",req.query.email,function(result,err){
        if(err)
        resp.send(err);
        else
        resp.send(result);
    });
});

app.get("/unblockuser",function(req,resp){

    reqdb.query("update profile set status=1 where email=?",req.query.email,function(result,err){
        if(err)
        resp.send(err);
        else
        resp.send(result);
    });
});

app.get("/fetchallrecorddp",function(req,resp){

    reqdb.query("select * from dprofile",function(result,err){
        if(err)
        resp.send(err);
        else
        resp.send(result);
    })
});

app.get("/deluser",function(req,resp){

    reqdb.query("delete from dprofile where emailid=?",req.query.email,function(result,err){
        if(err)
                resp.send(err);
            else
            if(result.affectedRows==0)
            resp.send("Invalid Id");
            else
                resp.send("Record Deleted Successfully");
});
});

app.get("/fetchcity",function(req,resp){

    reqdb.query("select distinct city from dprofile",function(err,result){
              
        if(err)
        resp.send(err);
        else
        resp.send(result)
    });

});



app.get("/fetchAllmedicine",function(req,resp)
  {
console.log(req.query.cityx);
    reqdb.query("select distinct * from medicines inner join dprofile on medicines.emailid =dprofile.emailid where dprofile.city=?",[req.query.cityx],function(err,result){
      //console.log(result);
        if(err)
             resp.send(err);
        else
             resp.send(result);
             console.log(result);
    });

});

app.get("/fetchdonor",function(req,resp){

    reqdb.query("select * from medicines where medicine=?",req.query.med,function(err,result){
              
        if(err)
        resp.send(err);
        else
        resp.send(result)
    });

});

app.get("/showdonor",function(req,resp){

    reqdb.query("select * from dprofile where emailid=?",req.query.email,function(err,result){
              
        if(err)
        resp.send(err);
        else
        resp.send(result)
    });

});

app.get("/fetchusermed",function(req,resp){

    reqdb.query("select * from medicines where emailid=?",req.query.email,function(err,result){
     if(err)
     resp.send(err)
     else if(result.length==0)
     resp.send("Invalid Email");
     else
     resp.send(result);
    });
});