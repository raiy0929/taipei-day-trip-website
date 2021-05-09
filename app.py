from flask import *
import pymysql
import pymysql.cursors
import os, json, traceback, config
import pymysqlpool


app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config.from_pyfile('config.py')
USER=app.config["DB_USER"]
PASSWORD=app.config["DB_PASSWORD"]
REMOTE_USER=app.config["REMOTE_DB_USER"]
REMOTE_PASSWORD=app.config["REMOTE_DB_PASSWORD"]

app.secret_key=os.urandom(12).hex()

db=pymysql.connect(host="127.0.0.1",user=USER,password=PASSWORD,database="TravelWeb")
# db=pymysql.connect(host="127.0.0.1",user=REMOTE_USER,password=REMOTE_PASSWORD,database="TravelWeb")
cur=db.cursor()

'''確認資料庫連線'''
def check_connection():
    
    sql="select * from attractions where id = 1"
    while True:
        try:
            cur.execute(sql)
            break
            # return cur, db
        except pymysql.err.InterfaceError as e :
            db.ping(reconnect=True)

check_connection()


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

# 練習 會員頁
@app.route("/member")
def member():
    return render_template("member.html")


# 查詢景點 - page & keyword GET
@app.route("/api/attractions")
def getAttractions():
    try:
        page = int(request.args.get('page')) #取得前端頁數
        dataCount=[] 
        landCount = page*12

        # 判斷有keyword
        if request.args.get('keyword') != None: 
            keyword = request.args.get('keyword')
            # 取12個景點
            
            cur.execute(f'select * from attractions where title like "%{keyword}%" order by attrId limit {landCount},12') 
            result=cur.fetchall()

            
            cur.execute(f'select * from attractions where title like "%{keyword}%"')
            count=cur.fetchall()

            if len(result) == 0: # 該keyword無符合景點
                return jsonify({
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
                return jsonify(allLand)

        else: # 沒keyword 傳所有資料
            cur.execute(f'select * from attractions order by attrId limit {landCount}, 12') 
            result=cur.fetchall()

            cur.execute('select * from attractions')
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
            return jsonify(allLand)
    except:
        traceback.print_exc()
        return jsonify({
            "error": True,
             "message": "伺服器內部錯誤"
            }),500

# 之後要測試練習把函式切開來寫

# 根據景點編號取得景點資料 GET
@app.route("/api/attraction/<attractionId>")
def idGetAttr(attractionId):
    try:
        attractionId = int(attractionId)
        cur.execute(f'select * from attractions where attrID = {attractionId}')
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
            
            return jsonify(land)

        elif result == None: # 沒有該景點
            return jsonify({
                "error": True,
                "message": "景點編號錯誤"
                }),400

    except:
        traceback.print_exc()
        return jsonify({
                "error": True,
                "message": "伺服器內部錯誤"
                }),500



@app.route("/api/user", methods=["GET", "POST", "DELETE", "PATCH"])
def user():
    try:
        if request.method == "POST": # register event
            data = request.get_json()
            email = data["email"]
            name = data["name"]
            password = data["password"]
            print(email, name, password)
            if email == "" or name == "" or password == "":
                return jsonify({"error": True, "message": "輸入框不可為空"}), 400
            else:
                cur.execute(f'select * from member where email = "{email}"')
                result = cur.fetchone()
                if result != None:
                    return jsonify({"error": True, "message": "email已被使用"}),400
                else :
                    cur.execute(f'Insert into member (name, email, password) VALUES ("{name}", "{email}", "{password}")')
                    db.commit()
                    cur.execute(f'select * from member where email = "{email}"')
                    check_register = cur.fetchone()
                    if check_register != None:
                        return jsonify({"ok":True}),200
                    else :
                        return jsonify({"error": True, "message": "註冊失敗，請重新註冊"}),400

        elif request.method == "PATCH": # login event
            data = request.get_json()
            email = data["email"]
            password = data["password"]
            cur.execute(f'select * from member where email = "{email}"')
            result = cur.fetchone()
            if  password == result[3]:
                cur.execute(f'update member set `logining` = 1 where email = "{email}"') #  change DB login status
                db.commit()
                resp = jsonify({"ok": True})
                resp.set_cookie('user', email, max_age=86400)

                # session["email"]=email
                return resp
            elif password != result[3]:
                return jsonify({"error": True, "message": "登入失敗，帳號、密碼錯誤"}),400

        elif request.method == "GET": # Get user profile auto fetch
            email = request.cookies.get("user")
            if email != None:
                cur.execute(f'select * from member where email = "{email}" ')
                result = cur.fetchone()
                memberId = result[0]
                name = result[1]
                return jsonify({
                        "data":{
                            "id":memberId,
                            "name":name,
                            "email":email
                        }
                    })
            else :
                return None
        
        elif request.method == "DELETE": # login out
            email = request.cookies.get("user")
            cur.execute(f'update member set logining = 2 where email = "{email}"')
            db.commit()
            resp = jsonify({"ok":True})
            resp.delete_cookie("user")
            cur.execute(f'select * from member where email = "{email}"')
            result = cur.fetchone()
            return resp
            

    except:
        traceback.print_exc()
        return jsonify({"error": True, "message": "伺服器內部錯誤"}),500


app.run(host="0.0.0.0",port=3000)