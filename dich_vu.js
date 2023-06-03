// Khai báo thư viện http của node
const http = require("http");
// Khai báo biến môi trường
require('dotenv').config()
// Khai báo cổng của dịch vụ
const port = 8080;
// Khai báo thư viện Xử lý tập tin của node
const fs = require("fs");
// Khai báo thư viện MongoDB 
const db = require("./mongoDB");
// Khai báo thư viên SendMail
const sendMail = require('./sendMail');
var nodemailer = require('nodemailer');
//Khai báo thư viện upload cloud images
const imgCloud = require("./cloudinaryImages")
// Xây dựng dịch vụ
const dich_vu = http.createServer((req, res) => {
    let method = req.method;
    let url = req.url;
    let ketqua = `Dịch vụ NodeJS - Method:${method} - Url:${url}`;
    // Cấp quyền
    res.setHeader("Access-Control-Allow-Origin", '*');
    if (method == "GET") {
        if (url == "/dsTivi") {
            db.getAll("tivi").then(result => {
                res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                res.end(JSON.stringify(result));
            })
        } else if (url == "/dsHocsinh") {
            db.getAll("student").then(result => {
                res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                res.end(JSON.stringify(result));
            })
        } else if (url == "/dsNguoidung") {
            db.getAll("nguoidung").then(result => {
                res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                res.end(JSON.stringify(result));
            })
        }  else if (url == "/dsMathang") {
            db.getAll("mathang").then(result => {
                res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                res.end(JSON.stringify(result));
            })
        }  else if (url == "/dsLaptop") {
            db.getAll("laptop").then(result => {
                res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                res.end(JSON.stringify(result));
            })
        } else if (url == "/Cuahang") {
            db.getAll("cuahang").then(result => {
                res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                res.end(JSON.stringify(result));
            })
        } else if (url == "/dsDienthoai") {
            db.getAll("dienthoai").then(result => {
                res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                res.end(JSON.stringify(result));
            })
        } else {
            res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
            res.end(ketqua);
        }
    } else if (method == "POST") {
        // Lấy dữ liệu client gởi về
        let noi_dung_nhan = ``;
        req.on("data", (dulieu) => {
            noi_dung_nhan += dulieu
        })

        if (url == "/Dangnhap") {
            req.on("end", () => {
                let ket_qua = {
                    "Noi_dung": true
                }
                let user = JSON.parse(noi_dung_nhan);
                let dieukien = {
                    $and: [
                        { "Ten_Dang_nhap": user.Ten_Dang_nhap },
                        { "Mat_khau": user.Mat_khau }
                    ]
                }
                db.getOne("nguoidung", dieukien).then(result => {
                    console.log(result)
                    ket_qua.Noi_dung = {
                        "Ho_ten": result.Ho_ten,
                        "Nhom": {
                            "Ma_so": result.Nhom_Nguoi_dung.Ma_so,
                            "Ten": result.Nhom_Nguoi_dung.Ten
                        }
                    };
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua));

                }).catch(err => {
                    console.log(err);
                    ket_qua.Noi_dung = false;
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua));
                })
            })
        }  else if (url == "/Lienhe") {
            req.on("end", () => {
                let kq = JSON.parse(noi_dung_nhan)
                let from = `${kq.email}`;
                let to = `tieudan203@gmail.com`;
                let subject = `${kq.tieude}`;
                let body = info.noidung; //

                sendMail.Goi_Thu_Lien_he(from, to, subject, body).then(result => {
                    console.log(result);
                    res.end(JSON.stringify(kq))
                }).catch(err => {
                    console.log(err);
                    kq.noi_dung = false;
                    res.end(JSON.stringify(kq))
                })
            })
        } else if (url == '/Xacnhan') {
            req.on('end', () => {
                let kq = JSON.parse(noi_dung_nhan)
                let from = 'tieudan203@gmail.com';
                let to = kq.khach_hang.Email;
                let subject = `Xác nhận đơn hàng: ${kq.khach_hang.Ho_ten}`;
                let body = `Đơn hàng của bạn: <br/> ${kq.don_hang}`;
                sendMail.Goi_Thu_Lien_he(from, to, subject, body).then(result => {
                    console.log(result);
                    res.end(JSON.stringify(kq))
                }).catch(err => {
                    console.log(err);
                    kq.noi_dung = false;
                    res.end(JSON.stringify(kq));
                })
            })
         } else if (url == "/Dathang") {
            req.on("end", () => {
                let dsDonhang = JSON.parse(noi_dung_nhan);
                let ket_qua = { "Noi_dung": [] };
                dsDonhang.forEach(item => {
                    let collectionName="tivi"
                    collectionName=(item.nhom==2)?"laptop":(item.nhom==3)?"dienthoai":"tivi";
                    let filter = {
                        "Ma_so": item.key
                    }
                    db.getOne(collectionName,filter).then(result => {
                        item.dathang.So_Phieu_Dat = result.Danh_sach_Phieu_Dat.length + 1;
                        result.Danh_sach_Phieu_Dat.push(item.dathang);
                        // Update
                        let capnhat = {
                            $set: { Danh_sach_Phieu_Dat: result.Danh_sach_Phieu_Dat }
                        }
                        let obj = {
                            "Ma_so": result.Ma_so,
                            "Update": true
                        }
                        db.updateOne(collectionName, filter, capnhat).then(result => {
                            if (result.modifiedCount == 0) {
                                obj.Update = false

                            }
                            ket_qua.Noi_dung.push(obj);
                            if (ket_qua.Noi_dung.length == dsDonhang.length) {
                                res.end(JSON.stringify(ket_qua));
                            }
                        }).catch(err => {
                            console.log(err)
                        })
                    }).catch(err => {
                        console.log(err);
                    })

                })

            })
        } else if (url == "/ThemDienthoai") {
            req.on('end', function () {
                let mobile = JSON.parse(noi_dung_nhan);
                let ket_qua = { "Noi_dung": true };
                db.insertOne("dienthoai", mobile).then(result => {
                    console.log(result);
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua));
                }).catch(err => {
                    console.log(err);
                    ket_qua.Noi_dung = false;
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua));
                })
            })
        }else if (url == "/SuaDienthoai") {
            req.on('end', function () {
                let mobile = JSON.parse(noi_dung_nhan);
                let ket_qua = { "Noi_dung": true };
                db.updateOne("dienthoai",mobile.condition,mobile.update).then(result=>{
                   // console.log(result);
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua));
                }).catch(err=>{
                    console.log(err);
                    ket_qua.Noi_dung = false;
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua)) 
                })
            })
        }
else if (url == "/XoaDienthoai") {
            req.on('end', function () {
                let mobile = JSON.parse(noi_dung_nhan);
                let ket_qua = { "Noi_dung": true };
                db.deleteOne("dienthoai",mobile).then(result=>{
                    console.log(result);
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua));
                }).catch(err=>{
                    console.log(err);
                    ket_qua.Noi_dung = false;
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua))
                })
                
            })

        }else if (url == "/ImagesDienthoai") {
            req.on('end', function () {
                let img = JSON.parse(noi_dung_nhan);
                let Ket_qua = { "Noi_dung": true };
                // upload img in images ------------------------------
                
                // let kq = saveMedia(img.name, img.src)
                // if (kq == "OK") {
                //     res.writeHead(200, { "Content-Type": "text/json; charset=utf-8" });
                //     res.end(JSON.stringify(Ket_qua));
                // }else{
                //     Ket_qua.Noi_dung=false
                //     res.writeHead(200, { "Content-Type": "text/json; charset=utf-8" });
                //     res.end(JSON.stringify(Ket_qua));
                // }

                // upload img host cloudinary ------------------------------
           
                imgCloud.UPLOAD_CLOUDINARY(img.name,img.src).then(result=>{
                    console.log(result);
                    res.end(JSON.stringify(Ket_qua));

                }).catch(err=>{
                    Ket_qua.Noi_dung=false
                    res.end(JSON.stringify(Ket_qua))
                })
                
            })

        }else if (url == "/ThemTivi") {
            req.on('end', function () {
                let tivi = JSON.parse(noi_dung_nhan);
                let ket_qua = { "Noi_dung": true };
                db.insertOne("tivi", tivi).then(result => {
                    console.log(result);
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua));
                }).catch(err => {
                    console.log(err);
                    ket_qua.Noi_dung = false;
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua));
                })
            })
        }else if (url == "/SuaTivi") {
            req.on('end', function () {
                let tivi = JSON.parse(noi_dung_nhan);
                let ket_qua = { "Noi_dung": true };
                db.updateOne("tivi",tivi.condition,tivi.update).then(result=>{
                   // console.log(result);
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua));
                }).catch(err=>{
                    console.log(err);
                    ket_qua.Noi_dung = false;
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua)) 
                })
            })
        }
else if (url == "/XoaTivi") {
            req.on('end', function () {
                let tivi = JSON.parse(noi_dung_nhan);
                let ket_qua = { "Noi_dung": true };
                db.deleteOne("tivi",tivi).then(result=>{
                    console.log(result);
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua));
                }).catch(err=>{
                    console.log(err);
                    ket_qua.Noi_dung = false;
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua))
                })
                
            })

        }else if (url == "/ImagesTivi") {
            req.on('end', function () {
                let img = JSON.parse(noi_dung_nhan);
                let Ket_qua = { "Noi_dung": true };
                imgCloud.UPLOAD_CLOUDINARY(img.name,img.src).then(result=>{
                    console.log(result);
                    res.end(JSON.stringify(Ket_qua));

                }).catch(err=>{
                    Ket_qua.Noi_dung=false
                    res.end(JSON.stringify(Ket_qua))
                })
                
            })

        } else if (url == "/ThemLaptop") {
            req.on('end', function () {
                let laptop = JSON.parse(noi_dung_nhan);
                let ket_qua = { "Noi_dung": true };
                db.insertOne("laptop", laptop).then(result => {
                    console.log(result);
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua));
                }).catch(err => {
                    console.log(err);
                    ket_qua.Noi_dung = false;
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua));
                })
            })
        }else if (url == "/SuaLaptop") {
            req.on('end', function () {
                let laptop = JSON.parse(noi_dung_nhan);
                let ket_qua = { "Noi_dung": true };
                db.updateOne("laptop",laptop.condition,laptop.update).then(result=>{
                   console.log(result);
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua));
                }).catch(err=>{
                    console.log(err);
                    ket_qua.Noi_dung = false;
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua)) 
                })
            })
        }
else if (url == "/XoaLaptop") {
            req.on('end', function () {
                let laptop = JSON.parse(noi_dung_nhan);
                let ket_qua = { "Noi_dung": true };
                db.deleteOne("laptop",laptop).then(result=>{
                    console.log(result);
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua));
                }).catch(err=>{
                    console.log(err);
                    ket_qua.Noi_dung = false;
                    res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
                    res.end(JSON.stringify(ket_qua))
                })
                
            })

        } else if (url == "/ImagesLaptop") {
            req.on('end', function () {
                let img = JSON.parse(noi_dung_nhan);
                let Ket_qua = { "Noi_dung": true };
                imgCloud.UPLOAD_CLOUDINARY(img.name,img.src).then(result=>{
                    console.log(result);
                    res.end(JSON.stringify(Ket_qua));

                }).catch(err=>{
                    Ket_qua.Noi_dung=false
                    res.end(JSON.stringify(Ket_qua))
                })
                
            })

        }else if (url == "/ThemNguoidung") {
            req.on("end", () => {
                db.insertOne("nguoidung", JSON.parse(noi_dung_nhan)).then((result) => {
                    console.log(result);
                    ket_qua = JSON.stringify(result);
                    res.end(ket_qua)
                }).catch(err => console.log(err));
            })
        } else if (url == "/SuaNguoidung") {
            req.on("end", () => {
                let nguoidung = JSON.parse(noi_dung_nhan);
                db.updateOne("nguoidung", nguoidung.condition, nguoidung.update).then((result) => {
                    ket_qua = JSON.stringify(result);
                    res.end(ket_qua);
                }).catch(err => console.log(err));

            })
        } else if (url == "/XoaNguoidung") {
            req.on("end", () => {
                let nguoidung = JSON.parse(noi_dung_nhan);
                let filter = {
                    "Ma_so": nguoidung.Ma_so
                }
                db.deleteOne("nguoidung", filter).then((result) => {
                    ket_qua = JSON.stringify(result);
                    res.end(ket_qua);
                }).catch(err => console.log(err));
            })
        } else {
            res.end(ketqua);
        }

    } else {
        res.end(ketqua);
    }

})

dich_vu.listen(port, () => {
    console.log(`Service Runing http://localhost:${port}`)
})
const decodeBase64Image=(dataString)=>{
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Error ...');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

const saveMedia=(Ten, Chuoi_nhi_phan)=>{
    var Kq = "OK"
    try {
        var Nhi_phan = decodeBase64Image(Chuoi_nhi_phan);
        var Duong_dan = "images//" + Ten
        fs.writeFileSync(Duong_dan, Nhi_phan.data);
    } catch (Loi) {
        Kq = Loi.toString()
    }
    return Kq
}

