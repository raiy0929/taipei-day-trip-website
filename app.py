from flask import *
import pymysql
# import pymysql.cursors
import os
import json
import traceback

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

app.secret_key=os.urandom(12).hex()
print(app.secret_key)

db=pymysql.connect(host="127.0.0.1",user="debian-sys-maint",password="IuI9yAojfyFkRyFS",database="TravelWeb")
cur=db.cursor()

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

# 查詢景點 - page & keyword GET
@app.route("/api/attractions")
def getAttractions():
    try:
        page = int(request.args.get('page')) #取得前端頁數
        dataCount=[] 
        landCount = page*12

        # 判斷有keyword
        if request.args.get('keyword') != None: 
            keyword = '%'+request.args.get('keyword')+'%'
            # 取12個景點
            cur.execute('select * from attractions where title like "%s" order by attrId limit %s, 12' % (keyword, landCount)) 
            result=cur.fetchall()
            
            cur.execute('select * from attractions where title like "%s" order by attrId' % (keyword))
            count=cur.fetchall()
            print('全部的資料筆數',len(count))

            if len(result) == 0: # 該keyword無符合景點
                return jsonify({
                    "error":True,
                    "message":"查無相關景點"
                })

            else: # 景點有相關字 先判斷頁數
                if len(count)-landCount > 12:  # 資料筆數減掉從頭至頁面的筆數
                    nextPage = page+1
                    print('頁數', nextPage)
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
                return json.dumps(allLand,ensure_ascii=False)

        else: # 沒keyword 傳所有資料
            cur.execute('select * from attractions order by attrId limit %s, 12' % (landCount)) 
            result=cur.fetchall()

            cur.execute('select * from attractions order by attrId')
            count=cur.fetchall()
            print('全部的資料筆數',len(count))

            if len(count)-landCount > 12:  # 頁數
                nextPage = page+1
                print('頁數',nextPage)
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
            return json.dumps(allLand,ensure_ascii=False)
    except:
        traceback.print_exc()
        return json.dumps({
            "error": True,
             "message": "伺服器內部錯誤"
            }),500


# 之後要測試練習把函式切開來寫

# 根據景點編號取得景點資料 GET
@app.route("/api/attraction/<attractionId>")
def idGetAttr(attractionId):
    try:
        attractionId = int(attractionId)
        cur.execute('select * from attractions where attrID = %s' % attractionId)
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
            print(land)
            return json.dumps(land)

        elif result == None: # 沒有該景點
            return json.dumps({
                "error": True,
                "message": "景點編號錯誤"
                }),400

    except:
        traceback.print_exc()
        return json.dumps(
            {"error": True,
              "message": "伺服器內部錯誤"
              }),500



app.run(host="0.0.0.0",port=3000)