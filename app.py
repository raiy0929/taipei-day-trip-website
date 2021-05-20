from flask import *
import os, json, traceback, config, threading
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
                # lock.acquire()
                cur.execute(f'select * from booking where email = "{email}" and status = 1 order by `orderID` DESC')
                result = cur.fetchone()
                # lock.release()

                if result == None:
                    resp =  jsonify({"data": None})
                else:
                    attrID = result[3]
                    # lock.acquire()
                    cur.execute(f'select * from attractions where attrID = "{attrID}"')
                    attrData = cur.fetchone()
                    # lock.release()

                    name = attrData[2]
                    address = attrData[8]
                    image = eval(attrData[5])[0]

                    order = result[0]
                    date = str(result[2])
                    time = result[4]
                    price = result[5]

                    data = {"attraction":{
                                "id":attrID,
                                "name":name,
                                "address":address,
                                "image":image,
                                },
                            "order":order,
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
                        cur.execute(f'Insert into booking (email, date, attrID, time, price, status) VALUES ("{email}", "{date}", {attrID}, "{time}", {price}, 1)')
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
                deleteID = data["orderID"]

                # lock.acquire()
                cur.execute(f'select status from `booking` where orderID = "{deleteID}" and email = "{email}"')
                result = cur.fetchone()
                # lock.release()
                print(result[0])

                if result[0] == 3:
                    resp =  jsonify({"error": True,
                        "message":"該訂單已取消"})
                elif result[0] == 2:
                    resp = jsonify({"error": True,
                        "message":"該訂單已付款，不可取消"})
                elif result[0] == 1:
                    # lock.acquire()
                    cur.execute(f'update `booking` set status = 3, cancelDate = NOW() where orderID = "{deleteID}" and email = "{email}"')
                    cnx.commit()
                    # lock.release()
                    resp = jsonify({"ok": True})
        cnx.close()
        return resp
    except:
        traceback.print_exc()
        cnx.close()
        return jsonify({"error": True,
                    "message": "伺服器內部錯誤"}), 500


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
                # lock.acquire()
                cur.execute(f'select * from booking where email = "{email}" order by `orderID` DESC')
                result = cur.fetchall()
                # lock.release()
                if result == None:
                    resp = jsonify({"data": None})
                else:
                    orders = []
                    for i in range(0,len(result)):
                        orderId = result[i][0]
                        date = str(result[i][2])
                        status = result[i][7]
                        fee = result[i][5]
                    
                        if status == 1:
                            status = '未付款'
                        elif status == 2:
                            status = '已付款'
                        elif status == 3:
                            status = '已取消'
                        print(status)
                        data = {
                            "orderId": orderId,
                            "date":date,
                            "status":status,
                            "fee":fee
                            }

                        orders.append(data)
                resp = jsonify({"data":orders})
        
        cnx.close()
        return resp
    except:
        cnx.close()
        return traceback.print_exc()


app.run(host="0.0.0.0",port=3000)