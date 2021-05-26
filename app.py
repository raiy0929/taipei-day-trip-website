from flask import *
import os, json, traceback, config, threading, requests, datetime, random
from datetime import date
import mysql.connector
from mysql.connector import pooling


app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config.from_pyfile('config.py')
USER=app.config["DB_USER"]
PASSWORD=app.config["DB_PASSWORD"]


app.secret_key=os.urandom(12).hex()

dbconfig = { 
    "host":"127.0.0.1",
    "user":USER,
    "password":PASSWORD,
    "database":"TravelWeb",
    "buffered":True
    }

dbpool=mysql.connector.pooling.MySQLConnectionPool(pool_name = 'pool', pool_size = 10, **dbconfig)

# Pages
@app.route("/")
def index():
    return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
    return render_template("attraction.html")
@app.route("/booking")
def booking():
    return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
    return render_template("thankyou.html")

# member page
@app.route("/member")
def member(): 
    return render_template("member.html")

@app.route("/booking/<cartid>")
def otherBooking(cartid):
    return render_template("booking.html")


# 查詢景點 - page & keyword GET
@app.route("/api/attractions")
def getAttractions():
    cnx = dbpool.get_connection()
    cur = cnx.cursor()
    try:
        page = int(request.args.get('page')) #取得前端頁數
        dataCount=[] 
        landCount = page*12

        # 判斷有keyword
        if request.args.get('keyword') != None: 
            keyword = request.args.get('keyword')
            # 取12個景點
            # lock.acquire()
            cur.execute(f'select * from attractions where title like "%{keyword}%" order by attrId limit {landCount},12') 
            # lock.release()
            result=cur.fetchall()

            # lock.acquire()
            cur.execute(f'select * from attractions where title like "%{keyword}%"')
            # lock.release()
            count=cur.fetchall()

            if len(result) == 0: # 該keyword無符合景點
                resp =  jsonify({
                    "error":True,
                    "message":"查無相關景點"
                })

            else: # 景點有相關字 先判斷頁數
                if len(count)-landCount > 12:  # 資料筆數減掉從頭至頁面的筆數
                    nextPage = page+1
                else:
                    nextPage = None
                # 處理符合的景點資料
                land=[]
                for i in result: #取得每個符合關鍵字的景點資料為i i為tuple
                    landPhoto=eval(i[5]) #處理景點圖片 landPhoto是list
                    datas = {  # 拿個別資料
                        "id":i[0],
                        "name":i[2],
                        "category":i[4],
                        "description":i[7],
                        "address":i[8],
                        "transport":i[9],
                        "mrt":i[3],
                        "latitude":i[10],
                        "longitude":i[11],
                        "images":landPhoto
                    }
                    land.append(datas)
                allLand = {
                    "nextPage": nextPage,
                    "data":land
                }
                resp =  jsonify(allLand)
            cnx.close()
            return resp

        else: # 沒keyword 傳所有資料
            # lock.acquire()
            cur.execute(f'select * from attractions order by attrId limit {landCount}, 12') 
            # lock.release()
            result=cur.fetchall()

            # lock.acquire()
            cur.execute('select * from attractions')
            # lock.release()
            count=cur.fetchall()

            if len(count)-landCount > 12:  # 頁數
                nextPage = page+1
            else:
                nextPage = None
            
            land=[]
            for i in result: 
                landPhoto=eval(i[5]) #處理景點圖片
                datas = {  # 拿個別資料
                    "id":i[0],
                    "name":i[2],
                    "category":i[4],
                    "description":i[7],
                    "address":i[8],
                    "transport":i[9],
                    "mrt":i[3],
                    "latitude":i[10],
                    "longitude":i[11],
                    "images":landPhoto
                    }
                land.append(datas)
            allLand = {
                "nextPage": nextPage,
                "data":land
            }
            cnx.close()
            return jsonify(allLand)
    except:
        traceback.print_exc()
        cnx.close()
        return jsonify({
            "error": True,
             "message": "伺服器內部錯誤"
            }),500

# 之後要測試練習把函式切開來寫

# 根據景點編號取得景點資料 GET
@app.route("/api/attraction/<attractionId>")
def idGetAttr(attractionId):
    cnx = dbpool.get_connection()
    cur = cnx.cursor()
    try:
        attractionId = int(attractionId)
        # lock.acquire()
        cur.execute(f'select * from attractions where attrID = {attractionId}')
        # lock.release()
        result=cur.fetchone()
        if result != None: #有該景點
            landPhoto=eval(result[5]) #處理景點圖片
            datas = {
                "id":result[0],
                "name":result[2],
                "category":result[4],
                "description":result[7],
                "address":result[8],
                "transport":result[9],
                "mrt":result[3],
                "latitude":result[10],
                "longitude":result[11],
                "images":landPhoto }
            land={'data':datas}
            
            resp =  jsonify(land)

        elif result == None: # 沒有該景點
            resp =  jsonify({
                "error": True,
                "message": "景點編號錯誤"
                }),400
        cnx.close()
        return resp
    except:
        traceback.print_exc()
        cnx.close()
        return jsonify({
                "error": True,
                "message": "伺服器內部錯誤"
                }),500



@app.route("/api/user", methods=["GET", "POST", "DELETE", "PATCH"])
def user():
    cnx = dbpool.get_connection()
    cur = cnx.cursor()
    try:
        if request.method == "POST": # register event
            data = request.get_json()
            email = data["email"]
            name = data["name"]
            password = data["password"]
            birth = data["birth"]
            if email == "" or name == "" or password == "":
                resp =  jsonify({"error": True, "message": "輸入框不可為空"}), 400
            else:
                # lock.acquire()
                cur.execute(f'select * from member where email = "{email}"')
                # lock.release()
                result = cur.fetchone()
                if result != None:
                    resp = jsonify({"error": True, "message": "email已被使用"}),400
                else :
                    # lock.acquire()
                    cur.execute(f'Insert into member (name, email, password, birthday) VALUES ("{name}", "{email}", "{password}", "{birth}")')
                    cnx.commit()
                    # lock.release()
                    
                    # lock.acquire()
                    cur.execute(f'select * from member where email = "{email}"')
                    # lock.release()

                    check_register = cur.fetchone()
                    if check_register != None:
                        resp =  jsonify({"ok":True,"message":"註冊成功！請至登入頁面登入"}),200
                    else :
                        resp =  jsonify({"error": True, "message": "註冊失敗，請重新註冊"}),400
        
        elif request.method == "PATCH": # login event
            data = request.get_json()
            email = data["email"]
            password = data["password"]
            if email != None and password != None:
                # lock.acquire()
                cur.execute(f'select * from member where email = "{email}"')
                # lock.release()
                result = cur.fetchone()
                if result == None:
                    resp =  jsonify({"error": True, "message": "登入失敗，帳號、密碼錯誤"}),400
                else:
                    if  password == result[3]:
                        # lock.acquire()
                        cur.execute(f'update member set `logining` = 1 where email = "{email}"')
                        # lock.release() #  change DB login status
                        cnx.commit()
                        session['user'] = email
                        resp =  jsonify({"ok": True,"message": "登入成功，請等待網頁跳轉"})
                    else:
                        resp =  jsonify({"error": True, "message": "登入失敗，帳號、密碼錯誤"}),400
            elif email == None or password == None:
                resp =  jsonify({"error":True,"message":"帳號、密碼不可為空"}),400
            
        elif request.method == "GET": # Get user profile auto fetch
            
            if 'user' in session:
                email = session['user']
                # lock.acquire()
                cur.execute(f'select * from member where email = "{email}" ')
                # lock.release()
                result = cur.fetchone()
                memberId = result[0]
                name = result[1]
                birth = str(result[6])
                resp =  jsonify({
                        "data":{
                            "id":memberId,
                            "name":name,
                            "email":email,
                            "birth":birth,
                        }
                    })
            else :
                resp =  jsonify({"data":None})
        
        elif request.method == "DELETE": # login out
            email = session['user']
            # lock.acquire()
            cur.execute(f'update member set logining = 2 where email = "{email}"')
            # lock.release()
            cnx.commit()
        
            session.pop('user', None)
            resp =  jsonify({"ok":True})
        cnx.close()
        return resp
        
    except:
        traceback.print_exc()
        cnx.close()
        return jsonify({"error": True, "message": "伺服器內部錯誤"}),500



@app.route("/api/booking", methods=["GET", "POST", "DELETE"])
def goBooking():
    cnx = dbpool.get_connection()
    cur = cnx.cursor()
    try:
        
        if 'user' not in session :
            resp =  jsonify({"error": True,
                            "message": "請先登入系統"}), 403
        else:
            email = session['user']
            if request.method == "GET":
                cur.execute(f'select * from booking where email = "{email}" and status = 2 order by `cartID` DESC')
                result = cur.fetchone()

                if result == None:
                    resp =  jsonify({"data": None})
                else:
                    attrID = result[3]
                    cur.execute(f'select * from attractions where attrID = "{attrID}"')
                    attrData = cur.fetchone()

                    name = attrData[2]
                    address = attrData[8]
                    image = eval(attrData[5])[0]

                    cartID = result[0]
                    date = str(result[2])
                    time = result[4]
                    price = result[5]

                    data = {"attraction":{
                                "id":attrID,
                                "name":name,
                                "address":address,
                                "image":image,
                                },
                            "cartID":cartID,
                            "date":date,
                            "time":time,
                            "price":price,
                            }

                    resp = jsonify({"data":data})
                    
                    
            elif request.method == "POST":
                data = request.get_json()
                attrID = data["attractionId"]
                date = data["date"]
                time = data["time"]
                price = data["price"]

                if email == None :
                    resp = jsonify({"error": True,
                                    "message": "請先登入系統"
                                    }), 403
                else:
                    if attrID == '' or date == '' or time == '' or price == '':
                        resp = jsonify({"error": True,
                                        "message": "建立訂單錯誤"}), 400
                    else :
                        print(attrID, date, time, price)
                        # lock.acquire()
                        cur.execute(f'Insert into booking (email, date, attrID, time, price, status) VALUES ("{email}", "{date}", {attrID}, "{time}", {price}, 2)')
                        cnx.commit()
                        # lock.release()  

                        # lock.acquire()
                        cur.execute(f'select * from booking where email = "{email}"')
                        result = cur.fetchall()
                        # lock.release()
                        if result != None:
                            # 還得想最新的資料怎麼判斷 如果有同樣的帳號 是否判定只能待存一筆？
                            resp = jsonify({"ok": True})

            elif request.method == "DELETE":
                data = request.get_json()
                deleteID = data["cartID"]
                
                cur.execute(f'select status from `booking` where cartID = "{deleteID}" and email = "{email}"')
                result = cur.fetchone()
                
                if result[0] == 3:
                    resp =  jsonify({"error": True,
                        "message":"該訂單已取消"})
                elif result[0] == 1:
                    resp = jsonify({"error": True,
                        "message":"該訂單已付款，不可取消"})
                elif result[0] == 2:
                    
                    cur.execute(f'update `booking` set status = 3, cancelDate = NOW() where cartID = "{deleteID}" and email = "{email}"')
                    cnx.commit()
                    
                    resp = jsonify({"ok": True})
        cnx.close()
        return resp
    except:
        traceback.print_exc()
        cnx.close()
        return jsonify({"error": True,
                    "message": "伺服器內部錯誤"}), 500


@app.route("/api/booking/<cartID>")
def goCartID(cartID):
    cnx = dbpool.get_connection()
    cur = cnx.cursor()

    cur.execute(f'select * from booking where cartID = "{cartID}"')
    result = cur.fetchone()

    if result == None or result[7] == 3:
        resp =  jsonify({"data": None})

    elif result[7] == 1:
        resp =  jsonify({
            "error": True,
            "message":"該訂單已付款"
            })

    else:
        attrID = result[3]
        cur.execute(f'select * from attractions where attrID = "{attrID}"')
        attrData = cur.fetchone()

        name = attrData[2]
        address = attrData[8]
        image = eval(attrData[5])[0]

        cartID = result[0]
        date = str(result[2])
        time = result[4]
        price = result[5]

        data = {"attraction":{
                    "id":attrID,
                    "name":name,
                    "address":address,
                    "image":image,
                    },
                "cartID":cartID,
                "date":date,
                "time":time,
                "price":price,
                }

        resp = jsonify({"data":data})
    return resp


@app.route("/api/order", methods=["POST"])
def payOrder():
    cnx = dbpool.get_connection()
    cur = cnx.cursor()
    try:
        if 'user' not in session :
            resp =  jsonify({"error": True,
                "message": "請先登入系統"}), 403
        else:
            data = request.get_json()
            
            prime = data["prime"]
            price = data["order"]["price"]

            x = json.dumps(data)

            #attr
            order_attrID = data["order"]["trip"]["attraction"]["id"]
            cartID = data["cartID"]

            # contact
            card_name = data["contact"]["card_name"]
            card_email = data["contact"]["card_email"]
            card_phone = data["contact"]["card_phone"]
            
            number = getNumber()

            sql = 'insert into `pay` (number, name, email, phone, attrID, prime_data, status) VALUES (%s, %s, %s, %s, %s, %s, 4)'
            cur.execute(sql,(number, card_name, card_email,card_phone, order_attrID, x))
            cnx.commit()

            sql_2 = 'update `booking` set `number` = %s where cartID = %s'
            val_2 = (number, cartID)
            cur.execute(sql_2, val_2)
            cnx.commit()

            req_body = {
                "prime":prime, 
                "partner_key":"partner_kHpVxfsaupe9KpxwCOMLJ8qZWrFiOz8olT7wTmBZ1RKN9HqV7nkO7X3Q",
                "merchant_id":"agnes0121_CTBC",
                "details":"tappay test",
                "amount":price, 
                "cardholder":{
                    "name":card_name, 
                    "phone_number":card_phone,
                    "email":card_email
                }
            }

            result = payFetch(req_body, number)

            resp = payResult(result, number)

            cnx.close()
            return jsonify(resp)
            # return '123'
            
    except:
        traceback.print_exc()
        cnx.close()
        return jsonify({"error": True,
                "message": "伺服器內部錯誤"}), 500


@app.route("/api/order/<orderNumber>", methods=["GET"])
def finishOrder(orderNumber):
    cnx = dbpool.get_connection()
    cur = cnx.cursor()

    if 'user' not in session :
            resp =  jsonify({"error": True,
                "message": "請先登入系統"}), 403
    else:
        cur.execute(f'select attrID, prime_data from `pay` where number ={orderNumber} and status = 1')
        result = cur.fetchone()

        if result != None:
            order_data = json.loads(result[1])
            resp = jsonify({
                "data":{
                    "number":orderNumber,
                    "price":order_data["order"]["price"],
                    "trip":{
                        "attraction":{
                            "id":order_data["order"]["trip"]["attraction"]["id"],
                            "name":order_data["order"]["trip"]["attraction"]["name"],
                            "address":order_data["order"]["trip"]["attraction"]["address"],
                            "image":order_data["order"]["trip"]["attraction"]["image"]
                        },
                    
                        "date":order_data["order"]["trip"]["date"],
                        "time":order_data["order"]["trip"]["time"],
                        },
                
                    "contact":{
                        "name":order_data["contact"]["card_name"],
                        "email":order_data["contact"]["card_email"],
                        "phone":order_data["contact"]["card_phone"],
                    },
                    "status":1
                    },
                })

        elif result == None:
            resp = jsonify({
                "error":True,
                "message":"該訂單不存在或尚未付款，請聯繫客服"
            }),400

            # resp = None

        cnx.close()
    return resp


@app.route("/api/allOrder", methods=["GET"])
def getAllOrder():
    cnx = dbpool.get_connection()
    cur = cnx.cursor()
    try:
        if 'user' not in session :
            resp =  jsonify({"error": True,
                            "message": "請先登入系統"}), 403
        else:
            email = session['user']
            if request.method == "GET":

                cur.execute(f'select * from booking where email = "{email}" order by `cartID` DESC')
                result = cur.fetchall()

                if result == None:
                    resp = jsonify({"data": None})
                else:
                    orders = []
                    for i in range(0,len(result)):
                        number = result[i][9]
                        date = str(result[i][2])
                        status = result[i][7]
                        fee = result[i][5]
                        cartID = result[i][0]

                        attrID = result[i][3]
                        cur.execute(f'select title from attractions where attrID = "{attrID}"')
                        attr = cur.fetchone()[0]
                    
                        if status == 1:
                            status = '已付款'
                        elif status == 2:
                            status = '未付款'
                        elif status == 3:
                            status = '已取消'
                        
                        data = {
                            "number": number,
                            "date":date,
                            "title":attr,
                            "status":status,
                            "fee":fee,
                            "cartID":cartID
                            }

                        orders.append(data)
                resp = jsonify({"data":orders})
        
        cnx.close()
        return resp
    except:
        cnx.close()
        return traceback.print_exc()


############
### func ###
############

# deal api to third party
def payFetch(req_body ,number):
    cnx = dbpool.get_connection()
    cur = cnx.cursor()

    url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"

    headers = {
            "Content-Type": "application/json",
            "x-api-key":"partner_kHpVxfsaupe9KpxwCOMLJ8qZWrFiOz8olT7wTmBZ1RKN9HqV7nkO7X3Q"
        }

    db_data = json.dumps(req_body)

    result = requests.post(url, headers=headers, json=req_body)

    sql = 'update `pay` set `back_req`= %s where number = %s'
    val = (db_data, number)
    cur.execute(sql, val)
    cnx.commit()

    tap_resp = result.json()

    cnx.close()
    return tap_resp
    
# deal third party response
def payResult(data, number):
    cnx = dbpool.get_connection()
    cur = cnx.cursor()

    db_data = json.dumps(data)
    
    # 付款成功
    if data["status"] == 0:

        sql = 'update `pay` set `status` = 1, `third_party_res` = %s where number = %s'
        val = (db_data, number)
        cur.execute(sql, val)
        cnx.commit()

   
        cur.execute(f'update `booking` set `status` = 1 where number = "{number}"')
        cnx.commit()
        

        resp = {
            "data":{
                "number":number,
                "payment":{
                    "status":0,
                    "message":"付款成功"
                }
            }
        }

    elif data["status"] != 0:

        sql = 'update `pay` set `status` = 2, `third_party_res` = %s where number = %s'
        val = (db_data, number)
        cur.execute(sql, val)
        cnx.commit()

        resp = {
            "error":True,
            "message":"付款失敗，請重新付款"
        }
    
    cnx.close()
    return resp


# create order number
def getNumber():
    cnx = dbpool.get_connection()
    cur = cnx.cursor()

    today = date.today()
    d1 = today.strftime("%Y%m%d")
    x = str(random.randint(0, 3000) )
    number = d1+ '00' + x

    cur.execute(f'select number from `pay` where number = "{number}"')
    result = cur.fetchone()
    cnx.close()
    if result == None:
        return number
    else:
        getNumber()





app.run(host="0.0.0.0",port=3000)