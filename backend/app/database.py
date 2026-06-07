import json
import sqlite3
import os
import uuid
import logging
from typing import Dict, List, Any, Optional
from backend.app.config import settings

logger = logging.getLogger("talentai.database")
logging.basicConfig(level=logging.INFO)

class SQLiteCollection:
    """Mimics MongoDB collection interface using SQLite JSON storage."""
    def __init__(self, db_path: str, collection_name: str):
        self.db_path = db_path
        self.name = collection_name
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.name} (
                id TEXT PRIMARY KEY,
                data TEXT
            )
        """)
        conn.commit()
        conn.close()

    def _match_query(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        if not query:
            return True
        for k, v in query.items():
            if k == "_id":
                if doc.get("_id") != v:
                    return False
            elif isinstance(v, dict):
                # Simple operator checks
                val = doc.get(k)
                if "$in" in v:
                    if val not in v["$in"]:
                        return False
                elif "$eq" in v:
                    if val != v["$eq"]:
                        return False
            else:
                if doc.get(k) != v:
                    return False
        return True

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(f"SELECT data FROM {self.name}")
        rows = cursor.fetchall()
        conn.close()

        for row in rows:
            doc = json.loads(row[0])
            if self._match_query(doc, query):
                return doc
        return None

    def find(self, query: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        if query is None:
            query = {}
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(f"SELECT data FROM {self.name}")
        rows = cursor.fetchall()
        conn.close()

        results = []
        for row in rows:
            doc = json.loads(row[0])
            if self._match_query(doc, query):
                results.append(doc)
        return results

    def insert_one(self, document: Dict[str, Any]) -> Dict[str, Any]:
        doc = document.copy()
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4())
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            f"INSERT INTO {self.name} (id, data) VALUES (?, ?)",
            (doc["_id"], json.dumps(doc))
        )
        conn.commit()
        conn.close()
        return doc

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> bool:
        doc = self.find_one(query)
        if not doc:
            return False

        # Apply update
        if "$set" in update:
            for k, v in update["$set"].items():
                doc[k] = v

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            f"UPDATE {self.name} SET data = ? WHERE id = ?",
            (json.dumps(doc), doc["_id"])
        )
        conn.commit()
        conn.close()
        return True

    def delete_one(self, query: Dict[str, Any]) -> bool:
        doc = self.find_one(query)
        if not doc:
            return False

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(f"DELETE FROM {self.name} WHERE id = ?", (doc["_id"],))
        conn.commit()
        conn.close()
        return True

    def count_documents(self, query: Dict[str, Any]) -> int:
        return len(self.find(query))


class MongoCollectionWrapper:
    """Wraps PyMongo collection to return _id as string and provide a consistent interface."""
    def __init__(self, collection):
        self.collection = collection

    def _convert_id(self, doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if doc and "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return doc

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        from bson.objectid import ObjectId
        q = query.copy()
        if "_id" in q and isinstance(q["_id"], str):
            try:
                q["_id"] = ObjectId(q["_id"])
            except Exception:
                pass
        doc = self.collection.find_one(q)
        return self._convert_id(doc)

    def find(self, query: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        if query is None:
            query = {}
        from bson.objectid import ObjectId
        q = query.copy()
        if "_id" in q and isinstance(q["_id"], str):
            try:
                q["_id"] = ObjectId(q["_id"])
            except Exception:
                pass
        cursor = self.collection.find(q)
        return [self._convert_id(doc) for doc in cursor]

    def insert_one(self, document: Dict[str, Any]) -> Dict[str, Any]:
        doc = document.copy()
        res = self.collection.insert_one(doc)
        doc["_id"] = str(res.inserted_id)
        return doc

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> bool:
        from bson.objectid import ObjectId
        q = query.copy()
        if "_id" in q and isinstance(q["_id"], str):
            try:
                q["_id"] = ObjectId(q["_id"])
            except Exception:
                pass
        res = self.collection.update_one(q, update)
        return res.modified_count > 0

    def delete_one(self, query: Dict[str, Any]) -> bool:
        from bson.objectid import ObjectId
        q = query.copy()
        if "_id" in q and isinstance(q["_id"], str):
            try:
                q["_id"] = ObjectId(q["_id"])
            except Exception:
                pass
        res = self.collection.delete_one(q)
        return res.deleted_count > 0

    def count_documents(self, query: Dict[str, Any]) -> int:
        from bson.objectid import ObjectId
        q = query.copy()
        if "_id" in q and isinstance(q["_id"], str):
            try:
                q["_id"] = ObjectId(q["_id"])
            except Exception:
                pass
        return self.collection.count_documents(q)


class Database:
    def __init__(self):
        self.use_mongo = False
        self.db = None
        self.mongo_client = None
        
        if settings.MONGODB_URI:
            try:
                from pymongo import MongoClient
                self.mongo_client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
                # Force a connection check
                self.mongo_client.server_info()
                self.db = self.mongo_client[settings.DATABASE_NAME]
                self.use_mongo = True
                logger.info("Successfully connected to MongoDB.")
            except Exception as e:
                logger.warning(f"Could not connect to MongoDB: {e}. Falling back to SQLite local document store.")
        
        if not self.use_mongo:
            logger.info(f"Initializing local SQLite fallback database at: {settings.LOCAL_DB_PATH}")
            self.sqlite_db_path = settings.LOCAL_DB_PATH

    def get_collection(self, name: str):
        if self.use_mongo:
            return MongoCollectionWrapper(self.db[name])
        else:
            return SQLiteCollection(self.sqlite_db_path, name)

# Global database instance
db_instance = Database()

def get_db():
    return db_instance
