from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List, Optional
import os
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongo:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.equi_db

coll_subs = db.subscriptions
coll_users = db.users
coll_splits = db.splits

class Subscription(BaseModel):
    name: str
    price: int
    date: str 
    type: str
    owner_email: str 
    cost_for_me: Optional[int] = 0 
    shared_with: Optional[List[str]] = []
    paid_months: Optional[List[str]] = [] 

class User(BaseModel):
    email: str
    password: str
    name: str = "User"

class SplitMember(BaseModel):
    name: str
    amount: int
    is_paid: bool = False

class SplitTransaction(BaseModel):
    title: str
    total_amount: int
    members: List[SplitMember]
    date: str
    owner_email: str 
    linked_sub_id: Optional[str] = None 

class SplitRequest(BaseModel):
    total: int
    orang: int

@app.get("/")
def read_root():
    return {"message": "Equi Backend Ready! 🔥"}

@app.post("/api/register")
async def register(user: User):
    existing = await coll_users.find_one({"email": user.email})
    if existing: raise HTTPException(status_code=400, detail="Email exists")
    await coll_users.insert_one(user.dict())
    return {"status": "Success", "email": user.email}

@app.post("/api/login")
async def login(user: User):
    check = await coll_users.find_one({"email": user.email, "password": user.password})
    if not check: raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"status": "Success", "name": check["name"], "email": check["email"]}


@app.get("/api/subs")
async def get_subscriptions(email: str): 
    subs = []
    
    async for sub in coll_subs.find({"owner_email": email}):
        sub["id"] = str(sub["_id"])
        del sub["_id"]
        if "cost_for_me" not in sub or sub["cost_for_me"] == 0:
            sub["cost_for_me"] = sub["price"]
        subs.append(sub)
    return subs

@app.post("/api/subs")
async def add_subscription(sub: Subscription):
    new_sub = sub.dict()
    new_sub["cost_for_me"] = new_sub["price"]
    if not new_sub.get("paid_months"): new_sub["paid_months"] = []
    
    res = await coll_subs.insert_one(new_sub)
    new_sub["id"] = str(res.inserted_id)
    if "_id" in new_sub: del new_sub["_id"]
    return new_sub

@app.delete("/api/subs/{sub_id}")
async def delete_subscription(sub_id: str):
    await coll_subs.delete_one({"_id": ObjectId(sub_id)})
    return {"status": "Deleted"}

@app.put("/api/subs/{sub_id}/pay")
async def pay_subscription_month(sub_id: str, month: str = Query(..., description="Format YYYY-MM")):

    await coll_subs.update_one(
        {"_id": ObjectId(sub_id)},
        {"$addToSet": {"paid_months": month}} 
    )
    return {"status": "Paid"}


@app.get("/api/analytics")
async def get_analytics(email: str):
    pipeline = [
        {"$match": {"owner_email": email}}, 
        {
            "$group": {
                "_id": "$type",
                "total": {"$sum": {"$ifNull": ["$cost_for_me", "$price"]}},
                "count": {"$sum": 1}
            }
        },
        {"$project": {"type": "$_id", "total": 1, "count": 1, "_id": 0}}
    ]
    data = await coll_subs.aggregate(pipeline).to_list(length=None)
    if not data: return [{"type": "No Data", "total": 1}]
    return data


@app.get("/api/splits")
async def get_splits(email: str):
    splits = []
    async for s in coll_splits.find({"owner_email": email}).sort("_id", -1):
        s["id"] = str(s["_id"])
        del s["_id"]
        splits.append(s)
    return splits

@app.post("/api/splits")
async def add_split(split: SplitTransaction):
    new_split = split.dict()
    res = await coll_splits.insert_one(new_split)
    
    if split.linked_sub_id:
        share_per_person = int(split.total_amount / len(split.members))
        friend_names = [m.name for m in split.members if m.name != "Me"]
        await coll_subs.update_one(
            {"_id": ObjectId(split.linked_sub_id)},
            {"$set": {
                "cost_for_me": share_per_person,
                "shared_with": friend_names
            }}
        )

    new_split["id"] = str(res.inserted_id)
    if "_id" in new_split: del new_split["_id"]
    return new_split

@app.put("/api/splits/{split_id}/pay/{member_index}")
async def toggle_paid(split_id: str, member_index: int):
    split = await coll_splits.find_one({"_id": ObjectId(split_id)})
    if not split: return {"error": "Not found"}
    current = split["members"][member_index]["is_paid"]
    await coll_splits.update_one(
        {"_id": ObjectId(split_id)},
        {"$set": {f"members.{member_index}.is_paid": not current}}
    )
    return {"status": "Updated"}

@app.delete("/api/splits/{split_id}")
async def delete_split(split_id: str):
    split = await coll_splits.find_one({"_id": ObjectId(split_id)})
    if split and split.get("linked_sub_id"):
        sub = await coll_subs.find_one({"_id": ObjectId(split["linked_sub_id"])})
        if sub:
  
            await coll_subs.update_one(
                {"_id": ObjectId(split["linked_sub_id"])},
                {"$set": {"cost_for_me": sub["price"], "shared_with": []}}
            )
    await coll_splits.delete_one({"_id": ObjectId(split_id)})
    return {"status": "Deleted and Reset"}

@app.post("/api/calculate")
def hitung_split(data: SplitRequest):
    if data.orang <= 0: return {"error": "Invalid"}
    return {"total": data.total, "per_orang": data.total / data.orang}